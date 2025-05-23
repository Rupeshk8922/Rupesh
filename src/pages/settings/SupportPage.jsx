import { useState } from 'react';

function SupportPage() {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    const newErrors = {};
    if (!subject.trim()) newErrors.subject = 'Subject is required';
    if (!message.trim()) newErrors.message = 'Message is required';

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      try {
        setLoading(true);
        // TODO: Replace with your backend call, e.g., send to Firestore or API
        await new Promise((res) => setTimeout(res, 1000)); // simulate network delay
        console.log('Support message submitted:', { subject, message });
        setSuccessMessage('Your support message has been sent!');
        setSubject('');
        setMessage('');
      } catch {
        setErrors({ submit: 'Failed to send message. Please try again later.' });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Support</h1>

      <form onSubmit={handleSubmit} style={{ marginTop: '2rem' }} noValidate>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="subject" style={{ display: 'block', marginBottom: '0.5rem' }}>
            Subject:
          </label>
          <input
            type="text"
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: errors.subject ? '1px solid red' : '1px solid #ccc',
              borderRadius: '4px',
            }}
            aria-invalid={errors.subject ? 'true' : 'false'}
            aria-describedby="subject-error"
            disabled={loading}
            required
          />
          {errors.subject && (
            <span id="subject-error" style={{ color: 'red', fontSize: '0.8rem' }} aria-live="polite">
              {errors.subject}
            </span>
          )}
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="message" style={{ display: 'block', marginBottom: '0.5rem' }}>
            Message:
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: errors.message ? '1px solid red' : '1px solid #ccc',
              borderRadius: '4px',
              minHeight: '150px',
            }}
            aria-invalid={errors.message ? 'true' : 'false'}
            aria-describedby="message-error"
            disabled={loading}
            required
          />
          {errors.message && (
            <span id="message-error" style={{ color: 'red', fontSize: '0.8rem' }} aria-live="polite">
              {errors.message}
            </span>
          )}
        </div>

        {errors.submit && (
          <div style={{ color: 'red', marginBottom: '1rem' }} aria-live="polite">
            {errors.submit}
          </div>
        )}

        {successMessage && (
          <div style={{ color: 'green', marginBottom: '1rem' }} aria-live="polite">
            {successMessage}
          </div>
        )}

        <button
          type="submit"
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: loading ? '#6c757d' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
          disabled={loading}
        >
          {loading ? 'Sending...' : 'Send Message'}
        </button>
      </form>
    </div>
  );
}

export default SupportPage;
