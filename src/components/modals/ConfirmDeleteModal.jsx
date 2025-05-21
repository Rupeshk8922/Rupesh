import React from 'react';

const ConfirmDeleteModal = ({ isOpen, onCancel, onConfirm, userName }) => {
  // This is a placeholder modal component.
  // The UI and styling need to be implemented.

  if (!isOpen) {
    return null;
  }

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
      zIndex: 1000,
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        textAlign: 'center',
      }}>
        <h2>Confirm Deletion</h2>
        <p>Are you sure you want to delete {userName}?</p>
        <div style={{ marginTop: '20px' }}>
          <button
            onClick={onCancel}
            style={{ marginRight: '10px', padding: '8px 16px', cursor: 'pointer' }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{ padding: '8px 16px', cursor: 'pointer', backgroundColor: 'red', color: 'white', border: 'none' }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;