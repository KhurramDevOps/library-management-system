import { Link } from 'react-router-dom';

const categoryColors = ['#3498db', '#2ecc71', '#e94560', '#f5a623', '#7f5af0'];

function BookCard({ book, onDelete }) {
  const color = categoryColors[(book.category || '').length % categoryColors.length];
  const total = book.totalCopies || 1;
  const available = book.availableCopies || 0;
  const percent = Math.max(0, Math.min(100, (available / total) * 100));

  return (
    <div className="book-card card-custom">
      <div className="book-card-top" style={{ background: color }} />
      <div className="book-card-body">
        <span className="book-category">{book.category}</span>
        <h3>{book.title}</h3>
        <p>{book.author}</p>
        <div className="copy-row">
          <span>{available} / {total} copies</span>
          <strong>{available > 0 ? 'Available' : 'Out'}</strong>
        </div>
        <div className="copy-track">
          <span style={{ width: `${percent}%`, background: color }} />
        </div>
        <div className="book-actions">
          <Link to={`/books/edit/${book._id}`} className="icon-button" title="Edit book">✎</Link>
          <button className="icon-button danger-hover" onClick={() => onDelete(book)} title="Delete book">🗑</button>
        </div>
      </div>
    </div>
  );
}

export default BookCard;
