import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../api/axios';
import Badge from '../../components/Badge';
import './Issues.css';

function ReturnBookPage() {
  const [search, setSearch] = useState('');
  const [issues, setIssues] = useState([]);
  const [result, setResult] = useState(null);
  const [loadingId, setLoadingId] = useState(null);

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const { data } = await api.get('/issues', { params: { status: 'issued', limit: 100 } });
        setIssues(data.data.issues || []);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to load issued books');
      }
    };
    fetchIssues();
  }, [result]);

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return issues.filter((issue) => (
      issue.book?.title?.toLowerCase().includes(term) ||
      issue.student?.name?.toLowerCase().includes(term) ||
      issue.student?.rollNumber?.toLowerCase().includes(term)
    ));
  }, [issues, search]);

  const returnBook = async (issue) => {
    setLoadingId(issue._id);
    try {
      const { data } = await api.post(`/issues/return/${issue._id}`);
      toast.success('Book returned successfully');
      setResult(data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to return book');
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="return-page page-enter">
      <div className="page-toolbar">
        <div>
          <h1 className="section-title">Return Book</h1>
          <p>Find the current issue and close it with one confident click.</p>
        </div>
      </div>
      {result && (
        <div className={`return-result card-custom ${result.fine > 0 ? 'late' : 'ontime'}`}>
          <h3>{result.fine > 0 ? `Returned late! Fine: Rs. ${result.fine}` : 'Returned successfully! No fine.'}</h3>
          <p>{result.book?.title} returned by {result.student?.name}</p>
        </div>
      )}
      <div className="filter-card card-custom">
        <input className="form-control" placeholder="Search by student, roll number, or book title..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>
      <div className="issued-list">
        {filtered.map((issue) => {
          const overdue = new Date(issue.dueDate) < new Date();
          return (
            <div className="issued-row card-custom" key={issue._id}>
              <div>
                <h3>{issue.book?.title}</h3>
                <p>{issue.student?.name} • {issue.student?.rollNumber}</p>
                <span>Issued {formatDate(issue.issueDate)} • Due {formatDate(issue.dueDate)}</span>
              </div>
              {overdue && <Badge status="overdue" />}
              <button className="btn btn-primary-custom" onClick={() => returnBook(issue)} disabled={loadingId === issue._id}>{loadingId === issue._id ? 'Returning...' : 'Return This Book'}</button>
            </div>
          );
        })}
        {filtered.length === 0 && <div className="empty-state card-custom">No currently issued books match your search.</div>}
      </div>
    </div>
  );
}

function formatDate(value) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString();
}

export default ReturnBookPage;
