import { useState } from 'react';
import { sendPasswordReset } from '../firebase/config';
import { CircularProgress } from '@mui/material';
// Assuming you might need auth context for redirection or user status later

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      await sendPasswordReset(email);
      setMessage('Password reset email sent. Check your email to reset your password.');
      setEmail('');
    } catch (err) {
      setError(err.message || 'An error occurred while sending the reset email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-page">
      <div className="form-container">
        <h2 className="form-title">Forgot Password</h2>
        {loading && <CircularProgress />}
        {error && <p style={{ color: 'red' }}>Error: {error}</p>}
        {message && <p style={{ color: 'green' }}>{message}</p>}
        <form onSubmit={handleSubmit} className="forgot-password-form">
          <div className="input-group">
            <label htmlFor="email" className="input-label">
              Email Address
            </label>
             <input
              type="text"
              id="email"
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn">
            Send Reset Link
          </button>
        </form>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;