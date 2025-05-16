import { useState } from 'react';

const useModal = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({
    title: '',
    message: '',
    actions: [],
  });

  const showModal = ({ title, message, actions = [] }) => {
    setModalContent({ title, message, actions });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalContent({ title: '', message: '', actions: [] });
  };

  return {
    isModalOpen,
    modalContent,
    showModal,
    closeModal,
  };
};

export default useModal;