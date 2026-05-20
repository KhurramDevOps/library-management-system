import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../api/axios';
import LoadingSpinner from '../../components/LoadingSpinner';
import './Books.css';

const emptyBook = {
  title: '',
  author: '',
  isbn: '',
  category: '',
  totalCopies: 1,
  publishedYear: '',
  description: '',
};

function BookForm({ mode }) {
  const [form, setForm] = useState(emptyBook);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(mode === 'edit');
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (mode !== 'edit') return;
    const fetchBook = async () => {
      setFetching(true);
      try {
        const { data } = await api.get(`/books/${id}`);
        const book = data.data;
        setForm({
          title: book.title || '',
          author: book.author || '',
          isbn: book.isbn || '',
          category: book.category || '',
          totalCopies: book.totalCopies || 1,
          publishedYear: book.publishedYear || '',
          description: book.description || '',
        });
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to load book');
      } finally {
        setFetching(false);
      }
    };
    fetchBook();
  }, [id, mode]);

  const validate = () => {
    const nextErrors = {};
    if (!form.title.trim()) nextErrors.title = 'Title is required';
    if (!form.author.trim()) nextErrors.author = 'Author is required';
    if (!form.category.trim()) nextErrors.category = 'Category is required';
    if (Number(form.totalCopies) < 1) nextErrors.totalCopies = 'Copies must be at least 1';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const payload = {
        ...form,
        totalCopies: Number(form.totalCopies),
        publishedYear: form.publishedYear ? Number(form.publishedYear) : undefined,
      };
      if (mode === 'edit') {
        await api.put(`/books/${id}`, payload);
        toast.success('Book updated!');
      } else {
        await api.post('/books', payload);
        toast.success('Book added successfully!');
      }
      navigate('/books');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save book');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <LoadingSpinner label="Loading book..." />;

  return (
    <div className="book-form-page page-enter">
      <div className="form-shell card-custom">
        <div className="section-head">
          <div>
            <h1 className="section-title">{mode === 'edit' ? 'Edit Book' : 'Add New Book'}</h1>
            <p>Keep every catalog detail polished and searchable.</p>
          </div>
          <Link className="btn btn-outline-custom" to="/books">Cancel</Link>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <Field className="col-md-6" label="Book Title" name="title" value={form.title} error={errors.title} onChange={setForm} form={form} />
            <Field className="col-md-6" label="Author" name="author" value={form.author} error={errors.author} onChange={setForm} form={form} />
            <Field className="col-md-6" label="ISBN" name="isbn" value={form.isbn} hint="Optional" onChange={setForm} form={form} />
            <div className="col-md-6">
              <label className="form-label">Category</label>
              <select className={`form-select ${errors.category ? 'is-invalid' : ''}`} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                <option value="">Select category</option>
                {['Computer Science', 'Science', 'Fiction', 'Self Help', 'Mathematics', 'History'].map((item) => <option key={item}>{item}</option>)}
              </select>
              {errors.category && <div className="invalid-feedback">{errors.category}</div>}
            </div>
            <Field className="col-md-6" label="Total Copies" name="totalCopies" type="number" min="1" value={form.totalCopies} error={errors.totalCopies} onChange={setForm} form={form} />
            <Field className="col-md-6" label="Published Year" name="publishedYear" type="number" value={form.publishedYear} onChange={setForm} form={form} />
            <div className="col-12">
              <label className="form-label">Description</label>
              <textarea className="form-control" rows="3" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
          </div>
          <button className="btn btn-primary-custom mt-4 px-4" disabled={loading}>{loading ? 'Saving...' : 'Save Book →'}</button>
        </form>
      </div>
    </div>
  );
}

function Field({ className, label, name, error, hint, onChange, form, ...props }) {
  return (
    <div className={className}>
      <label className="form-label">{label}</label>
      <input className={`form-control ${error ? 'is-invalid' : ''}`} name={name} onChange={(e) => onChange({ ...form, [name]: e.target.value })} {...props} />
      {hint && <small className="text-secondary">{hint}</small>}
      {error && <div className="invalid-feedback">{error}</div>}
    </div>
  );
}

export default BookForm;
