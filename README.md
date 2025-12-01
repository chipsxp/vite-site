# ADE Book Extraction Demo

This repository captures a lightweight playground for Landing.ai's ADE (Agentic Data Extraction) technology. We started with the default Vite React template and iteratively layered in ADE parsing, markdown inspection, and schema-driven extraction so we could demo end-to-end document intelligence against a curated "Deep Machine Learning" reading kit.

## Background & Project History

1. **Scaffold & Research** – Cloned the plain Vite starter to give us hot-module reloads while we experimented with the ADE SDK from Landing.ai.
2. **Workflow Prototyping** – Built `PdfExtractionWorkflow` to showcase the `parse → markdown → extract` pipeline. Early iterations surfaced SDK initialization timing issues, so we guarded the client creation and surfaced informative error banners.
3. **Data Reliability Fixes** – The original Gutenberg links routinely returned 404s. We replaced the dataset with eight local PDFs/PPTX files under `public/Deep Machine Learning`, ensuring reliable downloads for demos while keeping schema richness.
4. **Schema & Type Safety** – Finalized `src/schema/books.ts` to define the canonical `Book` contract (via Zod) and wired `src/data/books.ts` + `books.json` to keep fake-but-structured metadata synchronized with the local assets.

These steps mirror the chat history of diagnosing missing PDFs, validating ADE responses, and grounding the UI in consistent metadata.

## Key Problems & Solutions

- **ADE Client Initialization** – Wrapped the Landing.ai client in `useMemo` and surfaced actionable errors when `VITE_VISION_AGENT_API_KEY` is missing.
- **Parse Markdown Quality** – Limited preview length and added defensive checks so empty `chunks` return human-readable guidance instead of silent failures.
- **Asset Availability** – Moved away from remote public-domain URLs to repo-hosted PDFs/PPTX files so every demo reliably exercises the ADE workflow without internet flakiness.

## Requirements

- Node.js 18+ and npm 9+
- A Landing.ai Vision Agent API key with ADE access (store it in `.env`)
- Git for cloning the repository

## Setup from GitHub

```bash
git clone https://github.com/chipsxp/vite-site.git
cd vite-site
npm install
```

## Configure ADE Access

Create `.env` (or edit the existing one) and add your key:

```dotenv
VITE_VISION_AGENT_API_KEY=your_vision_agent_key_here
```

Restart `npm run dev` after changing the key so Vite picks up the new environment variable.

## Run as a Dev-Server-Only Project

This repo is optimized for local experimentation; there is no production build or deployment workflow. To run the demo:

```bash
npm run dev
```

Then open the printed local URL (typically `http://localhost:5173`). The ADE workflow, book grid, and local assets all run entirely from the dev server.

## Troubleshooting

- **Missing API Key** – The UI will show `VISION_AGENT_API_KEY is not configured`. Confirm the `.env` file exists and restart Vite.
- **ADE Parse Failures** – Ensure the uploaded file is a PDF and under the Landing.ai size limits. The proxy defined in `vite.config.ts` forwards `/api/ade/*` to `https://api.va.landing.ai`.
- **Local Asset 404s** – Verify the documents still live under `public/Deep Machine Learning` and that paths in `books.json` match exactly (URL-encoded spaces).

## For Detailed Research Information

- **Refer to STEP1_WORKFLOW.md** - Parse → Markdown → Extract → Export Pipeline
- **Also refer to STEP2 ENHANCED_UI.md** - Complete document parsing and metadata extraction application using Landing.ai's ADE (Advanced Document Extraction) API.

With those pieces in place, you can iterate strictly via the dev server, swap in new PDFs, and observe how ADE parses and extracts structured book metadata.
