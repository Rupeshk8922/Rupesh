import { useNavigate } from 'react-router-dom';

function PremiumFeatureModal({ isOpen, onClose }) {
  const navigate = useNavigate();

  if (!isOpen) {
    return null;
  }

  const handleUpgradeClick = () => {
    onClose();
    navigate('/admin/billing');
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        textAlign: 'center'
      }}>
        <h2>Upgrade Required</h2>
        <p>This feature is only available on the paid plan. Upgrade to continue.</p>
        <div style={{ marginTop: '1.5rem' }}>
          <button onClick={onClose} style={{ marginRight: '1rem' }}>Continue on Free Plan</button>
          <button onClick={handleUpgradeClick}>Upgrade Now</button>
        </div>
      </div>
    </div>
  );
}

export default PremiumFeatureModal;