import { useState, useMemo } from "react";
import LandingAIADE from "landingai-ade";
import { bookDatabase } from "./data/books";
import PdfExtractionWorkflow from "./components/PdfExtractionWorkflow";
import BookLibrary from "./components/BookLibrary";
import type { Book } from "./schema/books";
import "./App.css";

function App() {
  const [books] = useState(bookDatabase.books);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  // Check API key availability outside of effect
  const apiKey = import.meta.env.VITE_VISION_AGENT_API_KEY;
  const error = useMemo(() => {
    if (!apiKey) {
      return "VISION_AGENT_API_KEY is not configured. Please add it to your .env file.";
    }
    return "";
  }, [apiKey]);

  const adeClient = useMemo(() => {
    if (!apiKey) return null;
    try {
      const client = new LandingAIADE({
        apikey: apiKey,
      });
      console.log("ADE Client initialized successfully");
      return client;
    } catch (err) {
      console.error(
        `Failed to initialize ADE client: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
      return null;
    }
  }, [apiKey]);

  return (
    <main className="app-container">
      <header className="app-header">
        <h1>📚 Book Data Extraction with ADE</h1>
        <p>
          Explore classic literature from Project Gutenberg with AI-powered data
          extraction
        </p>
      </header>

      {error && (
        <div className="error-banner">
          <strong>⚠️ Error:</strong> {error}
        </div>
      )}

      {adeClient && !error && (
        <div className="status-banner">
          ✅ ADE Client Ready | {books.length} books loaded
        </div>
      )}

      <div className="content-container">
        <BookLibrary
          books={books}
          onSelectBook={setSelectedBook}
          selectedBookId={selectedBook?.id}
        />

        {selectedBook && (
          <section className="book-details-enhanced">
            <h2>📖 Book Details</h2>
            <div className="details-content">
              <h3>{selectedBook.title}</h3>
              <p className="book-subtitle">
                By {selectedBook.authors.join(", ")}
              </p>

              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">📅 Published</span>
                  <span className="detail-value">
                    {selectedBook.publishedYear}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">🏢 Publisher</span>
                  <span className="detail-value">
                    {selectedBook.publisher.name}
                    {selectedBook.publisher.location && (
                      <small> ({selectedBook.publisher.location})</small>
                    )}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">📚 ISBN</span>
                  <span className="detail-value">{selectedBook.isbn}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">📄 Pages</span>
                  <span className="detail-value">{selectedBook.pages}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">🌍 Language</span>
                  <span className="detail-value">{selectedBook.language}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">📦 Format</span>
                  <span className="detail-value">
                    {selectedBook.availability.format}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">🏪 Stock</span>
                  <span
                    className={`detail-value stock-indicator ${
                      selectedBook.availability.stock === 0
                        ? "out"
                        : selectedBook.availability.stock <= 5
                        ? "low"
                        : "in"
                    }`}
                  >
                    {selectedBook.availability.stock === 0
                      ? "Out of Stock"
                      : `${selectedBook.availability.stock} available`}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">⭐ Rating</span>
                  <span className="detail-value">
                    {selectedBook.rating.average.toFixed(1)}/5.0
                    <small> ({selectedBook.rating.count} reviews)</small>
                  </span>
                </div>
              </div>

              <div className="detail-genres">
                <strong>Genres:</strong>
                <div className="genres-list">
                  {selectedBook.genres.map((genre, idx) => (
                    <span key={idx} className="genre-badge">
                      {genre}
                    </span>
                  ))}
                </div>
              </div>

              {selectedBook.pdfUrl && (
                <div className="pdf-section">
                  <a
                    href={selectedBook.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="pdf-download-btn"
                  >
                    📥 Download PDF from Project Gutenberg
                  </a>
                </div>
              )}

              <button
                className="close-details-btn"
                onClick={() => setSelectedBook(null)}
              >
                ✕ Close Details
              </button>
            </div>
          </section>
        )}
      </div>

      {adeClient && !error && <PdfExtractionWorkflow client={adeClient} />}
    </main>
  );
}

export default App;
