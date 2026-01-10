import React from 'react';
import './Modal.css';

const DeleteModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">{title || 'Подтверждение удаления'}</h2>
        <p className="modal-message">{message || 'Вы уверены, что хотите удалить этот элемент?'}</p>
        <div className="modal-actions">
          <button className="modal-btn modal-btn-cancel" onClick={onClose}>
            Отмена
          </button>
          <button className="modal-btn modal-btn-confirm" onClick={onConfirm}>
            Удалить
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;








