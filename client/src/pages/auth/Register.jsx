import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  MdPerson, MdEmail, MdLock, MdVisibility, MdVisibilityOff,
  MdBusiness, MdPhone,
} from 'react-icons/md';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import styles from './Auth.module.css';

const ROLES = [
  { value: 'donor',     label: '🤲 Donor',     desc: 'I want to donate surplus food' },
  { value: 'ngo',       label: '🏢 NGO',        desc: 'We distribute food to people in need' },
  { value: 'volunteer', label: '🙋 Volunteer',  desc: 'I help with food pickup & delivery' },
];

const Register = () => {
  const [form, setForm] = useState({
    name: '', email: '', password: '', role: 'donor',
    phone: '', organization: '',
    address: { city: '', area: '' },
  });
  const [showPass, setShowPass] = useState(false);
  const { register, isLoading } = useAuth();
  const toast    = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'city' || name === 'area') {
      setForm((p) => ({ ...p, address: { ...p.address, [name]: value } }));
    } else {
      setForm((p) => ({ ...p, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      toast.error('Name, email, and password are required');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    const result = await register(form);
    if (result.success) {
      toast.success('Account created! Welcome to FoodBridge 🎉');
      navigate('/dashboard');
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div className={styles.page}>
      <div className={`${styles.card} ${styles.cardWide}`}>
        <Link to="/" className={styles.logo}>
          <span>🍱</span>
          <span>FoodBridge</span>
        </Link>

        <div className={styles.header}>
          <h1 className={styles.title}>Create your account</h1>
          <p className={styles.subtitle}>Join thousands making a difference</p>
        </div>

        {/* Role Selector */}
        <div className={styles.roleGrid}>
          {ROLES.map((r) => (
            <button
              key={r.value}
              type="button"
              className={`${styles.roleCard} ${form.role === r.value ? styles.roleActive : ''}`}
              onClick={() => setForm((p) => ({ ...p, role: r.value }))}
              id={`role-${r.value}`}
            >
              <span className={styles.roleLabel}>{r.label}</span>
              <span className={styles.roleDesc}>{r.desc}</span>
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <div className={styles.formGrid}>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-name">Full Name</label>
              <div className={styles.inputWrapper}>
                <MdPerson className={styles.inputIcon} />
                <input id="reg-name" type="text" name="name" className="form-input"
                  placeholder="John Doe" value={form.name} onChange={handleChange} required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-email">Email Address</label>
              <div className={styles.inputWrapper}>
                <MdEmail className={styles.inputIcon} />
                <input id="reg-email" type="email" name="email" className="form-input"
                  placeholder="you@example.com" value={form.email} onChange={handleChange} required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-password">Password</label>
              <div className={styles.inputWrapper}>
                <MdLock className={styles.inputIcon} />
                <input id="reg-password" type={showPass ? 'text' : 'password'} name="password"
                  className="form-input" placeholder="Min. 6 characters"
                  value={form.password} onChange={handleChange} required />
                <button type="button" className={styles.eyeBtn}
                  onClick={() => setShowPass((p) => !p)}
                  aria-label="Toggle password visibility">
                  {showPass ? <MdVisibilityOff /> : <MdVisibility />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-phone">Phone (optional)</label>
              <div className={styles.inputWrapper}>
                <MdPhone className={styles.inputIcon} />
                <input id="reg-phone" type="tel" name="phone" className="form-input"
                  placeholder="+91 98765 43210" value={form.phone} onChange={handleChange} />
              </div>
            </div>

            {(form.role === 'ngo' || form.role === 'volunteer') && (
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label" htmlFor="reg-org">Organization Name</label>
                <div className={styles.inputWrapper}>
                  <MdBusiness className={styles.inputIcon} />
                  <input id="reg-org" type="text" name="organization" className="form-input"
                    placeholder="Your NGO / Organization name" value={form.organization} onChange={handleChange} />
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="reg-city">City</label>
              <input id="reg-city" type="text" name="city" className="form-input"
                placeholder="Mumbai" value={form.address.city} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-area">Area / Locality</label>
              <input id="reg-area" type="text" name="area" className="form-input"
                placeholder="Andheri West" value={form.address.area} onChange={handleChange} />
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-full" disabled={isLoading} id="register-submit-btn">
            {isLoading ? 'Creating account…' : 'Create Account Free'}
          </button>
        </form>

        <p className={styles.switchText}>
          Already have an account?{' '}
          <Link to="/login" className={styles.switchLink}>Sign in</Link>
        </p>
      </div>

      <div className={styles.bgBlob1} aria-hidden="true" />
      <div className={styles.bgBlob2} aria-hidden="true" />
    </div>
  );
};

export default Register;
