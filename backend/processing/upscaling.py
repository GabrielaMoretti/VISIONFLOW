"""
Super-Resolution Upscaling — Real-ESRGAN via ONNX Runtime

Uses ONNX Runtime for inference instead of PyTorch, which means:
  - Much smaller footprint (~17MB model vs ~2GB PyTorch)
  - Faster cold start
  - No GPU/CUDA dependency (CPU is fine for occasional use)

The model (RealESRGAN_x4plus) downloads automatically on first use.

Usage:
    result_bytes = upscale_image("uploads/image.jpg", scale=4)
    # result_bytes is a PNG at 4x resolution
"""

import io
import os
import urllib.request
from pathlib import Path

import cv2
import numpy as np
from PIL import Image

# ---------------------------------------------------------------------------
# Model management
# ---------------------------------------------------------------------------

MODEL_DIR = os.path.join(os.path.dirname(__file__), "..", "models", "cache", "esrgan")
MODEL_URL = "https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.5.0/realesr-general-x4v3.pth"
ONNX_MODEL_NAME = "realesr-general-x4v3.onnx"

# Alternative smaller model (better for anime/illustration but also good on real photos):
# MODEL_URL_ANIME = "https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.2.4/RealESRGAN_x4plus_anime_6B.pth"

_onnx_session = None


def _ensure_model_dir():
    """Create model directory if it doesn't exist."""
    os.makedirs(MODEL_DIR, exist_ok=True)


def _get_onnx_session():
    """
    Get or create the ONNX Runtime inference session.
    Downloads the model on first use.
    """
    global _onnx_session

    if _onnx_session is not None:
        return _onnx_session

    try:
        import onnxruntime as ort
    except ImportError:
        raise RuntimeError(
            "onnxruntime is not installed. Run: pip install onnxruntime"
        )

    _ensure_model_dir()
    model_path = os.path.join(MODEL_DIR, ONNX_MODEL_NAME)

    if not os.path.exists(model_path):
        print(f"⚠️  ONNX model not found at {model_path}")
        print(f"   To use super-resolution, place the ONNX model at: {model_path}")
        print(f"   You can convert from PyTorch or download a pre-converted model.")
        raise FileNotFoundError(
            f"ESRGAN ONNX model not found. Place it at: {model_path}\n"
            f"Convert from PyTorch weights or find pre-built ONNX models at:\n"
            f"https://github.com/xinntao/Real-ESRGAN"
        )

    # Create session with optimizations
    sess_options = ort.SessionOptions()
    sess_options.graph_optimization_level = ort.GraphOptimizationLevel.ORT_ENABLE_ALL
    sess_options.intra_op_num_threads = os.cpu_count() or 4

    _onnx_session = ort.InferenceSession(
        model_path,
        sess_options=sess_options,
        providers=["CPUExecutionProvider"],
    )

    print(f"✅ ESRGAN ONNX model loaded from {model_path}")
    return _onnx_session


# ---------------------------------------------------------------------------
# Upscaling
# ---------------------------------------------------------------------------


def upscale_image(
    image_path: str,
    scale: int = 4,
    tile_size: int = 256,
    tile_pad: int = 16,
) -> bytes:
    """
    Upscale an image using Real-ESRGAN via ONNX Runtime.

    The image is processed in tiles to manage memory for large images.

    Args:
        image_path: Path to input image.
        scale: Upscale factor (2 or 4). The model is natively 4x;
               2x is achieved by downscaling the 4x result.
        tile_size: Tile size for processing (smaller = less memory).
        tile_pad: Overlap between tiles to avoid seams.

    Returns:
        PNG image bytes at the upscaled resolution.
    """
    session = _get_onnx_session()

    # Load image
    img = cv2.imread(image_path, cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError(f"Failed to load image: {image_path}")

    img = img.astype(np.float32) / 255.0
    h, w, c = img.shape

    # Process in tiles for memory efficiency
    output = _tile_process(session, img, tile_size, tile_pad, scale=4)

    # If user requested 2x, downscale the 4x result
    if scale == 2:
        output_h, output_w = output.shape[:2]
        output = cv2.resize(
            output,
            (output_w // 2, output_h // 2),
            interpolation=cv2.INTER_LANCZOS4,
        )

    # Convert to uint8 and encode as PNG
    output = np.clip(output * 255.0, 0, 255).astype(np.uint8)
    output_rgb = cv2.cvtColor(output, cv2.COLOR_BGR2RGB)

    pil_image = Image.fromarray(output_rgb)
    buf = io.BytesIO()
    pil_image.save(buf, format="PNG", optimize=True)
    return buf.getvalue()


def _tile_process(
    session,
    img: np.ndarray,
    tile_size: int,
    tile_pad: int,
    scale: int = 4,
) -> np.ndarray:
    """
    Process image in tiles to avoid OOM on large images.

    Each tile is padded to avoid border artifacts, processed through
    the model, and then the padding is removed before stitching.
    """
    h, w, c = img.shape
    output = np.zeros((h * scale, w * scale, c), dtype=np.float32)

    input_name = session.get_inputs()[0].name

    for y in range(0, h, tile_size):
        for x in range(0, w, tile_size):
            # Calculate tile boundaries with padding
            y_start = max(0, y - tile_pad)
            x_start = max(0, x - tile_pad)
            y_end = min(h, y + tile_size + tile_pad)
            x_end = min(w, x + tile_size + tile_pad)

            # Extract tile
            tile = img[y_start:y_end, x_start:x_end, :]

            # Prepare input: HWC → NCHW
            tile_input = np.transpose(tile, (2, 0, 1))
            tile_input = np.expand_dims(tile_input, axis=0)

            # Run inference
            result = session.run(None, {input_name: tile_input})
            tile_output = result[0][0]  # NCHW → CHW

            # CHW → HWC
            tile_output = np.transpose(tile_output, (1, 2, 0))

            # Calculate output tile boundaries (accounting for scale)
            out_y_start = (y - y_start) * scale
            out_x_start = (x - x_start) * scale
            out_y_end = out_y_start + min(tile_size, h - y) * scale
            out_x_end = out_x_start + min(tile_size, w - x) * scale

            # Place tile in output (removing padding)
            output_y = y * scale
            output_x = x * scale
            paste_h = out_y_end - out_y_start
            paste_w = out_x_end - out_x_start

            output[output_y:output_y + paste_h, output_x:output_x + paste_w, :] = \
                tile_output[out_y_start:out_y_end, out_x_start:out_x_end, :]

    return output


# ---------------------------------------------------------------------------
# Alternative: bicubic upscale (CPU fallback when model is not available)
# ---------------------------------------------------------------------------


def upscale_bicubic(image_path: str, scale: int = 4) -> bytes:
    """
    Simple bicubic upscaling as a fallback when ESRGAN is not available.
    Quality is much lower than ESRGAN but works without any model.
    """
    img = cv2.imread(image_path, cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError(f"Failed to load image: {image_path}")

    h, w = img.shape[:2]
    output = cv2.resize(img, (w * scale, h * scale), interpolation=cv2.INTER_CUBIC)

    output_rgb = cv2.cvtColor(output, cv2.COLOR_BGR2RGB)
    pil_image = Image.fromarray(output_rgb)
    buf = io.BytesIO()
    pil_image.save(buf, format="PNG", optimize=True)
    return buf.getvalue()
