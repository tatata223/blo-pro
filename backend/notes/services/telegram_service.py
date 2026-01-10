import os
from django.conf import settings
from .export_service import export_note_to_pdf
from io import BytesIO

try:
    import requests
    REQUESTS_AVAILABLE = True
except ImportError:
    REQUESTS_AVAILABLE = False


def send_note_via_telegram(note, chat_id, bot_token=None):
    """
    Отправляет заметку в Telegram через Bot API
    """
    if not REQUESTS_AVAILABLE:
        raise ImportError("requests library is required for Telegram integration")
    
    if not note:
        raise ValueError("Note is required")
    
    if not chat_id:
        raise ValueError("Chat ID is required")
    
    # Получаем токен бота из настроек или переменных окружения
    token = bot_token or os.getenv('TELEGRAM_BOT_TOKEN') or getattr(settings, 'TELEGRAM_BOT_TOKEN', None)
    if not token:
        raise ValueError("Telegram bot token is required. Set TELEGRAM_BOT_TOKEN in settings or environment.")
    
    # Генерируем PDF
    try:
        pdf_bytes = export_note_to_pdf(note)
    except Exception as e:
        raise Exception(f"Error generating PDF: {str(e)}")
    
    # Отправляем через Telegram Bot API
    url = f"https://api.telegram.org/bot{token}/sendDocument"
    
    filename = f"{note.title or 'note'}.pdf"
    
    files = {
        'document': (filename, BytesIO(pdf_bytes), 'application/pdf')
    }
    
    data = {
        'chat_id': chat_id,
        'caption': f"Заметка: {note.title or 'Без названия'}"
    }
    
    try:
        response = requests.post(url, files=files, data=data)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        raise Exception(f"Error sending to Telegram: {str(e)}")


def get_telegram_share_link(note_id):
    """
    Создает ссылку для отправки в Telegram через web.telegram.org
    """
    # Это создаст ссылку для открытия Telegram Web с предзаполненным сообщением
    # В реальности нужно будет использовать другой подход, так как прямой отправки через ссылку нет
    # Можно использовать tg:// ссылку или просто вернуть инструкции
    return f"tg://msg?text=Проверьте заметку {note_id} в BlocknotPRO"


