import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../api/axios';
import Badge from '../../components/Badge';
import DataTable from '../../components/DataTable';
import LoadingSpinner from '../../components/LoadingSpinner';
import './Students.css';

function StudentDetailPage() {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [activeIssues, setActiveIssues] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudent = async () => {
      setLoading(true);
      try {
        const [profileRes, historyRes] = await Promise.all([
          api.get(`/students/${id}`),
          api.get(`/issues/student/${id}`),
        ]);
        setStudent(profileRes.data.data.student);
        setActiveIssues(profileRes.data.data.activeIssues || []);
        setHistory(historyRes.data.data.issues || []);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to load student profile');
      } finally {
        setLoading(false);
      }
    };
    fetchStudent();
  }, [id]);

  if (loading) return <LoadingSpinner label="Loading student..." />;
  if (!student) return <div className="empty-state card-custom">Student not found.</div>;

  const columns = [
    { key: 'book', label: 'Book', render: (row) => row.book?.title || 'Unknown book' },
    { key: 'issueDate', label: 'Issued', render: (row) => formatDate(row.issueDate) },
    { key: 'dueDate', label: 'Due', render: (row) => formatDate(row.dueDate) },
    { key: 'returnDate', label: 'Returned', render: (row) => formatDate(row.returnDate) },
    { key: 'status', label: 'Status', render: (row) => <Badge status={row.status} /> },
    { key: 'fine', label: 'Fine', render: (row) => `Rs. ${row.fine || 0}` },
  ];

  return (
    <div className="student-detail page-enter">
      <div className="student-profile-card card-custom">
        <div className="student-avatar lg">{student.name[0]}</div>
        <div>
          <h1>{student.name}</h1>
          <p>{student.rollNumber} • {student.department || 'No department'}</p>
          <div className="student-meta">
            <span>{student.email || 'No email'}</span>
            <span>{student.phone || 'No phone'}</span>
            <Badge status={student.isActive ? 'active' : 'inactive'} />
          </div>
        </div>
        <Link className="btn btn-outline-custom ms-auto" to="/students">Back</Link>
      </div>

      {activeIssues.length > 0 && (
        <section className="active-issues card-custom">
          <h3>Active Issues</h3>
          <DataTable columns={columns.slice(0, 5)} data={activeIssues} />
        </section>
      )}

      <section className="card-custom active-issues">
        <h3>Full Issue History</h3>
        <DataTable columns={columns} data={history} emptyText="No issue history yet." />
      </section>
    </div>
  );
}

function formatDate(value) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString();
}

export default StudentDetailPage;
