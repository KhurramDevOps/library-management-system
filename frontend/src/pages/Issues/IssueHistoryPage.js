import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../api/axios';
import Badge from '../../components/Badge';
import DataTable from '../../components/DataTable';
import LoadingSpinner from '../../components/LoadingSpinner';
import './Issues.css';

function IssueHistoryPage() {
  const [status, setStatus] = useState('');
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchIssues = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/issues', { params: { status, limit: 50 } });
        setIssues(data.data.issues || []);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to load issue history');
      } finally {
        setLoading(false);
      }
    };
    fetchIssues();
  }, [status]);

  const columns = [
    { key: 'book', label: 'Book', render: (row) => row.book?.title || '-' },
    { key: 'student', label: 'Student', render: (row) => row.student?.name || '-' },
    { key: 'issueDate', label: 'Issued Date', render: (row) => formatDate(row.issueDate) },
    { key: 'dueDate', label: 'Due Date', render: (row) => formatDate(row.dueDate) },
    { key: 'returnDate', label: 'Return Date', render: (row) => formatDate(row.returnDate) },
    { key: 'status', label: 'Status', render: (row) => <Badge status={row.status} /> },
    { key: 'fine', label: 'Fine', render: (row) => `Rs. ${row.fine || 0}` },
  ];

  return (
    <div className="history-page page-enter">
      <div className="page-toolbar">
        <div>
          <h1 className="section-title">Issue History</h1>
          <p>Every movement of every book, captured neatly.</p>
        </div>
        <button className="btn btn-outline-custom" onClick={() => window.print()}>Print</button>
      </div>

      <div className="history-tabs">
        {[
          ['', 'All'],
          ['issued', 'Issued'],
          ['returned', 'Returned'],
          ['overdue', 'Overdue'],
        ].map(([value, label]) => (
          <button key={label} className={status === value ? 'active' : ''} onClick={() => setStatus(value)}>{label}</button>
        ))}
      </div>

      {loading ? <LoadingSpinner label="Loading history..." /> : <DataTable columns={columns} data={issues} emptyText="No issue records found." />}
    </div>
  );
}

function formatDate(value) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString();
}

export default IssueHistoryPage;
