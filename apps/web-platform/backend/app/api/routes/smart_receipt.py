"""Smart Receipt Ingestion and PII Redaction API.

Processes uploaded receipt images and PDFs, extracts structured financial metadata
(vendor, date, total amount, taxes, category), and provides automated PII masking.
"""

from __future__ import annotations

import io
import logging
from typing import Any, Dict, Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from pydantic import BaseModel, Field

from app.core.local_security import require_local_staff
from app.services.receipt_extractor import ReceiptExtractorService
from app.services.pii_redactor import PIIRedactorService

logger = logging.getLogger("doka.smart_receipt")
router = APIRouter(prefix="/receipt", tags=["receipt-vision"])

MAX_RECEIPT_UPLOAD_BYTES = 20 * 1024 * 1024
UPLOAD_CHUNK_BYTES = 1024 * 1024
ALLOWED_RECEIPT_MIME_TYPES = {
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/tiff",
    "image/webp",
}


class ExtractTextRequest(BaseModel):
    text: str = Field(..., min_length=1)
    currency_hint: Optional[str] = "MMK"


class RedactPIIRequest(BaseModel):
    text: str = Field(..., min_length=1)
    placeholder_style: str = Field("tag", pattern="^(tag|mask)$")


@router.post("/scan-vision")
async def scan_receipt_image(
    file: UploadFile = File(...),
    language: Optional[str] = Form("bilingual"),
    subject_id: str = Depends(require_local_staff),
) -> Dict[str, Any]:
    """Validate receipt upload, extract text via OCR/PDF parser, and parse financial data."""
    del subject_id
    try:
        mime_type = (file.content_type or "").split(";", 1)[0].strip().lower()
        if mime_type not in ALLOWED_RECEIPT_MIME_TYPES:
            raise HTTPException(
                status_code=415, 
                detail="Only PDF or supported image uploads are accepted."
            )

        # Read content with bounded size cap
        content = bytearray()
        while True:
            chunk = await file.read(UPLOAD_CHUNK_BYTES)
            if not chunk:
                break
            content.extend(chunk)
            if len(content) > MAX_RECEIPT_UPLOAD_BYTES:
                raise HTTPException(
                    status_code=413, 
                    detail="Receipt upload exceeds the 20 MiB limit."
                )

        raw_bytes = bytes(content)
        extracted_text = ""

        # Attempt PDF / image text extraction
        if mime_type == "application/pdf":
            try:
                import fitz  # PyMuPDF
                doc = fitz.open(stream=raw_bytes, filetype="pdf")
                for page in doc:
                    extracted_text += page.get_text() + "\n"
                doc.close()
            except Exception as e:
                logger.warning("PyMuPDF fallback failed: %s", e)
        else:
            try:
                from PIL import Image
                import pytesseract
                img = Image.open(io.BytesIO(raw_bytes))
                extracted_text = pytesseract.image_to_string(img)
            except Exception as e:
                logger.warning("Direct Tesseract extraction fallback: %s", e)

        # Fallback if text couldn't be extracted from raw image
        if not extracted_text.strip():
            extracted_text = f"Receipt Upload: {file.filename}\nMime: {mime_type}\nSize: {len(raw_bytes)} bytes"

        # Parse with ReceiptExtractorService
        financial_data = ReceiptExtractorService.extract_financial_data(extracted_text)
        financial_data["filename"] = file.filename
        financial_data["mime_type"] = mime_type
        financial_data["raw_chars_extracted"] = len(extracted_text)

        return {
            "status": "success",
            "data": financial_data,
        }
    finally:
        await file.close()


@router.post("/extract-text")
async def extract_receipt_text(payload: ExtractTextRequest) -> Dict[str, Any]:
    """Extract financial metadata directly from OCR / raw invoice text."""
    data = ReceiptExtractorService.extract_financial_data(payload.text)
    return {
        "status": "success",
        "data": data,
    }


@router.post("/redact-pii")
async def redact_pii_endpoint(payload: RedactPIIRequest) -> Dict[str, Any]:
    """Auto-detect and redact sensitive Personally Identifiable Information (PII)."""
    result = PIIRedactorService.redact_text(payload.text, placeholder_style=payload.placeholder_style)
    return {
        "status": "success",
        "data": result,
    }
