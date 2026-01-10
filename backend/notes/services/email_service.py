from django.core.mail import EmailMessage
from django.conf import settings
from .export_service import export_note_to_pdf
from io import BytesIO


def send_note_via_email(note, recipient_email, subject=None):
    """
    Отправляет заметку по email в виде PDF вложения
    """
    if not note:
        raise ValueError("Note is required")
    
    if not recipient_email:
        raise ValueError("Recipient email is required")
    
    # Генерируем PDF
    try:
        pdf_bytes = export_note_to_pdf(note)
    except Exception as e:
        raise Exception(f"Error generating PDF: {str(e)}")
    
    # Создаем email
    email_subject = subject or f"Заметка: {note.title or 'Без названия'}"
    email_body = f"""
    Привет!
    
    Вам отправлена заметка "{note.title or 'Без названия'}".
    
    С уважением,
    BlocknotPRO
    """
    
    email = EmailMessage(
        subject=email_subject,
        body=email_body,
        from_email=settings.DEFAULT_FROM_EMAIL if hasattr(settings, 'DEFAULT_FROM_EMAIL') else 'noreply@blocknotpro.com',
        to=[recipient_email],
    )
    
    # Прикрепляем PDF
    filename = f"{note.title or 'note'}.pdf"
    email.attach(filename, pdf_bytes, 'application/pdf')
    
    # Отправляем
    try:
        email.send()
        return True
    except Exception as e:
        raise Exception(f"Error sending email: {str(e)}")


