import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../api/axios';
import Badge from '../../components/Badge';
import DataTable from '../../components/DataTable';
import LoadingSpinner from '../../components/LoadingSpinner';
import './Students.css';

function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/students', { params: { search } });
      setStudents(data.data.students || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load students');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(fetchStudents, 300);
    return () => clearTimeout(timer);
  }, [fetchStudents]);

  const columns = [
    { key: 'index', label: '#', render: (row, index) => index + 1 },
    { key: 'name', label: 'Student', render: (row) => <StudentName student={row} /> },
    { key: 'rollNumber', label: 'Roll Number' },
    { key: 'department', label: 'Department', render: (row) => row.department || '-' },
    { key: 'phone', label: 'Phone', render: (row) => row.phone || '-' },
    { key: 'isActive', label: 'Status', render: (row) => <Badge status={row.isActive ? 'active' : 'inactive'} /> },
  ];

  return (
    <div className="students-page page-enter">
      <div className="page-toolbar">
        <div>
          <h1 className="section-title">Students</h1>
          <p>Structured records for everyone borrowing from the library.</p>
        </div>
        <Link className="btn btn-primary-custom" to="/students/add">Add Student</Link>
      </div>
      <div className="filter-card card-custom">
        <input className="form-control" placeholder="Search by name or roll number..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <span>{students.length} visible records</span>
      </div>
      {loading ? <LoadingSpinner label="Loading students..." /> : (
        <DataTable
          columns={columns}
          data={students}
          actions={(row) => (
            <div className="d-flex gap-2 justify-content-end">
              <Link className="icon-button" to={`/students/${row._id}`} title="View student">👁</Link>
              <Link className="icon-button" to={`/students/${row._id}`} title="Edit student">✎</Link>
            </div>
          )}
          emptyText="No students found."
        />
      )}
    </div>
  );
}

function StudentName({ student }) {
  const initials = student.name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div className="student-name-cell">
      <div className="student-avatar">{initials}</div>
      <strong>{student.name}</strong>
    </div>
  );
}

export default StudentsPage;
