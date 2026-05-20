import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../api/axios';
import './Issues.css';

function IssueBookPage() {
  const [step, setStep] = useState(1);
  const [bookSearch, setBookSearch] = useState('');
  const [studentSearch, setStudentSearch] = useState('');
  const [books, setBooks] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        const { data } = await api.get('/books', { params: { search: bookSearch, limit: 6 } });
        setBooks(data.data.books || []);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to search books');
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [bookSearch]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        const { data } = await api.get('/students', { params: { search: studentSearch, limit: 6 } });
        setStudents(data.data.students || []);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to search students');
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [studentSearch]);

  const dueDate = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + 14);
    return date;
  }, []);

  const handleIssue = async () => {
    if (!selectedBook || !selectedStudent) {
      toast.warning('Select both a book and a student');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post('/issues/issue', { bookId: selectedBook._id, studentId: selectedStudent._id });
      toast.success('Book issued successfully');
      setSuccess(data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to issue book');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep(1);
    setSelectedBook(null);
    setSelectedStudent(null);
    setSuccess(null);
  };

  if (success) {
    return (
      <div className="issue-success page-enter card-custom">
        <div className="success-tick">✓</div>
        <h1>Book Issued</h1>
        <p><strong>{success.book?.title}</strong> is now issued to <strong>{success.student?.name}</strong>.</p>
        <p>Due date: {formatDate(success.dueDate)}</p>
        <button className="btn btn-primary-custom" onClick={reset}>Issue Another</button>
      </div>
    );
  }

  return (
    <div className="issue-page page-enter">
      <div className="visual-stepper card-custom">
        <button className={step === 1 ? 'active' : ''} onClick={() => setStep(1)}>1 Select Book</button>
        <button className={step === 2 ? 'active' : ''} onClick={() => setStep(2)} disabled={!selectedBook}>2 Select Student</button>
      </div>

      {step === 1 && (
        <SelectionPanel
          title="Select Book"
          search={bookSearch}
          setSearch={setBookSearch}
          placeholder="Search books by title, author, category..."
          items={books}
          selected={selectedBook}
          onSelect={(book) => { setSelectedBook(book); setStep(2); }}
          render={(book) => (
            <>
              <strong>{book.title}</strong>
              <span>{book.author}</span>
              <em>{book.availableCopies} copies available</em>
            </>
          )}
        />
      )}

      {step === 2 && (
        <SelectionPanel
          title="Select Student"
          search={studentSearch}
          setSearch={setStudentSearch}
          placeholder="Search students by name or roll number..."
          items={students}
          selected={selectedStudent}
          onSelect={setSelectedStudent}
          render={(student) => (
            <>
              <strong>{student.name}</strong>
              <span>{student.rollNumber}</span>
              <em>{student.department || 'No department'}</em>
            </>
          )}
        />
      )}

      <div className="issue-summary card-custom">
        <h3>Issue Summary</h3>
        <div><span>Book</span><strong>{selectedBook?.title || 'Not selected'}</strong></div>
        <div><span>Student</span><strong>{selectedStudent?.name || 'Not selected'}</strong></div>
        <div><span>Issue Date</span><strong>{formatDate(new Date())}</strong></div>
        <div><span>Due Date</span><strong>{formatDate(dueDate)}</strong></div>
        <button className="btn btn-primary-custom w-100 mt-3" onClick={handleIssue} disabled={loading || !selectedBook || !selectedStudent}>{loading ? 'Issuing...' : 'Issue Now'}</button>
      </div>
    </div>
  );
}

function SelectionPanel({ title, search, setSearch, placeholder, items, selected, onSelect, render }) {
  return (
    <section className="selection-panel card-custom">
      <h1 className="section-title">{title}</h1>
      <input className="form-control" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={placeholder} />
      <div className="selection-grid">
        {items.map((item) => (
          <button key={item._id} className={`selection-card ${selected?._id === item._id ? 'selected' : ''}`} onClick={() => onSelect(item)}>
            {render(item)}
          </button>
        ))}
      </div>
    </section>
  );
}

function formatDate(value) {
  return new Date(value).toLocaleDateString();
}

export default IssueBookPage;
