import React, { useState } from 'react';
import { notesAPI } from '../../api/api';
import toast from 'react-hot-toast';
import './ExportModal.css';

const ExportModal = ({ note, isOpen, onClose }) => {
  const [exportMethod, setExportMethod] = useState('download');
  const [email, setEmail] = useState('');
  const [telegramChatId, setTelegramChatId] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !note) return null;

  const handleExport = async () => {
    if (!note.id) {
      toast.error('Заметка не сохранена. Сохраните заметку перед экспортом.');
      return;
    }

    setLoading(true);
    try {
      switch (exportMethod) {
        case 'download':
          // Скачивание PDF
          const response = await notesAPI.exportPDF(note.id);
          const blob = new Blob([response.data], { type: 'application/pdf' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${note.title || 'note'}.pdf`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          toast.success('PDF успешно скачан');
          break;

        case 'email':
          if (!email) {
            toast.error('Введите email адрес');
            setLoading(false);
            return;
          }
          await notesAPI.exportEmail(note.id, { email });
          toast.success('Заметка отправлена на email');
          break;

        case 'telegram':
          if (!telegramChatId) {
            toast.error('Введите Chat ID или username');
            setLoading(false);
            return;
          }
          await notesAPI.exportTelegram(note.id, { chat_id: telegramChatId });
          toast.success('Заметка отправлена в Telegram');
          break;

        case 'whatsapp':
          // Для WhatsApp просто скачиваем PDF
          const whatsappResponse = await notesAPI.exportWhatsApp(note.id);
          const whatsappBlob = new Blob([whatsappResponse.data], { type: 'application/pdf' });
          const whatsappUrl = window.URL.createObjectURL(whatsappBlob);
          const whatsappA = document.createElement('a');
          whatsappA.href = whatsappUrl;
          whatsappA.download = `${note.title || 'note'}.pdf`;
          document.body.appendChild(whatsappA);
          whatsappA.click();
          window.URL.revokeObjectURL(whatsappUrl);
          document.body.removeChild(whatsappA);
          toast.success('PDF скачан. Отправьте его в WhatsApp вручную.');
          break;

        default:
          break;
      }
      onClose();
    } catch (error) {
      console.error('Export error:', error);
      toast.error(error.response?.data?.error || 'Ошибка при экспорте');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="export-modal-overlay" onClick={onClose}>
      <div className="export-modal" onClick={(e) => e.stopPropagation()}>
        <div className="export-modal-header">
          <h3>Экспорт заметки</h3>
          <button className="export-modal-close" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <div className="export-modal-content">
          <div className="export-methods">
            <label className="export-method-option">
              <input
                type="radio"
                name="exportMethod"
                value="download"
                checked={exportMethod === 'download'}
                onChange={(e) => setExportMethod(e.target.value)}
              />
              <div className="export-method-content">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15M17 8L12 3M12 3L7 8M12 3V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Скачать PDF</span>
              </div>
            </label>

            <label className="export-method-option">
              <input
                type="radio"
                name="exportMethod"
                value="email"
                checked={exportMethod === 'email'}
                onChange={(e) => setExportMethod(e.target.value)}
              />
              <div className="export-method-content">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M22 6L12 13L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Отправить на Email</span>
              </div>
            </label>

            <label className="export-method-option">
              <input
                type="radio"
                name="exportMethod"
                value="telegram"
                checked={exportMethod === 'telegram'}
                onChange={(e) => setExportMethod(e.target.value)}
              />
              <div className="export-method-content">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 5L2 12.5L9 13.5M21 5L15 21L9 13.5M21 5L9 13.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Отправить в Telegram</span>
              </div>
            </label>

            <label className="export-method-option">
              <input
                type="radio"
                name="exportMethod"
                value="whatsapp"
                checked={exportMethod === 'whatsapp'}
                onChange={(e) => setExportMethod(e.target.value)}
              />
              <div className="export-method-content">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.472 14.382C17.007 14.19 15.314 13.538 15.058 13.457C14.803 13.376 14.62 13.335 14.437 13.8C14.254 14.265 13.64 15.382 13.434 15.63C13.228 15.878 13.022 15.919 12.557 15.727C12.092 15.535 10.775 15.19 9.203 13.8C7.95 12.7 7.12 11.382 6.914 10.917C6.708 10.452 6.875 10.243 7.067 10.051C7.24 9.878 7.45 9.628 7.642 9.436C7.833 9.244 7.874 9.102 8.003 8.91C8.132 8.718 8.088 8.565 8.025 8.435C7.962 8.305 7.35 6.565 7.12 5.97C6.89 5.375 6.66 5.46 6.49 5.45C6.32 5.44 6.13 5.44 5.94 5.44C5.75 5.44 5.5 5.5 5.28 5.75C5.06 6 4.5 6.565 4.5 7.695C4.5 8.825 5.28 9.92 5.4 10.082C5.52 10.244 6.9 12.7 9.203 13.8C9.75 14.1 10.15 14.3 10.5 14.45C10.95 14.65 11.35 14.75 11.7 14.7C12.1 14.65 13.228 14.05 13.434 13.8C13.64 13.55 13.9 13.6 14.092 13.7C14.283 13.8 15.5 14.5 15.75 14.65C16 14.8 16.2 14.85 16.35 14.75C16.5 14.65 16.45 14.4 16.35 14.2L17.472 14.382Z" fill="currentColor"/>
                </svg>
                <span>Отправить в WhatsApp</span>
              </div>
            </label>
          </div>

          {exportMethod === 'email' && (
            <div className="export-form-field">
              <label>Email адрес:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                className="export-input"
              />
            </div>
          )}

          {exportMethod === 'telegram' && (
            <div className="export-form-field">
              <label>Chat ID или Username:</label>
              <input
                type="text"
                value={telegramChatId}
                onChange={(e) => setTelegramChatId(e.target.value)}
                placeholder="@username или chat_id"
                className="export-input"
              />
              <small className="export-hint">
                Для получения Chat ID используйте @userinfobot в Telegram
              </small>
            </div>
          )}

          {exportMethod === 'whatsapp' && (
            <div className="export-info">
              <p>PDF будет скачан. Откройте WhatsApp и отправьте файл вручную.</p>
            </div>
          )}
        </div>

        <div className="export-modal-footer">
          <button className="export-btn-cancel" onClick={onClose} disabled={loading}>
            Отмена
          </button>
          <button className="export-btn-submit" onClick={handleExport} disabled={loading}>
            {loading ? 'Экспорт...' : 'Экспортировать'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;


