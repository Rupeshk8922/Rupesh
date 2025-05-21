import { useNavigate } from 'react-router-dom';
// Assuming authContext is in src/contexts

function LandingPage() { 
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleSignupClick = () => {
    navigate('/signup-company');
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Welcome to [Your CRM App Name]!</h1>
      <div style={{ marginTop: '20px' }}>
        <button onClick={handleLoginClick} style={{ marginRight: '10px', padding: '10px 20px', fontSize: '16px' }}>
          Existing User → Login
        </button>
        <button onClick={handleSignupClick} style={{ padding: '10px 20px', fontSize: '16px' }}>
          New User? → Sign Up
        </button>
      </div>
    </div>
  );
}

export default LandingPage;