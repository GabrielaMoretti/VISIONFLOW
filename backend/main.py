"""
VISIONFLOW Backend — FastAPI Application

Entry point for the VisionFlow API server.
Serves endpoints for:
  - Image upload & analysis
  - Color science analysis (colour-science)
  - Background removal (rembg / U²-Net)
  - Super-resolution upscaling (Real-ESRGAN via ONNX)
"""

import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routes import health, upload, processing


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup/shutdown events."""
    # Ensure upload directories exist
    os.makedirs("uploads", exist_ok=True)
    os.makedirs("exports", exist_ok=True)
    print("✅ VisionFlow backend started")
    yield
    print("🛑 VisionFlow backend shutting down")


app = FastAPI(
    title="VisionFlow API",
    description="Professional image processing backend with color science, background removal, and AI upscaling",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS — allow frontend origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:8081",
        "http://localhost:19006",
        "*",  # Development only — restrict in production
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(health.router, tags=["Health"])
app.include_router(upload.router, prefix="/api", tags=["Upload"])
app.include_router(processing.router, prefix="/api", tags=["Processing"])


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info",
    )
