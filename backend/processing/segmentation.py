"""
Background Removal — rembg integration

Uses rembg (which wraps U²-Net) for zero-config background removal.
The model downloads automatically on first use (~170MB).

This replaces the need to manually configure U²-Net, SAM, or any other
segmentation model. rembg handles everything internally.

Usage:
    result_bytes = remove_background("uploads/image.jpg")
    # result_bytes is a PNG with alpha channel
"""

import io

from PIL import Image
from rembg import remove


def remove_background(
    image_path: str,
    alpha_matting: bool = False,
    alpha_matting_foreground_threshold: int = 240,
    alpha_matting_background_threshold: int = 10,
    alpha_matting_erode_size: int = 10,
) -> bytes:
    """
    Remove the background from an image.

    Args:
        image_path: Path to the input image file.
        alpha_matting: If True, use alpha matting for smoother edges.
            This is slower but produces much better results for hair,
            fur, and semi-transparent objects.
        alpha_matting_foreground_threshold: Pixel values above this
            are considered foreground (0-255).
        alpha_matting_background_threshold: Pixel values below this
            are considered background (0-255).
        alpha_matting_erode_size: Erosion size for alpha matting mask.

    Returns:
        PNG image bytes with transparent background.
    """
    with open(image_path, "rb") as f:
        input_bytes = f.read()

    # rembg.remove() handles everything:
    #   - Loads the U²-Net model (downloads on first use)
    #   - Generates segmentation mask
    #   - Applies alpha matting if requested
    #   - Returns PNG with alpha channel
    result = remove(
        input_bytes,
        alpha_matting=alpha_matting,
        alpha_matting_foreground_threshold=alpha_matting_foreground_threshold,
        alpha_matting_background_threshold=alpha_matting_background_threshold,
        alpha_matting_erode_size=alpha_matting_erode_size,
    )

    # Ensure output is PNG format
    img = Image.open(io.BytesIO(result))
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()


def remove_background_with_mask(
    image_path: str,
) -> tuple[bytes, bytes]:
    """
    Remove background and also return the binary mask.

    Returns:
        Tuple of (result_png_bytes, mask_png_bytes)
    """
    with open(image_path, "rb") as f:
        input_bytes = f.read()

    # Get result with alpha
    result = remove(input_bytes)
    result_img = Image.open(io.BytesIO(result)).convert("RGBA")

    # Extract alpha channel as grayscale mask
    alpha = result_img.split()[3]

    # Save mask
    mask_buf = io.BytesIO()
    alpha.save(mask_buf, format="PNG")

    # Save result
    result_buf = io.BytesIO()
    result_img.save(result_buf, format="PNG")

    return result_buf.getvalue(), mask_buf.getvalue()
