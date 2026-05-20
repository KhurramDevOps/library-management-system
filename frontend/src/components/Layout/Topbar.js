import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function Topbar({ title }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const initials = (user?.name || 'U').split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase();

  const handleSearch = (event) => {
    if (event.key === 'Enter' && event.target.value.trim()) {
      navigate(`/books?search=${encodeURIComponent(event.target.value.trim())}`);
    }
  };

  return (
    <header className="topbar">
      <div>
        <p className="topbar-kicker">Library Management System</p>
        <h2>{title}</h2>
      </div>
      <div className="topbar-actions">
        <input className="form-control topbar-search" placeholder="Search books..." onKeyDown={handleSearch} />
        <button className="bell-btn" title="Notifications">◌<span>3</span></button>
        <div className="topbar-avatar">{initials}</div>
      </div>
    </header>
  );
}

export default Topbar;
