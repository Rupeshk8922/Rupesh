import React, { useState } from 'react';
// Assuming useAuth is needed for user info or sending feedback to a backend tied to auth

function SupportPage() {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!subject.trim()) newErrors.subject = 'Subject is required';
    if (!message.trim()) newErrors.message = 'Message is required';

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      // Placeholder: Implement logic to send support message (e.g., to an email or ticketing system)
      console.log('Support message submitted:', { subject, message });
      alert('Your support message has been sent!');
      setSubject('');
      setMessage('');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Support</h1>

      <form onSubmit={handleSubmit} style={{ marginTop: '2rem' }}>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="subject" style={{ display: 'block', marginBottom: '0.5rem' }}>Subject:</label>
          <input
            type="text"
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
            required
          />
        {errors.subject && <span style={{ color: 'red', fontSize: '0.8rem' }}>{errors.subject}</span>}
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="message" style={{ display: 'block', marginBottom: '0.5rem' }}>Message:</label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', minHeight: '150px' }}
            required
          ></textarea>
        {errors.message && <span style={{ color: 'red', fontSize: '0.8rem' }}>{errors.message}</span>}
        </div>
        <button type="submit" style={{ padding: '0.75rem 1.5rem', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Send Message</button>
      </form>
    </div>
  );
}

export default SupportPage;