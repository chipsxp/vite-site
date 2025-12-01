# ADE Workflow, Data, and Schema

## Parse → Markdown → Extract → Export Pipeline

- **Component:** `src/components/PdfExtractionWorkflow.tsx` owns the entire Landing.ai ADE interaction cycle.
- **Upload stage:** Accepts PDFs and PPTX files through the native file input, stores the selected file in React state, and clears previous output/errors so each run starts clean.
- **Parse stage:** Sends `document` + `model=dpt-2` to `/api/ade/parse` via `FormData`. The Vite dev server proxies this call to `https://api.va.landing.ai`, so no extra backend code is required for local demos.
- **Markdown stage:** Collapses the ADE `chunks` array into a single markdown string, trims empty segments, and shows the first ~1200 characters for quick inspection.
- **Extract stage:** Sends the markdown content along with the JSON schema definition to `/api/ade/extract`. ADE analyzes the document and extracts structured metadata (title, authors, publishedYear, genres, pages, language, publisher) based on the `DocumentExtractionSchema`.
- **Result stage:** Validates the extracted JSON against the Zod schema, displays all captured metadata fields in the UI, and enables markdown export.
- **Export stage:** Generates a formatted markdown file containing both the extracted metadata and the full parsed document content, then triggers a browser download with filename format `YYYY-MM-DD-title.md`.

## Data Source (`books.json` + `src/data/books.ts`)

- `books.json` contains **example/mock book catalog data** to demonstrate the UI's filtering, search, and display capabilities. It showcases what a fully-populated book database would look like with complete metadata.
- The sample records in `books.json` point to **real test documents** under `public/Deep Machine Learning` (PDFs and PPTX slide decks) that can be uploaded to the ADE workflow for actual parsing and extraction.
- In a real-world scenario, `books.json` would be populated with metadata **extracted from actual documents** using the ADE Parse → Extract workflow, rather than being manually created.
- `src/data/books.ts` imports the JSON and exports it as a `BookDatabase`, providing schema-validated TypeScript types throughout the React app.
- Because the sample files live inside `public/`, Vite serves them directly, making the `pdfUrl` values stable for testing the extraction workflow.

## Schema Layer (`src/schema/books.ts`)

- **DocumentExtractionSchema** defines the fields that ADE attempts to extract from parsed documents: title, authors, publishedYear, genres, pages, language, and publisher. All fields are optional and nullable since not all documents contain complete metadata.
- **BookSchema** (full schema) includes additional fields for UI display purposes like ISBN, availability, stock, and ratings. This represents the complete book catalog data structure.
- **PublisherSchema / AvailabilitySchema / RatingSchema** break large nested objects into reusable chunks with clear field definitions.
- **BookDatabaseSchema** validates the structure of `books.json` (the mock catalog data).
- Exported TypeScript types (`DocumentExtraction`, `Book`, `BookDatabase`, etc.) keep the UI synchronized with schema changes without manual interface upkeep.
- Using Zod for both ADE extraction prompts and runtime validation keeps the schema definition single-sourced and type-safe.

## Structural Decisions & Solutions

- **Two-Schema Approach:** `DocumentExtractionSchema` focuses on what can be realistically extracted from documents via ADE, while `BookSchema` represents the full catalog data structure including fields not typically found in PDFs/PPTX (like stock levels and ratings).
- **Mock Data for UI Development:** `books.json` provides example data to showcase the enhanced UI features (filtering, search, sorting, rich cards) while the extraction workflow demonstrates how real metadata would be captured from actual documents.
- **Markdown Export:** Extracted metadata plus full document content are exported as downloadable markdown files (format: `YYYY-MM-DD-title.md`) for archival or further processing.
- **Local Assets for Testing:** Storing sample "Deep Machine Learning" documents inside `public/` provides reliable test files for the ADE workflow without external dependencies.
- **Proxy Configuration:** `vite.config.ts` forwards `/api/ade/*` routes to Landing.ai so the React app can call ADE securely without exposing credentials client-side (the SDK reads `VITE_VISION_AGENT_API_KEY`).
- **Progressive UX:** State-driven status indicators (`idle → parsing → extracting`) give clear feedback, while error handling catches everything from missing files to ADE server issues.
- **Nullable Fields:** All extraction schema fields accept `null` values since ADE may not find certain metadata in all documents.

This document should help future contributors understand how the workflow demonstrates ADE's parse and extract capabilities, how the mock catalog showcases UI features, and how the schema layer bridges both concerns.
