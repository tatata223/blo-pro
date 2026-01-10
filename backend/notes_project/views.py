from django.shortcuts import render
from pathlib import Path
import os

def index(request):
    """Обслуживание React приложения"""
    react_app_dir = Path(__file__).resolve().parent.parent.parent / 'frontend' / 'build'
    index_path = react_app_dir / 'index.html'
    
    if index_path.exists():
        with open(index_path, 'r', encoding='utf-8') as f:
            return HttpResponse(f.read(), content_type='text/html')
    else:
        return HttpResponse(
            '<h1>React приложение не собрано</h1><p>Выполните: cd frontend && npm run build</p>',
            status=404
        )









