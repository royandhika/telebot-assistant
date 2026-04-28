import io
import json
import polars as pl
import matplotlib.pyplot as plt
from datetime import datetime
from fastapi import UploadFile, HTTPException
from logger import get_logger
from database import get_ch_client, minio_client
from cuid2 import Cuid
import config

logger = get_logger()
cuid_generator = Cuid(length=24)

async def process_upload(table_name: str, file: UploadFile):
    """
    Main orchestration for processing file upload.
    """
    try:
        contents = await file.read()
        
        # 1. Parsing: Dapatkan data mentah saja
        df = _parse_to_df(file.filename, contents)
        
        # 2. ClickHouse Operation: Kirim data mentah + metadata secara terpisah
        actual_table_name = _upload_to_clickhouse(table_name, df, file.filename)
        
        # 3. MinIO Archiving
        s3_path, minio_filename = _archive_to_minio(file.filename, contents, file.content_type)
        
        return {
            "status": "success",
            "message": f"Data uploaded to ClickHouse table '{actual_table_name}' and archived to MinIO",
            "table_name": actual_table_name,
            "s3_path": s3_path,
            "filename": minio_filename,
            "rows": df.height
        }
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        logger.error(f"❌ Processing Error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

def _parse_to_df(filename: str, contents: bytes) -> pl.DataFrame:
    """Internal helper to parse bytes to raw DataFrame with all columns as strings."""
    file_ext = filename.split('.')[-1].lower() if filename and '.' in filename else ""
    
    try:
        if file_ext == 'csv':
            # infer_schema_length=0 makes everything Utf8 (String)
            df = pl.read_csv(io.BytesIO(contents), infer_schema_length=0)
        elif file_ext in ['xlsx', 'xls']:
            # Using infer_schema_length=0 to keep all as strings
            df = pl.read_excel(io.BytesIO(contents), infer_schema_length=0)
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format. Use CSV or XLSX.")
    except Exception as e:
        logger.error(f"❌ Parser Error: {str(e)}")
        raise HTTPException(status_code=422, detail=f"Failed to parse file: {str(e)}")
    
    # Normalize headers to snake_case (lowercase and replace spaces with underscores)
    df = df.rename({col: col.lower().replace(" ", "_") for col in df.columns})
    
    logger.info(f"✅ Raw data loaded into memory: {df.height} rows.")
    return df

def _upload_to_clickhouse(table_name: str, df: pl.DataFrame, filename: str) -> str:
    """Internal helper to handle ClickHouse table creation and data insertion using schema-free landing."""
    ch_client = get_ch_client()
    
    # Extract extension from filename
    extension = filename.split('.')[-1].lower() if filename and '.' in filename else "unknown"
    raw_table_name = f"{table_name}__raw_{extension}"
    
    create_query = f"""
    CREATE TABLE IF NOT EXISTS `{raw_table_name}` (
        `id` String,
        `payload` String,
        `file_name` String,
        `ingested_at` DateTime DEFAULT now()
    ) ENGINE = MergeTree()
    ORDER BY (id, ingested_at)
    """
    logger.debug(f"🛠️ Ensuring table exists: {create_query}")
    ch_client.command(create_query)

    logger.info(f"🔗 Encoding rows to JSON and adding metadata...")
    
    # Langsung ubah DataFrame mentah menjadi list of JSON strings
    payloads = [json.dumps(record) for record in df.to_dicts()]
    ids = [cuid_generator.generate() for _ in range(df.height)]
    
    # Buat landing DataFrame final
    landing_df = pl.DataFrame({
        'id': ids,
        'payload': payloads,
        'file_name': filename,
    })

    logger.info(f"🚀 Uploading {landing_df.height} schema-free records to ClickHouse table '{raw_table_name}'...")
    # clickhouse-connect natively supports pandas, so we convert at the boundary
    ch_client.insert_df(raw_table_name, landing_df.to_pandas())
    
    return raw_table_name

def _archive_to_minio(filename: str, contents: bytes, content_type: str):
    """Internal helper to handle MinIO archiving."""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    minio_filename = f"{timestamp}_{filename}"
    
    minio_client.put_object(
        config.MINIO_BUCKET,
        minio_filename,
        io.BytesIO(contents),
        length=len(contents),
        content_type=content_type or 'application/octet-stream'
    )

    s3_path = f"s3://{config.MINIO_BUCKET}/{minio_filename}"
    logger.info(f"📁 File archived to MinIO: {s3_path}")
    return s3_path, minio_filename

def get_table_data(table_name: str, limit: int):
    """Fetches raw data and total row count from ClickHouse."""
    ch_client = get_ch_client()
    
    # Fetch data
    df_pd = ch_client.query_df(f"SELECT * FROM `{table_name}` LIMIT {limit}")
    
    # Fetch total count
    count_res = ch_client.query(f"SELECT count() FROM `{table_name}`")
    total_rows = count_res.result_rows[0][0] if count_res.result_rows else 0
    
    return pl.from_pandas(df_pd), total_rows

def generate_table_image(df: pl.DataFrame, total_rows: int, table_name: str):
    """Generates a polished PNG image with metadata (types and total count)."""
    df_preview = df.head(15)
    
    def truncate_text(text, max_len=45):
        s = str(text)
        return (s[:max_len] + "...") if len(s) > max_len else s

    # Map Polars types to friendly names
    type_map = {
        pl.Utf8: "String",
        pl.Int64: "Int64",
        pl.Float64: "Float64",
        pl.Boolean: "Bool",
        pl.Datetime: "DateTime",
        pl.Date: "Date"
    }

    columns = df_preview.columns
    # Create column labels with types: "col_name\n[Type]"
    col_labels = []
    for col in columns:
        dtype = df.schema[col]
        type_name = type_map.get(dtype, str(dtype).split('.')[-1])
        col_labels.append(f"{col}\n[{type_name}]")

    data = []
    for row_dict in df_preview.to_dicts():
        row_data = []
        for col in columns:
            val = row_dict[col]
            if col == 'payload' and isinstance(val, str):
                try:
                    val = json.dumps(json.loads(val), separators=(',', ':'))
                except:
                    pass
            row_data.append(truncate_text(val))
        data.append(row_data)

    fig_width = max(len(columns) * 2.8, 12)
    fig_height = max(len(data) * 0.7 + 1.5, 5)
    fig, ax = plt.subplots(figsize=(fig_width, fig_height))
    ax.axis('off')
    
    # Add Title with Stats
    plt.title(
        f"Table: {table_name}\nPreviewing {len(data)} of {total_rows} total rows",
        fontsize=14, 
        pad=20, 
        weight='bold',
        color='#2c3e50'
    )
    
    table = ax.table(
        cellText=data, 
        colLabels=col_labels, 
        cellLoc='left', 
        loc='center',
        colWidths=[1.0 / len(columns)] * len(columns)
    )
    
    table.auto_set_font_size(False)
    table.set_fontsize(10)
    table.scale(1, 2.2)
    
    for i in range(len(columns)):
        header_cell = table[0, i]
        header_cell.set_facecolor('#2c3e50')
        header_cell.set_text_props(color='w', weight='bold')
        header_cell.set_height(0.12)

    for i in range(1, len(data) + 1):
        color = '#f8f9fa' if i % 2 == 0 else '#ffffff'
        for j in range(len(columns)):
            table[i, j].set_facecolor(color)

    plt.tight_layout()
    buf = io.BytesIO()
    plt.savefig(buf, format='png', bbox_inches='tight', dpi=150)
    buf.seek(0)
    plt.close(fig) 
    return buf
