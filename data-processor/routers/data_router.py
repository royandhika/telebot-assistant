from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import StreamingResponse
from logger import get_logger
from services.data_service import process_upload, get_table_data, generate_table_image

logger = get_logger()
router = APIRouter()

@router.post("/upload")
async def upload(table_name: str = Form(...), file: UploadFile = File(...)):
    try:
        logger.info(f"📥 Received file: {file.filename} for table: {table_name}")
        result = await process_upload(table_name, file)
        return result
    except Exception as e:
        logger.error(f"❌ Processing Error: {str(e)}", exc_info=True)
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/read/{table_name}")
async def read(table_name: str, limit: int = 10):
    try:
        logger.info(f"🔍 Reading data from table: {table_name} with limit: {limit}")
        df = get_table_data(table_name, limit)
        
        if df.empty:
            raise HTTPException(status_code=404, detail=f"Table `{table_name}` is empty or does not exist.")

        buf = generate_table_image(df)
        return StreamingResponse(buf, media_type="image/png")
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"❌ Read Error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/ingest")
async def ingest(table_name: str = Form(...), file: UploadFile = File(...)):
    # ... logic ingest ClickHouse tetap sama (placeholder) ...
    pass
