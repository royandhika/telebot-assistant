import os
import logging
import json
from logging.handlers import TimedRotatingFileHandler
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables (same as main.py)
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

# Configuration
LOG_DIR = "logs"
ENV = os.getenv("NODE_ENV", "development") # Using NODE_ENV to match the JS logger's environment check

# Create logs directory if it doesn't exist
if not os.path.exists(LOG_DIR):
    os.makedirs(LOG_DIR)

# Custom formatter to match the JS printf(({ level, message, timestamp, stack, ...meta }) => ...)
class JSONFormatter(logging.Formatter):
    def format(self, record):
        log_data = {
            "timestamp": self.formatTime(record, self.datefmt),
            "level": record.levelname.lower(),
            "message": record.getMessage(),
        }
        
        # Add stack trace if it's an error
        if record.exc_info:
            log_data["stack"] = self.formatException(record.exc_info)
            
        # Add extra meta data if provided via 'extra' parameter
        # This is a bit tricky in standard logging, but we can capture it
        # by looking for keys not in standard LogRecord attributes
        standard_attrs = {
            'args', 'asctime', 'created', 'exc_info', 'exc_text', 'filename',
            'funcName', 'levelname', 'levelno', 'lineno', 'module',
            'msecs', 'message', 'msg', 'name', 'pathname', 'process',
            'processName', 'relativeCreated', 'stack_info', 'thread', 'threadName'
        }
        meta = {k: v for k, v in record.__dict__.items() if k not in standard_attrs}
        if meta:
            log_data.update(meta)
            
        # Return a string format similar to the JS logger
        meta_str = json.dumps(meta) if meta else ""
        stack_str = f"\n{log_data['stack']}" if "stack" in log_data else ""
        
        return f"{log_data['timestamp']} [{log_data['level']}]: {log_data['message']} {meta_str}{stack_str}"

# Define format
date_fmt = "%Y-%m-%d %H:%M:%S"
formatter = JSONFormatter(datefmt=date_fmt)

# 1. Setup transport target - Daily Rotate for all logs
# Filename will be application.log, and it will rotate and append date
# To match 'application-%DATE%.log', we can use namer if needed
app_handler = TimedRotatingFileHandler(
    filename=os.path.join(LOG_DIR, "application.log"),
    when="midnight",
    interval=1,
    backupCount=14, # 14d
    encoding="utf-8"
)
app_handler.suffix = "%Y-%m-%d.log"
app_handler.setLevel(logging.INFO if ENV == "production" else logging.DEBUG)
app_handler.setFormatter(formatter)

# 2. Setup transport target - Daily Rotate for error logs
error_handler = TimedRotatingFileHandler(
    filename=os.path.join(LOG_DIR, "error.log"),
    when="midnight",
    interval=1,
    backupCount=30, # 30d
    encoding="utf-8"
)
error_handler.suffix = "%Y-%m-%d.log"
error_handler.setLevel(logging.ERROR)
error_handler.setFormatter(formatter)

# Create logger instance
logger = logging.getLogger("data-processor")
logger.setLevel(logging.DEBUG) # Catch everything, then handlers filter
logger.addHandler(app_handler)
logger.addHandler(error_handler)

# In development log to console
if ENV != "production":
    console_handler = logging.StreamHandler()
    
    # Simple console format (matching the JS console format)
    class ConsoleFormatter(logging.Formatter):
        def format(self, record):
            timestamp = self.formatTime(record, "%H:%M:%S")
            level = record.levelname.lower()
            message = record.getMessage()
            # Basic coloring for console (if you want more, use 'colorlog')
            colors = {
                'debug': '\033[36m',   # Cyan
                'info': '\033[32m',    # Green
                'warning': '\033[33m', # Yellow
                'error': '\033[31m',   # Red
                'critical': '\033[41m' # Red BG
            }
            reset = '\033[0m'
            color = colors.get(level, '')
            return f"{timestamp} {color}{level}{reset}: {message}"
            
    console_handler.setFormatter(ConsoleFormatter())
    console_handler.setLevel(logging.DEBUG)
    logger.addHandler(console_handler)

# Export as a standard name
def get_logger():
    return logger
