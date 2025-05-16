import { useNavigate } from 'react-router-dom';

// This component does not directly import any hooks from src/hooks
const TrialExpiredModal = ({ isOpen, onClose, isAdmin }) => {
  const navigate = useNavigate();

  if (!isOpen) {
    return null;
  }

  const handleContinue = () => {
    onClose();
    // Redirect to appropriate dashboard after closing modal
    navigate(isAdmin ? '/dashboard/admin' : '/dashboard');
  };

  const handleUpgrade = () => {
    onClose();
    navigate('/admin/billing');
  };

  return (
    <div className="modal-overlay" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div className="modal-content" style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        textAlign: 'center'
      }}>
        <h2>Trial Expired</h2>
        <p>Your trial has ended. You’re now on a limited Free Plan.</p>
        <div className="modal-actions" style={{ marginTop: '20px' }}>
          <button onClick={handleContinue} style={{ marginRight: '10px' }}>
            Continue with limited free version
          </button>
          <button onClick={handleUpgrade}>
            Upgrade
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrialExpiredModal;