import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Topbar from './Topbar';
import './Layout.css';

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/books': 'Book Collection',
  '/books/add': 'Add New Book',
  '/students': 'Students',
  '/students/add': 'Add Student',
  '/issues/issue': 'Issue Book',
  '/issues/return': 'Return Book',
  '/issues/history': 'Issue History',
};

function Layout({ children }) {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const title = useMemo(() => {
    if (location.pathname.startsWith('/books/edit')) return 'Edit Book';
    if (location.pathname.startsWith('/students/')) return 'Student Profile';
    return pageTitles[location.pathname] || 'Library MS';
  }, [location.pathname]);

  const initials = (user?.name || 'User')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-shell">
      <button className="sidebar-toggle" onClick={() => setOpen(!open)} aria-label="Toggle sidebar">☰</button>
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <div className="brand-mark">▰</div>
          <div>
            <h1>Library MS</h1>
            <span>Control desk</span>
          </div>
        </div>
        <div className="brand-line" />

        <nav className="sidebar-nav">
          <NavLink to="/dashboard" className="nav-link" onClick={() => setOpen(false)}>⌂ <span>Dashboard</span></NavLink>
          <div className="nav-group-label">Books</div>
          <NavLink to="/books" className="nav-link" onClick={() => setOpen(false)}>▤ <span>All Books</span></NavLink>
          <NavLink to="/books/add" className="nav-link" onClick={() => setOpen(false)}>＋ <span>Add Book</span></NavLink>
          <div className="nav-group-label">Students</div>
          <NavLink to="/students" className="nav-link" onClick={() => setOpen(false)}>◉ <span>All Students</span></NavLink>
          <NavLink to="/students/add" className="nav-link" onClick={() => setOpen(false)}>✚ <span>Add Student</span></NavLink>
          <div className="nav-group-label">Circulation</div>
          <NavLink to="/issues/issue" className="nav-link" onClick={() => setOpen(false)}>→ <span>Issue Book</span></NavLink>
          <NavLink to="/issues/return" className="nav-link" onClick={() => setOpen(false)}>← <span>Return Book</span></NavLink>
          <NavLink to="/issues/history" className="nav-link" onClick={() => setOpen(false)}>↻ <span>Issue History</span></NavLink>
        </nav>

        <div className="sidebar-user">
          <div className="user-mini">
            <div className="avatar">{initials}</div>
            <div>
              <strong>{user?.name || 'Library User'}</strong>
              <span>{user?.role || 'librarian'}</span>
            </div>
          </div>
          <button className="btn btn-primary-custom w-100 btn-sm" onClick={handleLogout}>Logout</button>
        </div>
      </aside>

      <main className="main-content">
        <Topbar title={title} />
        <div className="content-area">{children}</div>
      </main>
    </div>
  );
}

export default Layout;
