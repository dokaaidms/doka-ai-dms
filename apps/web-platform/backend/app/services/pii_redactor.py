"""PII Auto-Redaction and Data Privacy Engine.

Scans documents and OCR text for sensitive Personally Identifiable Information (PII)
and financial data, producing privacy-compliant redacted outputs with audit trails.
Specialized for Myanmar NRC, International Credit Cards, Phone numbers, and Emails.
"""

from __future__ import annotations

import logging
import re
from typing import Any, Dict, List, Tuple

logger = logging.getLogger("doka.pii_redactor")

# Myanmar NRC Regex: English and Burmese scripts
# e.g., 12/DAGAMA(N)123456 or ၁၂/ဒဂမ(နိုင်)၁၂၃၄၅၆
NRC_PATTERN = re.compile(
    r"\b(?:[0-9]{1,2}|[၀-၉]{1,2})/[A-Za-z\u1000-\u1021]+(?:\([A-Za-z\u1000-\u1021]+\)|\([NnEePpTt]\)|နိုင်|ဧည်|ပြု)(?:[0-9]{6}|[၀-၉]{6})\b"
)

# Email Regex
EMAIL_PATTERN = re.compile(
    r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b"
)

# Phone Number Patterns (Myanmar + International)
# e.g., +95912345678, 09-123456789, +1-800-555-0199
PHONE_PATTERN = re.compile(
    r"(?:\+959|09|\+?1|\+?44|\+?65|\+?66)[-.\s]?[0-9]{2,4}[-.\s]?[0-9]{3,4}[-.\s]?[0-9]{3,4}\b"
)

# Credit Card Candidate Pattern (13 to 19 digits formatted or unformatted)
CARD_PATTERN = re.compile(
    r"\b(?:\d{4}[-\s]?){3}\d{1,4}\b|\b\d{13,19}\b"
)

# Passport pattern (1 letter followed by 7-9 digits)
PASSPORT_PATTERN = re.compile(
    r"\b[A-Z]{1,2}[0-9]{7,9}\b"
)


def _validate_luhn(card_number_str: str) -> bool:
    """Validate credit card number using Luhn algorithm."""
    clean = re.sub(r"\D", "", card_number_str)
    if not (13 <= len(clean) <= 19):
        return False
    digits = [int(c) for c in clean]
    checksum = 0
    reverse_digits = digits[::-1]
    for i, d in enumerate(reverse_digits):
        if i % 2 == 1:
            d = d * 2
            if d > 9:
                d -= 9
        checksum += d
    return checksum % 10 == 0


class PIIRedactorService:
    """Scans and masks PII in text documents."""

    @classmethod
    def redact_text(cls, text: str, placeholder_style: str = "tag") -> Dict[str, Any]:
        """Redact sensitive fields from the input text.
        
        placeholder_style:
          - 'tag': [REDACTED_EMAIL], [REDACTED_NRC], etc.
          - 'mask': u***r@domain.com, ****-****-****-1234
        """
        if not text:
            return {
                "redacted_text": "",
                "redaction_count": 0,
                "summary": {},
                "findings": []
            }

        redacted = text
        findings: List[Dict[str, Any]] = []
        counts: Dict[str, int] = {
            "nrc": 0,
            "email": 0,
            "phone": 0,
            "credit_card": 0,
            "passport": 0,
        }

        # 1. Credit Cards
        for match in CARD_PATTERN.finditer(text):
            candidate = match.group(0)
            if _validate_luhn(candidate):
                clean = re.sub(r"\D", "", candidate)
                replacement = (
                    f"****-****-****-{clean[-4:]}"
                    if placeholder_style == "mask"
                    else "[REDACTED_CREDIT_CARD]"
                )
                redacted = redacted.replace(candidate, replacement)
                counts["credit_card"] += 1
                findings.append({
                    "type": "credit_card",
                    "position": match.start(),
                    "length": len(candidate)
                })

        # 2. Myanmar NRC
        for match in NRC_PATTERN.finditer(text):
            candidate = match.group(0)
            replacement = (
                f"**/***(N)******"
                if placeholder_style == "mask"
                else "[REDACTED_NRC]"
            )
            redacted = redacted.replace(candidate, replacement)
            counts["nrc"] += 1
            findings.append({
                "type": "nrc",
                "position": match.start(),
                "length": len(candidate)
            })

        # 3. Email
        for match in EMAIL_PATTERN.finditer(text):
            candidate = match.group(0)
            if placeholder_style == "mask":
                parts = candidate.split("@")
                user = parts[0]
                masked_user = user[0] + "***" + (user[-1] if len(user) > 1 else "")
                replacement = f"{masked_user}@{parts[1]}"
            else:
                replacement = "[REDACTED_EMAIL]"
            redacted = redacted.replace(candidate, replacement)
            counts["email"] += 1
            findings.append({
                "type": "email",
                "position": match.start(),
                "length": len(candidate)
            })

        # 4. Phone Numbers
        for match in PHONE_PATTERN.finditer(text):
            candidate = match.group(0)
            replacement = (
                f"{candidate[:3]}****{candidate[-2:]}"
                if placeholder_style == "mask"
                else "[REDACTED_PHONE]"
            )
            redacted = redacted.replace(candidate, replacement)
            counts["phone"] += 1
            findings.append({
                "type": "phone",
                "position": match.start(),
                "length": len(candidate)
            })

        # 5. Passports
        for match in PASSPORT_PATTERN.finditer(text):
            candidate = match.group(0)
            replacement = (
                f"{candidate[0]}******"
                if placeholder_style == "mask"
                else "[REDACTED_PASSPORT]"
            )
            redacted = redacted.replace(candidate, replacement)
            counts["passport"] += 1
            findings.append({
                "type": "passport",
                "position": match.start(),
                "length": len(candidate)
            })

        total_redactions = sum(counts.values())

        return {
            "redacted_text": redacted,
            "redaction_count": total_redactions,
            "summary": {k: v for k, v in counts.items() if v > 0},
            "findings": findings
        }
