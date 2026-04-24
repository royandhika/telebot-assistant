import clickhouse_connect
from minio import Minio
from fastapi import HTTPException
from logger import get_logger
import config

logger = get_logger()

# Initialize Minio client
minio_client = Minio(
    config.MINIO_ENDPOINT,
    access_key=config.MINIO_ROOT_USER,
    secret_key=config.MINIO_ROOT_PASSWORD,
    secure=False # Set to True if using HTTPS
)

# Ensure bucket exists
def init_minio():
    if not minio_client.bucket_exists(config.MINIO_BUCKET):
        minio_client.make_bucket(config.MINIO_BUCKET)

def get_ch_client():
    try:
        return clickhouse_connect.get_client(
            host=config.CH_HOST, 
            port=config.CH_PORT, 
            username=config.CH_USER, 
            password=config.CH_PASSWORD, 
            database=config.CH_DB
        )
    except Exception as e:
        logger.error(f"❌ ClickHouse Connection Error: {str(e)}")
        raise HTTPException(status_code=503, detail="Database connection failed")
