import { useState, useMemo } from "react";
import type { Book } from "../schema/books";

interface BookLibraryProps {
  books: Book[];
  onSelectBook: (book: Book | null) => void;
  selectedBookId?: string;
}

type SortOption = "title" | "year" | "rating" | "stock";
type FilterStock = "all" | "available" | "out-of-stock";

const BookLibrary = ({
  books,
  onSelectBook,
  selectedBookId,
}: BookLibraryProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortOption>("title");
  const [stockFilter, setStockFilter] = useState<FilterStock>("all");

  // Extract unique genres from all books
  const allGenres = useMemo(() => {
    const genreSet = new Set<string>();
    books.forEach((book) => book.genres.forEach((g) => genreSet.add(g)));
    return Array.from(genreSet).sort();
  }, [books]);

  // Filter and sort books
  const filteredBooks = useMemo(() => {
    const result = books.filter((book) => {
      // Search filter
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        book.title.toLowerCase().includes(searchLower) ||
        book.authors.some((author) =>
          author.toLowerCase().includes(searchLower)
        ) ||
        book.isbn.toLowerCase().includes(searchLower);

      // Genre filter
      const matchesGenre =
        selectedGenre === "all" || book.genres.includes(selectedGenre);

      // Stock filter
      const matchesStock =
        stockFilter === "all" ||
        (stockFilter === "available" && book.availability.stock > 0) ||
        (stockFilter === "out-of-stock" && book.availability.stock === 0);

      return matchesSearch && matchesGenre && matchesStock;
    });

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case "title":
          return a.title.localeCompare(b.title);
        case "year":
          return b.publishedYear - a.publishedYear;
        case "rating":
          return b.rating.average - a.rating.average;
        case "stock":
          return b.availability.stock - a.availability.stock;
        default:
          return 0;
      }
    });

    return result;
  }, [books, searchTerm, selectedGenre, sortBy, stockFilter]);

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { label: "Out of Stock", class: "stock-out" };
    if (stock <= 5)
      return { label: `Low Stock (${stock})`, class: "stock-low" };
    return { label: `In Stock (${stock})`, class: "stock-in" };
  };

  const getRatingStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <>
        {"★".repeat(fullStars)}
        {hasHalfStar && "⯨"}
        {"☆".repeat(emptyStars)}
      </>
    );
  };

  return (
    <section className="book-library">
      <header className="library-header">
        <h2>📚 Book Collection ({filteredBooks.length})</h2>

        <div className="library-controls">
          {/* Search */}
          <div className="control-group">
            <label htmlFor="search">🔍 Search</label>
            <input
              id="search"
              type="text"
              placeholder="Search by title, author, or ISBN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          {/* Genre Filter */}
          <div className="control-group">
            <label htmlFor="genre">📖 Genre</label>
            <select
              id="genre"
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Genres</option>
              {allGenres.map((genre) => (
                <option key={genre} value={genre}>
                  {genre}
                </option>
              ))}
            </select>
          </div>

          {/* Stock Filter */}
          <div className="control-group">
            <label htmlFor="stock">📦 Availability</label>
            <select
              id="stock"
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value as FilterStock)}
              className="filter-select"
            >
              <option value="all">All Books</option>
              <option value="available">Available</option>
              <option value="out-of-stock">Out of Stock</option>
            </select>
          </div>

          {/* Sort */}
          <div className="control-group">
            <label htmlFor="sort">⬍ Sort By</label>
            <select
              id="sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="filter-select"
            >
              <option value="title">Title (A-Z)</option>
              <option value="year">Year (Newest)</option>
              <option value="rating">Rating (Highest)</option>
              <option value="stock">Stock (Most)</option>
            </select>
          </div>
        </div>
      </header>

      {filteredBooks.length === 0 ? (
        <div className="no-results">
          <p>📭 No books match your filters.</p>
          <button
            className="reset-filters-btn"
            onClick={() => {
              setSearchTerm("");
              setSelectedGenre("all");
              setStockFilter("all");
            }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="books-grid-enhanced">
          {filteredBooks.map((book) => {
            const stockStatus = getStockStatus(book.availability.stock);
            const isSelected = selectedBookId === book.id;

            return (
              <div
                key={book.id}
                className={`book-card-enhanced ${isSelected ? "selected" : ""}`}
                onClick={() => onSelectBook(isSelected ? null : book)}
              >
                {/* Stock Badge */}
                <div className={`stock-badge ${stockStatus.class}`}>
                  {stockStatus.label}
                </div>

                {/* PDF Badge */}
                {book.pdfUrl && (
                  <div className="pdf-badge" title="PDF Available">
                    📄
                  </div>
                )}

                {/* Book Content */}
                <div className="book-header">
                  <h3 className="book-title">{book.title}</h3>
                  <p className="book-authors">{book.authors.join(", ")}</p>
                </div>

                <div className="book-meta">
                  <div className="meta-row">
                    <span className="meta-label">Year:</span>
                    <span className="meta-value">{book.publishedYear}</span>
                  </div>
                  <div className="meta-row">
                    <span className="meta-label">Pages:</span>
                    <span className="meta-value">{book.pages}</span>
                  </div>
                  <div className="meta-row">
                    <span className="meta-label">Format:</span>
                    <span className="meta-value">
                      {book.availability.format}
                    </span>
                  </div>
                </div>

                {/* Rating */}
                <div className="book-rating">
                  <span className="rating-stars">
                    {getRatingStars(book.rating.average)}
                  </span>
                  <span className="rating-text">
                    {book.rating.average.toFixed(1)} ({book.rating.count}{" "}
                    reviews)
                  </span>
                </div>

                {/* Genres */}
                <div className="book-genres">
                  {book.genres.slice(0, 3).map((genre, idx) => (
                    <span key={idx} className="genre-tag-enhanced">
                      {genre}
                    </span>
                  ))}
                  {book.genres.length > 3 && (
                    <span className="genre-tag-enhanced more">
                      +{book.genres.length - 3}
                    </span>
                  )}
                </div>

                {/* Publisher */}
                <div className="book-publisher">
                  <small>
                    {book.publisher.name}
                    {book.publisher.location && ` · ${book.publisher.location}`}
                  </small>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default BookLibrary;
