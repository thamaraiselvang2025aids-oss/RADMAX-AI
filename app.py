import os
import sys

# Add ai_service to path so imports work
sys.path.append(os.path.join(os.path.dirname(__file__), "ai_service"))

import uvicorn
from ai_service.main import app

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=7860)
