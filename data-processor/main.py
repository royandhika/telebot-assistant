from fastapi import FastAPI
from database import init_minio
from routers import data_router, health_router

app = FastAPI(
    title="Data Processor API", 
    description="Python service for ClickHouse and MinIO (Refactored)"
)

# Initialize external services
init_minio()

# Include Routers
app.include_router(data_router.router)
app.include_router(health_router.router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
