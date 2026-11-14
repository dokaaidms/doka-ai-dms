# 📄 Doka AI DMS
> **Safety-First Intelligent Document Management, OCR & Enterprise Knowledge System**

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers_API-F38020?style=flat-square&logo=cloudflare)](https://workers.cloudflare.com/)
[![FastAPI](https://img.shields.io/badge/Python-FastAPI_Engine-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Database_&_Auth-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com/)
[![Gemini AI](https://img.shields.io/badge/Gemini_2.0-Multimodal_Document_AI-4285F4?style=flat-square&logo=google)](https://deepmind.google/technologies/gemini/)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-Document_Vault-3448C5?style=flat-square&logo=cloudinary)](https://cloudinary.com/)
[![Vercel](https://img.shields.io/badge/Vercel-Production_Live-black?style=flat-square&logo=vercel)](https://enterprise-ai-dms.vercel.app)
[![Telegram](https://img.shields.io/badge/Telegram_Bot-Topic_#8-26A5E4?style=flat-square&logo=telegram)](https://t.me/)

---

## 🌟 Overview

**Doka AI DMS** is an enterprise-grade, safety-first document management system with multi-tier deployment capabilities (**Personal Local**, **Cloud Serverless**, and **Enterprise**).

It transforms unstructured papers, PDFs, invoices, contracts, and scans into structured, searchable, and verified digital intelligence while enforcing strict read-only protections on original source files.

---

## 🚀 Key Features

* **🛡️ Safety-First Import & Quarantine**: Originals remain read-only; documents undergo verified copy, hash validation, and quarantine staging before ingestion.
* **🔍 Multimodal AI & OCR**: High-accuracy text extraction via Tesseract, PDFium, and Gemini 2.0 Multimodal Document Understanding (supporting English and Burmese scripts).
* **🧠 Semantic Document RAG**: Vector-indexed retrieval powered by Supabase `pgvector` and Voyage AI.
* **📁 Smart Category Organization**: Automatic contract analysis, invoice categorization, metadata extraction, and human-in-the-loop review.
* **☁️ Cloud & Edge Hybrid**: Fast Edge API powered by Cloudflare Workers paired with Next.js 15 UI and Supabase Backend.
* **🤖 Telegram Document Ingestion**: Send documents directly to `@DokaAiBot` in Topic `#8` for instant ingestion, OCR, and AI summary.

---

## 🏗️ System Architecture

```
     Raw Documents (PDF / Scans / Photos / Telegram)
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                 Safety & Quarantine Gateway                 │
│  • Read-only Source Verification • SHA-256 Checksum Hash   │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                 Multimodal Processing Core                  │
│  • Tesseract OCR / PDFium Parser                            │
│  • Gemini 2.0 Flash Document Understanding                  │
│  • Metadata Extraction & Semantic Chunking                  │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                 Cloudflare Edge & Supabase                  │
│  • Cloudflare Worker API (Edge routing & auth)              │
│  • Supabase Database (RLS, Audit Trails, pgvector)          │
│  • Cloudinary CDN & Backblaze B2 (Secure Storage)           │
└─────────────────────────────────────────────────────────────┘
```

---

## ⚡ Quickstart

```bash
# 1. Install dependencies
pnpm install

# 2. Run local web platform
pnpm dev

# 3. Cloudflare Worker Edge
cd apps/web-platform/backend/cloudflare_worker
npx wrangler dev
```

---

## 📜 License & Compliance

MIT Licensed with Enterprise Safety Addendum.
