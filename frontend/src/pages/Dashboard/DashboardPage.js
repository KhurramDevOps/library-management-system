import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../api/axios';
import Badge from '../../components/Badge';
import DataTable from '../../components/DataTable';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatCard from '../../components/StatCard';
import './Dashboard.css';

function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/dashboard/stats');
        setStats(data.data);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <LoadingSpinner label="Loading dashboard..." />;

  const rows = stats?.recentIssues || [];
  const columns = [
    { key: 'index', label: '#', render: (row, index) => index + 1 },
    { key: 'book', label: 'Book Title', render: (row) => row.book?.title || 'Unknown book' },
    { key: 'student', label: 'Student', render: (row) => row.student?.name || 'Unknown student' },
    { key: 'issueDate', label: 'Issue Date', render: (row) => formatDate(row.issueDate) },
    { key: 'dueDate', label: 'Due Date', render: (row) => formatDate(row.dueDate) },
    { key: 'status', label: 'Status', render: (row) => <Badge status={row.status} /> },
  ];

  return (
    <div className="dashboard-page page-enter">
      {stats?.totalOverdue > 0 && (
        <div className="overdue-alert">
          <strong>⚠ {stats.totalOverdue} books are overdue.</strong>
          <Link to="/issues/history">View them →</Link>
        </div>
      )}

      <div className="row g-4">
        <div className="col-md-6 col-xl-3"><StatCard icon="▣" label="Total Books" value={stats?.totalBooks || 0} color="var(--info)" trend="Active this month" /></div>
        <div className="col-md-6 col-xl-3"><StatCard icon="◉" label="Total Students" value={stats?.totalStudents || 0} color="var(--success)" trend="Registered learners" /></div>
        <div className="col-md-6 col-xl-3"><StatCard icon="→" label="Books Issued" value={stats?.totalIssued || 0} color="var(--accent)" trend="Currently out" /></div>
        <div className="col-md-6 col-xl-3"><StatCard icon="!" label="Overdue Books" value={stats?.totalOverdue || 0} color="var(--danger)" trend="Needs attention" /></div>
      </div>

      <section className="dashboard-section card-custom">
        <div className="section-head">
          <div>
            <h3>Recent Issues</h3>
            <p>Latest circulation records across your library.</p>
          </div>
          <Link to="/issues/history">View All →</Link>
        </div>
        <DataTable columns={columns} data={rows} emptyText="No recent issues yet." />
      </section>

      <div className="row g-4 quick-actions">
        <ActionCard title="Issue a Book" text="Start a fresh circulation record." to="/issues/issue" button="Issue Now" variant="btn-primary-custom" />
        <ActionCard title="Return a Book" text="Close an issue and calculate fine." to="/issues/return" button="Return Book" variant="btn-navy-custom" />
        <ActionCard title="Add New Book" text="Expand your catalog inventory." to="/books/add" button="Add Book" variant="btn-outline-custom" />
      </div>
    </div>
  );
}

function ActionCard({ title, text, to, button, variant }) {
  return (
    <div className="col-lg-4">
      <div className="action-card card-custom">
        <h4>{title}</h4>
        <p>{text}</p>
        <Link className={`btn ${variant}`} to={to}>{button}</Link>
      </div>
    </div>
  );
}

function formatDate(value) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString();
}

export default DashboardPage;
