# Data Processor (FastAPI)

A Python service that handles data ingestion from Telegram bot attachments (CSV/XLSX) to the ClickHouse Data Warehouse (DWH).

## Features
- `/consume-data`: Endpoint to receive a table name and file.
- Support for CSV and XLSX files via pandas.
- ClickHouse integration using `clickhouse-connect`.

## Running the Service
1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   # or if using uv:
   uv sync
   ```
2. Set environment variables in the parent `.env`:
   - `CLICKHOUSE_HOST`
   - `CLICKHOUSE_PORT`
   - `CLICKHOUSE_USER`
   - `CLICKHOUSE_PASSWORD`
   - `CLICKHOUSE_DB`
3. Run the application:
   ```bash
   python main.py
   # or
   uvicorn main:app --host 0.0.0.0 --port 8000
   ```

## Endpoint: POST /consume-data
### Form Data
- `table_name`: The name of the target ClickHouse table.
- `file`: The CSV or XLSX file to ingest.

### Example
```bash
curl -X POST "http://localhost:8000/consume-data" \
  -F "table_name=my_table" \
  -F "file=@data.csv"
```
