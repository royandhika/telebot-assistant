import io
import json
import pandas as pd
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
        ingested_at = datetime.now()
        
        # 1. Parsing: Dapatkan data mentah saja
        df = _parse_to_df(file.filename, contents)
        
        # 2. ClickHouse Operation: Kirim data mentah + metadata secara terpisah
        _upload_to_clickhouse(table_name, df, file.filename, ingested_at)
        
        # 3. MinIO Archiving
        s3_path, minio_filename = _archive_to_minio(file.filename, contents, file.content_type)
        
        return {
            "status": "success",
            "message": f"Data uploaded to ClickHouse table '{table_name}' and archived to MinIO",
            "table_name": table_name,
            "s3_path": s3_path,
            "filename": minio_filename,
            "rows": len(df)
        }
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        logger.error(f"❌ Processing Error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

def _parse_to_df(filename: str, contents: bytes) -> pd.DataFrame:
    """Internal helper to parse bytes to raw DataFrame with all columns as strings."""
    file_ext = filename.split('.')[-1].lower() if filename else ""
    
    try:
        if file_ext == 'csv':
            df = pd.read_csv(io.BytesIO(contents), dtype=str)
        elif file_ext in ['xlsx', 'xls']:
            df = pd.read_excel(io.BytesIO(contents), dtype=str)
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format. Use CSV or XLSX.")
    except Exception as e:
        logger.error(f"❌ Parser Error: {str(e)}")
        raise HTTPException(status_code=422, detail=f"Failed to parse file: {str(e)}")
    
    logger.info(f"✅ Raw data loaded into memory: {len(df)} rows.")
    return df

def _upload_to_clickhouse(table_name: str, df: pd.DataFrame, filename: str, ingested_at: datetime):
    """Internal helper to handle ClickHouse table creation and data insertion using schema-free landing."""
    ch_client = get_ch_client()
    
    create_query = f"""
    CREATE TABLE IF NOT EXISTS `{table_name}` (
        `id` String,
        `payload` String,
        `file_name` String,
        `ingested_at` DateTime64(3)
    ) ENGINE = MergeTree()
    ORDER BY (id, ingested_at)
    """
    logger.debug(f"🛠️ Ensuring table exists: {create_query}")
    ch_client.command(create_query)

    logger.info(f"🔗 Encoding rows to JSON and adding metadata...")
    
    # Langsung ubah DataFrame mentah menjadi list of JSON strings
    payloads = [json.dumps(record) for record in df.to_dict(orient='records')]
    ids = [cuid_generator.generate() for _ in range(len(df))]
    
    # Buat landing DataFrame final tanpa perlu drop kolom lagi
    landing_df = pd.DataFrame({
        'id': ids,
        'payload': payloads,
        'file_name': filename,
        'ingested_at': ingested_at
    })

    logger.info(f"🚀 Uploading {len(landing_df)} schema-free records to ClickHouse table '{table_name}'...")
    ch_client.insert_df(table_name, landing_df)

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
    """Fetches raw data from ClickHouse."""
    ch_client = get_ch_client()
    df = ch_client.query_df(f"SELECT * FROM `{table_name}` LIMIT {limit}")
    return df

def generate_table_image(df: pd.DataFrame):
    """Generates a PNG image from a DataFrame."""
    fig, ax = plt.subplots(figsize=(max(len(df.columns) * 1.5, 6), max(len(df) * 0.5, 3)))
    ax.axis('off')
    
    table = ax.table(
        cellText=df.values, 
        colLabels=df.columns, 
        cellLoc='center', 
        loc='center'
    )
    
    table.auto_set_font_size(False)
    table.set_fontsize(10)
    table.scale(1, 1.5)
    
    for i, key in enumerate(df.columns):
        table[0, i].set_facecolor('#40466e')
        table[0, i].set_text_props(color='w')

    buf = io.BytesIO()
    plt.savefig(buf, format='png', bbox_inches='tight', dpi=150)
    buf.seek(0)
    plt.close(fig) 
    return buf
