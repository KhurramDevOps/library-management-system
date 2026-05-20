import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../api/axios';
import './Auth.css';

function RegisterPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'librarian',
  });
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const strength = useMemo(() => {
    let score = 0;
    if (form.password.length >= 6) score += 1;
    if (form.password.length >= 10) score += 1;
    if (/[^A-Za-z0-9]/.test(form.password)) score += 1;
    return ['weak', 'medium', 'strong'][Math.max(0, score - 1)] || 'weak';
  }, [form.password]);

  const errors = {
    name: touched.name && !form.name ? 'Full name is required' : '',
    email: touched.email && !/^\S+@\S+\.\S+$/.test(form.email) ? 'Enter a valid email' : '',
    password: touched.password && form.password.length < 6 ? 'Password must be at least 6 characters' : '',
    confirmPassword: touched.confirmPassword && form.confirmPassword !== form.password ? 'Passwords do not match' : '',
  };

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setTouched({ name: true, email: true, password: true, confirmPassword: true });

    if (!form.name || !/^\S+@\S+\.\S+$/.test(form.email) || form.password.length < 6 || form.confirmPassword !== form.password) {
      toast.error('Please fix the highlighted fields');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/register', {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
      });
      toast.success('Account created. Please sign in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to register');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell auth-shell-reverse page-enter">
      <div className="auth-panel">
        <div className="auth-card register-card">
          <Link className="auth-logo" to="/">▰ <span>LibraryMS</span></Link>
          <h1>Create Account</h1>
          <p>Register an admin or librarian profile</p>
          <form onSubmit={handleSubmit}>
            <Field label="Full Name" name="name" value={form.name} error={errors.name} onChange={handleChange} onBlur={() => setTouched({ ...touched, name: true })} />
            <Field label="Email" name="email" type="email" value={form.email} error={errors.email} onChange={handleChange} onBlur={() => setTouched({ ...touched, email: true })} />
            <Field label="Password" name="password" type="password" value={form.password} error={errors.password} onChange={handleChange} onBlur={() => setTouched({ ...touched, password: true })} />
            <div className={`strength strength-${strength}`}><span /></div>
            <small className="text-secondary text-capitalize">{strength} password</small>
            <Field label="Confirm Password" name="confirmPassword" type="password" value={form.confirmPassword} error={errors.confirmPassword} onChange={handleChange} onBlur={() => setTouched({ ...touched, confirmPassword: true })} />
            <label className="form-label mt-3">Role</label>
            <select className="form-select" name="role" value={form.role} onChange={handleChange}>
              <option value="librarian">Librarian</option>
              <option value="admin">Admin</option>
            </select>
            <button className="btn btn-primary-custom w-100 mt-4" disabled={loading}>{loading ? 'Creating...' : 'Create Account →'}</button>
          </form>
          <p className="auth-switch mt-3">Already registered? <Link to="/login">Sign in</Link></p>
        </div>
      </div>
      <div className="auth-art">
        <div className="book-stack right-stack">
          <span /><span /><span /><span />
        </div>
        <blockquote>Elegant records make every library feel effortless.</blockquote>
        <ul>
          <li>✓ Secure JWT authentication</li>
          <li>✓ Role-aware workflows</li>
          <li>✓ Designed for daily use</li>
        </ul>
      </div>
    </div>
  );
}

function Field({ label, error, ...props }) {
  return (
    <div className="mt-3">
      <label className="form-label">{label}</label>
      <input className={`form-control ${error ? 'is-invalid' : ''}`} {...props} />
      {error && <div className="invalid-feedback">{error}</div>}
    </div>
  );
}

export default RegisterPage;
