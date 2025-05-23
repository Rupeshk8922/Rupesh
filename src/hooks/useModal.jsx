import { useState } from 'react';

const useModal = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({
    title: '',
    message: '',
    actions: [],
  });

  // Optional: store onClose callback to run after closeModal
  const [onCloseCallback, setOnCloseCallback] = useState(null);

  const showModal = ({ title, message, actions = [], onClose = null }) => {
    setModalContent({ title, message, actions });
    setIsModalOpen(true);
    setOnCloseCallback(() => onClose);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalContent({ title: '', message: '', actions: [] });
    if (typeof onCloseCallback === 'function') {
      onCloseCallback();
      setOnCloseCallback(null);
    }
  };

  return {
    isModalOpen,
    modalContent,
    showModal,
    closeModal,
  };
};

export default useModal;
