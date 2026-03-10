"""
Processing routes — color analysis, background removal, super-resolution.

Each endpoint receives an image ID (from /upload) and returns processed results.
"""

import os
import io
import uuid

from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from processing.color_flow import analyze_image_colors
from processing.segmentation import remove_background
from processing.upscaling import upscale_image

router = APIRouter()

UPLOAD_DIR = "uploads"
EXPORT_DIR = "exports"


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------

class ColorAnalysisResponse(BaseModel):
    temperature_kelvin: float
    temperature_delta: float
    dominant_colors_hex: list[str]
    dominant_colors_oklch: list[dict]
    average_lightness: float
    average_chroma: float
    color_harmony: str
    saturation_level: str
    dynamic_range: float


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------


@router.get("/analyze/{image_id}")
async def analyze_colors(image_id: str) -> ColorAnalysisResponse:
    """
    Analyze image colors using colour-science library.

    Returns precise color temperature (Kelvin), dominant colors in OKLCH,
    harmony assessment, and other metrics. This is significantly more accurate
    than the client-side HSL-based estimation.
    """
    filepath = _find_image(image_id)
    result = analyze_image_colors(filepath)
    return ColorAnalysisResponse(**result)


@router.post("/remove-bg/{image_id}")
async def remove_bg(
    image_id: str,
    alpha_matting: bool = Query(False, description="Use alpha matting for soft edges"),
):
    """
    Remove image background using rembg (U²-Net).

    Returns a PNG with transparency. The model downloads automatically
    on first use (~170MB).
    """
    filepath = _find_image(image_id)
    result_bytes = remove_background(filepath, alpha_matting=alpha_matting)

    # Save to exports
    export_id = str(uuid.uuid4())
    export_path = os.path.join(EXPORT_DIR, f"{export_id}_nobg.png")
    os.makedirs(EXPORT_DIR, exist_ok=True)
    with open(export_path, "wb") as f:
        f.write(result_bytes)

    return StreamingResponse(
        io.BytesIO(result_bytes),
        media_type="image/png",
        headers={
            "Content-Disposition": f"attachment; filename={image_id}_nobg.png",
            "X-Export-Id": export_id,
        },
    )


@router.post("/upscale/{image_id}")
async def upscale(
    image_id: str,
    scale: int = Query(4, ge=2, le=4, description="Upscale factor (2x or 4x)"),
):
    """
    Upscale image using Real-ESRGAN via ONNX Runtime.

    The ONNX model (~17MB) downloads automatically on first use.
    Processing time: ~5-15s for a 1080p image at 4x.
    """
    filepath = _find_image(image_id)
    result_bytes = upscale_image(filepath, scale=scale)

    export_id = str(uuid.uuid4())
    export_path = os.path.join(EXPORT_DIR, f"{export_id}_upscaled.png")
    os.makedirs(EXPORT_DIR, exist_ok=True)
    with open(export_path, "wb") as f:
        f.write(result_bytes)

    return StreamingResponse(
        io.BytesIO(result_bytes),
        media_type="image/png",
        headers={
            "Content-Disposition": f"attachment; filename={image_id}_upscaled_{scale}x.png",
            "X-Export-Id": export_id,
        },
    )


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _find_image(image_id: str) -> str:
    """Find an uploaded image by ID (tries common extensions)."""
    for ext in [".jpg", ".jpeg", ".png", ".webp", ".tiff", ".tif", ".bmp"]:
        path = os.path.join(UPLOAD_DIR, f"{image_id}{ext}")
        if os.path.exists(path):
            return path

    raise HTTPException(status_code=404, detail=f"Image not found: {image_id}")
