import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Loader, Mail } from 'lucide-react';
import API from '../config/api';

function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Verification token is missing');
      return;
    }

    verifyEmail();
  }, [token]);

  async function verifyEmail() {
    try {
      setStatus('verifying');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/verify-email/${token}`);
      const data = await response.json();

      if (data.success) {
        setStatus('success');
        setMessage(data.message || 'Email verified successfully!');
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login', { 
            state: { 
              message: 'Email verified! You can now log in.',
              type: 'success'
            } 
          });
        }, 3000);
      } else {
        setStatus('error');
        setMessage(data.message || 'Verification failed');
      }
    } catch (error) {
      console.error('Verification error:', error);
      setStatus('error');
      setMessage('Something went wrong. Please try again.');
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header" style={{textAlign: 'center'}}>
            <div style={{
              width: '80px',
              height: '80px',
              margin: '0 auto 24px',
              background: status === 'verifying' ? '#f1f5f9' : status === 'success' ? '#e5f5f3' : '#fef2f2',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {status === 'verifying' && (
                <Loader size={40} style={{color: '#64748b'}} className="spin-animation" />
              )}
              {status === 'success' && (
                <CheckCircle size={40} style={{color: '#087c75'}} />
              )}
              {status === 'error' && (
                <XCircle size={40} style={{color: '#dc2626'}} />
              )}
            </div>

            <h1 style={{marginBottom: '12px'}}>
              {status === 'verifying' && 'Verifying Email...'}
              {status === 'success' && 'Email Verified!'}
              {status === 'error' && 'Verification Failed'}
            </h1>
            
            <p style={{color: '#64748b', fontSize: '15px'}}>
              {message || 'Please wait while we verify your email address.'}
            </p>
          </div>

          {status === 'success' && (
            <div style={{
              marginTop: '32px',
              padding: '16px',
              background: '#e5f5f3',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <p style={{margin: 0, color: '#087c75', fontSize: '14px'}}>
                ✅ Redirecting you to login in 3 seconds...
              </p>
            </div>
          )}

          {status === 'error' && (
            <div style={{marginTop: '32px'}}>
              <button
                onClick={() => navigate('/login')}
                className="btn btn-primary"
                style={{width: '100%'}}
              >
                Go to Login
              </button>
              <button
                onClick={() => navigate('/register')}
                className="btn btn-secondary"
                style={{width: '100%', marginTop: '12px'}}
              >
                Register New Account
              </button>
            </div>
          )}
        </div>

        <p className="auth-footer-text">
          Need help? <a href="/login">Contact support</a>
        </p>
      </div>

      <style>{`
        .spin-animation {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default VerifyEmailPage;
