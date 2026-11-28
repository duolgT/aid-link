import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { HeartHandshake, Mail, Lock, AlertCircle, CheckCircle, Hash } from 'lucide-react';

function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const emailFromState = location.state?.email || '';
  const devCode = location.state?.devCode || null;

  const [formData, setFormData] = useState({
    email: emailFromState,
    code: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.code.length !== 6) {
      setError('Please enter the 6-digit reset code');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:3000/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          code: formData.code,
          newPassword: formData.newPassword
        })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        // Redirect to login after 2 seconds
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(data.message || 'Failed to reset password');
      }
    } catch (err) {
      setError('An error occurred. Please check if the backend server is running.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <Link to="/" className="auth-brand">
            <div className="brand-icon">
              <HeartHandshake size={28} />
            </div>
            <div className="brand-text">
              <strong>AidLink</strong>
              <small>KAKUMA</small>
            </div>
          </Link>
          
          <h1 className="auth-title">Reset Password</h1>
          <p className="auth-subtitle">
            Enter the code from your email and create a new password
          </p>
          {devCode && (
            <div style={{
              marginTop: '16px',
              padding: '12px',
              background: '#fff7ed',
              border: '2px solid #ea580c',
              borderRadius: '8px',
              fontSize: '14px'
            }}>
              <strong>⚠️ Development Mode:</strong><br />
              Email sending failed. Your reset code is: <strong style={{ fontSize: '18px', color: '#ea580c' }}>{devCode}</strong>
            </div>
          )}
        </div>

        {success ? (
          <div className="alert alert-success">
            <CheckCircle size={20} />
            <span>Password reset successfully! Redirecting to login...</span>
          </div>
        ) : (
          <form className="auth-form" onSubmit={handleSubmit}>
            {error && (
              <div className="alert alert-error">
                <AlertCircle size={20} />
                <span>{error}</span>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email" className="form-label">
                <Mail size={16} />
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="form-input"
                placeholder="organization@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="code" className="form-label">
                <Hash size={16} />
                6-Digit Reset Code
              </label>
              <input
                type="text"
                id="code"
                name="code"
                className="form-input"
                placeholder="000000"
                value={formData.code}
                onChange={handleChange}
                maxLength={6}
                pattern="[0-9]{6}"
                required
                disabled={loading}
                style={{ 
                  fontSize: '24px', 
                  letterSpacing: '8px', 
                  textAlign: 'center',
                  fontFamily: 'monospace'
                }}
              />
              <small style={{ color: '#64748b', fontSize: '12px' }}>
                Check your email for the 6-digit reset code
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="newPassword" className="form-label">
                <Lock size={16} />
                New Password
              </label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                className="form-input"
                placeholder="Minimum 8 characters"
                value={formData.newPassword}
                onChange={handleChange}
                minLength={8}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                <Lock size={16} />
                Confirm New Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                className="form-input"
                placeholder="Re-enter your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                minLength={8}
                required
                disabled={loading}
              />
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}

        <div className="auth-footer">
          <p>Remember your password? <Link to="/login">Sign in</Link></p>
        </div>

        <div className="auth-back">
          <Link to="/">← Back to Home</Link>
        </div>
      </div>
    </div>
  );
}

export default ResetPasswordPage;
