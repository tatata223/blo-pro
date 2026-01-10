"""
URL configuration for notes_project project.
"""
from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.http import HttpResponse, FileResponse
from pathlib import Path
import os
import mimetypes

def serve_react(request, path=''):
    """Обслуживание React приложения"""
    react_app_dir = Path(__file__).resolve().parent.parent.parent / 'frontend' / 'build'
    
    # Пытаемся найти статический файл
    if path:
        # Убираем начальный слэш
        clean_path = path.lstrip('/')
        file_path = react_app_dir / clean_path
        
        # Проверяем существование файла
        if file_path.exists() and file_path.is_file():
            # Определяем content type
            content_type, _ = mimetypes.guess_type(str(file_path))
            if not content_type:
                if clean_path.endswith('.js'):
                    content_type = 'application/javascript; charset=utf-8'
                elif clean_path.endswith('.css'):
                    content_type = 'text/css; charset=utf-8'
                elif clean_path.endswith('.json'):
                    content_type = 'application/json'
                elif clean_path.endswith('.png'):
                    content_type = 'image/png'
                elif clean_path.endswith('.jpg') or clean_path.endswith('.jpeg'):
                    content_type = 'image/jpeg'
                elif clean_path.endswith('.svg'):
                    content_type = 'image/svg+xml'
                else:
                    content_type = 'application/octet-stream'
            
            return FileResponse(open(file_path, 'rb'), content_type=content_type)
    
    # Иначе возвращаем index.html для SPA роутинга
    index_path = react_app_dir / 'index.html'
    if index_path.exists():
        with open(index_path, 'r', encoding='utf-8') as f:
            content = f.read()
            # Исправляем пути к статическим файлам на абсолютные
            content = content.replace('src="./static/', 'src="/static/')
            content = content.replace('href="./static/', 'href="/static/')
            return HttpResponse(content, content_type='text/html; charset=utf-8')
    else:
        return HttpResponse(
            '<h1>React приложение не собрано</h1><p>Выполните: cd frontend && npm run build</p>',
            status=404
        )

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('notes.urls')),
    # Обслуживание статических файлов React (JS, CSS, изображения)
    re_path(r'^static/(?P<path>.*)$', serve_react, name='react-static'),
    # Обслуживание React приложения - должно быть последним
    re_path(r'^$', serve_react, {'path': ''}, name='react-root'),
    re_path(r'^(?!api/|admin/|static/|media/).*$', serve_react, name='react-app'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
