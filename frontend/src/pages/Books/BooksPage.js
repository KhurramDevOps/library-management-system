import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../api/axios';
import BookCard from '../../components/BookCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import './Books.css';

function BooksPage() {
  const [searchParams] = useSearchParams();
  const [books, setBooks] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 1, limit: 10 });
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [bookToDelete, setBookToDelete] = useState(null);

  const categories = useMemo(() => ['Computer Science', 'Science', 'Fiction', 'Self Help', 'Mathematics', 'History'], []);

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/books', { params: { search, category, page, limit: 12 } });
      setBooks(data.data.books || []);
      setPagination(data.data.pagination || { page, total: data.data.total || 0, pages: 1, limit: 12 });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load books');
    } finally {
      setLoading(false);
    }
  }, [search, category, page]);

  useEffect(() => {
    const timer = setTimeout(fetchBooks, 300);
    return () => clearTimeout(timer);
  }, [fetchBooks]);

  const handleDelete = async () => {
    if (!bookToDelete) return;
    try {
      await api.delete(`/books/${bookToDelete._id}`);
      toast.success('Book deleted');
      setBookToDelete(null);
      fetchBooks();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete book');
    }
  };

  return (
    <div className="books-page page-enter">
      <div className="page-toolbar">
        <div>
          <h1 className="section-title">Book Collection</h1>
          <p>Search, edit, and curate the catalog your library depends on.</p>
        </div>
        <Link className="btn btn-primary-custom" to="/books/add">Add Book</Link>
      </div>

      <div className="filter-card card-custom">
        <input className="form-control" placeholder="Search by title or author..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        <select className="form-select" value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }}>
          <option value="">All categories</option>
          {categories.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
        <span>{pagination.total || 0} results</span>
      </div>

      {loading ? <LoadingSpinner label="Loading books..." /> : (
        <>
          <div className="row g-4">
            {books.map((book) => (
              <div className="col-md-4 col-xl-3" key={book._id}>
                <BookCard book={book} onDelete={setBookToDelete} />
              </div>
            ))}
            {books.length === 0 && <div className="empty-state card-custom">No books match this search.</div>}
          </div>

          <div className="pagination-row">
            <span>Showing {books.length ? ((pagination.page - 1) * pagination.limit) + 1 : 0}-{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} books</span>
            <div className="btn-group">
              <button className="btn btn-outline-custom" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
              <button className="btn btn-outline-custom" disabled>{page}</button>
              <button className="btn btn-outline-custom" disabled={page >= pagination.pages} onClick={() => setPage(page + 1)}>Next</button>
            </div>
          </div>
        </>
      )}

      {bookToDelete && (
        <div className="modal-backdrop-custom">
          <div className="confirm-modal card-custom">
            <h3>Delete Book?</h3>
            <p>“{bookToDelete.title}” will be removed from the catalog if it has no active issues.</p>
            <div className="d-flex gap-2 justify-content-end">
              <button className="btn btn-outline-custom" onClick={() => setBookToDelete(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BooksPage;
