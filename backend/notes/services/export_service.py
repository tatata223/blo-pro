from io import BytesIO
from django.http import HttpResponse
from django.conf import settings
import os

try:
    from weasyprint import HTML, CSS
    WEASYPRINT_AVAILABLE = True
except ImportError:
    WEASYPRINT_AVAILABLE = False
    try:
        from reportlab.lib.pagesizes import letter, A4
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
        from reportlab.lib.styles import getSampleStyleSheet
        from reportlab.lib.units import inch
        from html2text import html2text
        REPORTLAB_AVAILABLE = True
    except ImportError:
        REPORTLAB_AVAILABLE = False


def export_note_to_pdf(note):
    """
    Экспортирует заметку в PDF формат
    """
    if not note:
        raise ValueError("Note is required")
    
    title = note.title or "Без названия"
    content = note.content or ""
    
    # Создаем HTML для PDF
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            @page {{
                size: A4;
                margin: 2cm;
            }}
            body {{
                font-family: 'Times New Roman', Times, serif;
                font-size: 12pt;
                line-height: 1.6;
                color: #000;
            }}
            h1 {{
                font-size: 18pt;
                font-weight: bold;
                margin-bottom: 20pt;
                text-align: center;
            }}
            .content {{
                text-align: justify;
            }}
        </style>
    </head>
    <body>
        <h1>{title}</h1>
        <div class="content">{content}</div>
    </body>
    </html>
    """
    
    if WEASYPRINT_AVAILABLE:
        # Используем WeasyPrint
        html = HTML(string=html_content)
        pdf_bytes = html.write_pdf()
        return pdf_bytes
    elif REPORTLAB_AVAILABLE:
        # Используем ReportLab как fallback
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4)
        styles = getSampleStyleSheet()
        story = []
        
        # Конвертируем HTML в текст
        text_content = html2text(content)
        
        # Добавляем заголовок
        title_para = Paragraph(title, styles['Heading1'])
        story.append(title_para)
        story.append(Spacer(1, 0.2*inch))
        
        # Добавляем содержимое
        for line in text_content.split('\n'):
            if line.strip():
                para = Paragraph(line, styles['Normal'])
                story.append(para)
        
        doc.build(story)
        pdf_bytes = buffer.getvalue()
        buffer.close()
        return pdf_bytes
    else:
        raise ImportError("Neither weasyprint nor reportlab is installed. Please install one of them.")


def create_pdf_response(pdf_bytes, filename):
    """
    Создает HTTP response с PDF файлом
    """
    response = HttpResponse(pdf_bytes, content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="{filename}"'
    return response


