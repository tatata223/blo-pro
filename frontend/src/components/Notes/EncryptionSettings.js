import React, { useState } from 'react';
import { notesAPI } from '../../api/api';
import toast from 'react-hot-toast';
import './EncryptionSettings.css';

const EncryptionSettings = ({ note, onEncryptionChange }) => {
  const [showEncrypt, setShowEncrypt] = useState(false);
  const [showDecrypt, setShowDecrypt] = useState(false);
  const [showRemove, setShowRemove] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEncrypt = async (e) => {
    e.preventDefault();
    
    if (!password) {
      toast.error('Введите пароль');
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error('Пароли не совпадают');
      return;
    }
    
    if (password.length < 6) {
      toast.error('Пароль должен содержать минимум 6 символов');
      return;
    }
    
    setLoading(true);
    try {
      await notesAPI.encrypt(note.id, { password });
      toast.success('Заметка успешно зашифрована');
      setShowEncrypt(false);
      setPassword('');
      setConfirmPassword('');
      if (onEncryptionChange) {
        onEncryptionChange(true);
      }
    } catch (error) {
      console.error('Error encrypting note:', error);
      toast.error(error.response?.data?.error || 'Ошибка шифрования');
    } finally {
      setLoading(false);
    }
  };

  const handleDecrypt = async (e) => {
    e.preventDefault();
    
    if (!password) {
      toast.error('Введите пароль');
      return;
    }
    
    setLoading(true);
    try {
      const response = await notesAPI.decrypt(note.id, { password });
      toast.success('Заметка успешно расшифрована');
      setShowDecrypt(false);
      setPassword('');
      if (onEncryptionChange) {
        onEncryptionChange(false, response.data.content);
      }
    } catch (error) {
      console.error('Error decrypting note:', error);
      toast.error(error.response?.data?.error || 'Ошибка расшифровки');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveEncryption = async (e) => {
    e.preventDefault();
    
    if (!password) {
      toast.error('Введите пароль');
      return;
    }
    
    setLoading(true);
    try {
      await notesAPI.removeEncryption(note.id, { password });
      toast.success('Шифрование успешно удалено');
      setShowRemove(false);
      setPassword('');
      if (onEncryptionChange) {
        onEncryptionChange(false);
      }
    } catch (error) {
      console.error('Error removing encryption:', error);
      toast.error(error.response?.data?.error || 'Ошибка удаления шифрования');
    } finally {
      setLoading(false);
    }
  };

  if (!note) return null;

  return (
    <div className="encryption-settings">
      {!note.is_encrypted ? (
        <div className="encryption-controls">
          <button
            className="encryption-btn encrypt-btn"
            onClick={() => {
              setShowEncrypt(true);
              setShowDecrypt(false);
              setShowRemove(false);
            }}
            title="Зашифровать заметку"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 8V12M12 16H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Зашифровать
          </button>
        </div>
      ) : (
        <div className="encryption-controls">
          <div className="encryption-status">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Зашифровано</span>
          </div>
          <button
            className="encryption-btn decrypt-btn"
            onClick={() => {
              setShowDecrypt(true);
              setShowEncrypt(false);
              setShowRemove(false);
            }}
            title="Расшифровать для просмотра"
          >
            Расшифровать
          </button>
          <button
            className="encryption-btn remove-btn"
            onClick={() => {
              setShowRemove(true);
              setShowEncrypt(false);
              setShowDecrypt(false);
            }}
            title="Убрать шифрование"
          >
            Убрать
          </button>
        </div>
      )}

      {showEncrypt && (
        <div className="encryption-modal">
          <div className="encryption-modal-content">
            <h3>Зашифровать заметку</h3>
            <p className="encryption-modal-hint">
              Введите пароль для шифрования. Заметка будет зашифрована и защищена паролем.
            </p>
            <form onSubmit={handleEncrypt}>
              <div className="encryption-form-group">
                <label htmlFor="encrypt-password">Пароль</label>
                <input
                  type="password"
                  id="encrypt-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Введите пароль"
                  required
                  minLength={6}
                />
              </div>
              <div className="encryption-form-group">
                <label htmlFor="encrypt-confirm">Подтвердите пароль</label>
                <input
                  type="password"
                  id="encrypt-confirm"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Повторите пароль"
                  required
                  minLength={6}
                />
              </div>
              <div className="encryption-modal-actions">
                <button
                  type="button"
                  className="encryption-cancel-btn"
                  onClick={() => {
                    setShowEncrypt(false);
                    setPassword('');
                    setConfirmPassword('');
                  }}
                  disabled={loading}
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="encryption-submit-btn"
                  disabled={loading}
                >
                  {loading ? 'Шифрование...' : 'Зашифровать'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDecrypt && (
        <div className="encryption-modal">
          <div className="encryption-modal-content">
            <h3>Расшифровать заметку</h3>
            <p className="encryption-modal-hint">
              Введите пароль для расшифровки и просмотра содержимого.
            </p>
            <form onSubmit={handleDecrypt}>
              <div className="encryption-form-group">
                <label htmlFor="decrypt-password">Пароль</label>
                <input
                  type="password"
                  id="decrypt-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Введите пароль"
                  required
                  autoFocus
                />
              </div>
              <div className="encryption-modal-actions">
                <button
                  type="button"
                  className="encryption-cancel-btn"
                  onClick={() => {
                    setShowDecrypt(false);
                    setPassword('');
                  }}
                  disabled={loading}
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="encryption-submit-btn"
                  disabled={loading}
                >
                  {loading ? 'Расшифровка...' : 'Расшифровать'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showRemove && (
        <div className="encryption-modal">
          <div className="encryption-modal-content">
            <h3>Убрать шифрование</h3>
            <p className="encryption-modal-hint">
              Введите пароль для подтверждения. Шифрование будет удалено, и заметка станет обычной.
            </p>
            <form onSubmit={handleRemoveEncryption}>
              <div className="encryption-form-group">
                <label htmlFor="remove-password">Пароль</label>
                <input
                  type="password"
                  id="remove-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Введите пароль"
                  required
                  autoFocus
                />
              </div>
              <div className="encryption-modal-actions">
                <button
                  type="button"
                  className="encryption-cancel-btn"
                  onClick={() => {
                    setShowRemove(false);
                    setPassword('');
                  }}
                  disabled={loading}
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="encryption-submit-btn"
                  disabled={loading}
                >
                  {loading ? 'Удаление...' : 'Убрать шифрование'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EncryptionSettings;
