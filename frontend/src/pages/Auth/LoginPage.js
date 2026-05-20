import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      login(data.data.token, data.data.user);
      toast.success('Welcome back to LibraryMS');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell page-enter">
      <div className="auth-art">
        <div className="book-stack">
          <span /><span /><span /><span />
        </div>
        <blockquote>Knowledge is the most powerful tool in any library.</blockquote>
        <ul>
          <li>✓ Track circulation in seconds</li>
          <li>✓ Know every overdue book</li>
          <li>✓ Keep student records clean</li>
        </ul>
      </div>
      <div className="auth-panel">
        <div className="auth-card">
          <Link className="auth-logo" to="/">▰ <span>LibraryMS</span></Link>
          <h1>Welcome Back</h1>
          <p>Sign in to your account</p>
          <form onSubmit={handleSubmit}>
            <label className="form-label">Email</label>
            <input className="form-control" name="email" type="email" value={form.email} onChange={handleChange} required />

            <div className="d-flex justify-content-between align-items-center mt-3">
              <label className="form-label mb-0">Password</label>
              <button className="link-button" type="button">Forgot Password?</button>
            </div>
            <div className="password-field">
              <input className="form-control" name="password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={handleChange} required />
              <button type="button" onClick={() => setShowPassword(!showPassword)}>{showPassword ? 'Hide' : 'Show'}</button>
            </div>

            <button className="btn btn-primary-custom w-100 mt-4" type="submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>
          </form>
          <div className="auth-divider"><span>or</span></div>
          <p className="auth-switch">Don&apos;t have an account? <Link to="/register">Register here</Link></p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
