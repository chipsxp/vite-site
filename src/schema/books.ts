import { z } from "zod";

// Extraction schema for PDFs - matches Book schema fields (except ISBN, format, stock, rating, id, pdfUrl)
export const DocumentExtractionSchema = z.object({
  title: z
    .string()
    .optional()
    .nullable()
    .describe("Main title of the document"),
  authors: z
    .array(z.string())
    .optional()
    .nullable()
    .describe("List of author names"),
  publishedYear: z
    .number()
    .int()
    .optional()
    .nullable()
    .describe("Year of publication"),
  genres: z
    .array(z.string())
    .optional()
    .nullable()
    .describe("Book genres/categories"),
  pages: z
    .number()
    .int()
    .positive()
    .optional()
    .nullable()
    .describe("Number of pages"),
  language: z
    .string()
    .optional()
    .nullable()
    .describe("Language of the document (e.g., English, Spanish)"),
  publisher: z
    .object({
      name: z.string().optional().nullable().describe("Publisher company name"),
      location: z
        .string()
        .optional()
        .nullable()
        .describe("Publisher location (city, country)"),
    })
    .optional()
    .nullable()
    .describe("Publisher information"),
});

// Original complex schema for the book database display (not used for extraction)
export const PublisherSchema = z.object({
  name: z.string().default("").describe("Publisher company name"),
  location: z
    .string()
    .default("")
    .describe("Publisher location (city, country)"),
});

export const AvailabilitySchema = z.object({
  format: z
    .string()
    .default("")
    .describe("Book format (hardcover, paperback, ebook, etc.)"),
  stock: z
    .number()
    .int()
    .nonnegative()
    .default(0)
    .describe("Number of copies in stock"),
});

export const RatingSchema = z.object({
  average: z
    .number()
    .min(0)
    .max(5)
    .default(0)
    .describe("Average rating score (0-5)"),
  count: z
    .number()
    .int()
    .nonnegative()
    .default(0)
    .describe("Total number of ratings"),
});

export const BookSchema = z.object({
  id: z.string().default("").describe("Unique book identifier"),
  title: z.string().default("").describe("Book title"),
  authors: z.array(z.string()).default([]).describe("List of author names"),
  publishedYear: z.number().int().default(0).describe("Year of publication"),
  genres: z.array(z.string()).default([]).describe("Book genres/categories"),
  isbn: z.string().default("").describe("ISBN number"),
  pages: z.number().int().positive().default(1).describe("Number of pages"),
  language: z.string().default("").describe("Language code (e.g., en, es, fr)"),
  publisher: PublisherSchema.default({ name: "", location: "" }),
  availability: AvailabilitySchema.default({ format: "", stock: 0 }),
  rating: RatingSchema.default({ average: 0, count: 0 }),
  pdfUrl: z
    .string()
    .optional()
    .describe(
      "URL to downloadable PDF version for testing ADE parse functionality"
    ),
});

export const BookDatabaseSchema = z.object({
  books: z.array(BookSchema).describe("Array of book records"),
});

// TypeScript types inferred from Zod schemas
export type DocumentExtraction = z.infer<typeof DocumentExtractionSchema>;
export type Publisher = z.infer<typeof PublisherSchema>;
export type Availability = z.infer<typeof AvailabilitySchema>;
export type Rating = z.infer<typeof RatingSchema>;
export type Book = z.infer<typeof BookSchema>;
export type BookDatabase = z.infer<typeof BookDatabaseSchema>;
