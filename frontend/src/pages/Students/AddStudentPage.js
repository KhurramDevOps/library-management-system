import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../api/axios';
import './Students.css';

function AddStudentPage() {
  const [form, setForm] = useState({ name: '', rollNumber: '', email: '', phone: '', department: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    const nextErrors = {};
    if (!form.name.trim()) nextErrors.name = 'Name is required';
    if (!form.rollNumber.trim()) nextErrors.rollNumber = 'Roll number is required';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await api.post('/students', form);
      toast.success('Student added successfully!');
      navigate('/students');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add student');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="student-form-page page-enter">
      <div className="form-shell card-custom">
        <div className="section-head">
          <div>
            <h1 className="section-title">Add Student</h1>
            <p>Create a clean borrower profile for circulation.</p>
          </div>
          <Link className="btn btn-outline-custom" to="/students">Cancel</Link>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            {[
              ['name', 'Full Name'],
              ['rollNumber', 'Roll Number'],
              ['email', 'Email'],
              ['phone', 'Phone'],
              ['department', 'Department'],
            ].map(([name, label]) => (
              <div className="col-md-6" key={name}>
                <label className="form-label">{label}</label>
                <input
                  className={`form-control ${errors[name] ? 'is-invalid' : ''}`}
                  type={name === 'email' ? 'email' : 'text'}
                  value={form[name]}
                  onChange={(e) => setForm({ ...form, [name]: e.target.value })}
                />
                {errors[name] && <div className="invalid-feedback">{errors[name]}</div>}
              </div>
            ))}
          </div>
          <button className="btn btn-primary-custom mt-4 px-4" disabled={loading}>{loading ? 'Saving...' : 'Save Student →'}</button>
        </form>
      </div>
    </div>
  );
}

export default AddStudentPage;
