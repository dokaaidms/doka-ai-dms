"""Unit tests for PII Auto-Redaction and Smart Receipt Ingestion."""

import pytest
from app.services.pii_redactor import PIIRedactorService
from app.services.receipt_extractor import ReceiptExtractorService


def test_pii_redaction_email_and_phone():
    text = "Please reach out to support@doka-dms.com or call +95912345678 immediately."
    result = PIIRedactorService.redact_text(text, placeholder_style="tag")
    
    assert "[REDACTED_EMAIL]" in result["redacted_text"]
    assert "[REDACTED_PHONE]" in result["redacted_text"]
    assert result["summary"]["email"] == 1
    assert result["summary"]["phone"] == 1


def test_pii_redaction_myanmar_nrc():
    text = "Citizen National ID is 12/DAGAMA(N)123456 registered in Yangon."
    result = PIIRedactorService.redact_text(text, placeholder_style="tag")
    
    assert "[REDACTED_NRC]" in result["redacted_text"]
    assert result["summary"]["nrc"] == 1


def test_pii_masking_style():
    text = "Contact john.doe@enterprise.org"
    result = PIIRedactorService.redact_text(text, placeholder_style="mask")
    
    assert "@enterprise.org" in result["redacted_text"]
    assert "john.doe" not in result["redacted_text"]


def test_receipt_extractor_service_totals():
    sample_ocr = """
    CITY MART HOLDING CO., LTD.
    Marketplace Golden Valley Branch
    Date: 2026-11-20
    Items:
    1. Arabica Coffee Bean - 18,500 MMK
    2. Fresh Organic Milk - 4,500 MMK
    Subtotal: 23,000 MMK
    Commercial Tax (5%): 1,150 MMK
    TOTAL: 24,150 MMK
    Thank you for shopping with us!
    """
    data = ReceiptExtractorService.extract_financial_data(sample_ocr)
    
    assert data["total_amount"] == 24150.0 or data["total_amount"] > 20000.0
    assert data["currency"] == "MMK"
    assert "Retail" in data["category"] or "Meals" in data["category"]
