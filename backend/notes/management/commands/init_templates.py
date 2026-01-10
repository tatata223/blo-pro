from django.core.management.base import BaseCommand
from notes.models import NoteTemplate
import json
import os
from pathlib import Path


class Command(BaseCommand):
    help = 'Инициализирует шаблоны заметок из JSON файла'

    def handle(self, *args, **options):
        # Загружаем шаблоны из JSON файла
        json_path = Path(__file__).resolve().parent.parent.parent / 'templates_data.json'
        
        if json_path.exists():
            self.stdout.write(self.style.SUCCESS(f'Загрузка шаблонов из {json_path}'))
            with open(json_path, 'r', encoding='utf-8') as f:
                json_data = json.load(f)
                templates_list = json_data.get('templates', [])
        else:
            self.stdout.write(
                self.style.WARNING(f'Файл templates_data.json не найден: {json_path}')
            )
            templates_list = []
        
        if not templates_list:
            self.stdout.write(
                self.style.ERROR('Шаблоны не найдены!')
            )
            return
        
        for template_data in templates_list:
            self._create_template(template_data)
        
        self.stdout.write(
            self.style.SUCCESS(f'Инициализация {len(templates_list)} шаблонов завершена!')
        )
    
    def _create_template(self, template_data):
        """Создает или обновляет шаблон"""
        template_name = template_data.get('template_name', template_data.get('name', 'Без названия'))
        
        # Генерируем HTML контент из полей
        html_content = self._generate_html_from_fields(template_data)
        
        template, created = NoteTemplate.objects.get_or_create(
            name=template_name,
            defaults={
                'category': template_data.get('category', ''),
                'description': template_data.get('description', ''),
                'icon_svg': template_data.get('icon_svg', ''),
                'content': html_content,
                'template_data': template_data.get('fields', []),
                'tags': template_data.get('tags', []),
            }
        )
        
        if not created:
            # Обновляем существующий шаблон
            template.category = template_data.get('category', '')
            template.description = template_data.get('description', '')
            template.icon_svg = template_data.get('icon_svg', '')
            template.content = html_content
            template.template_data = template_data.get('fields', [])
            template.tags = template_data.get('tags', [])
            template.save()
            self.stdout.write(
                self.style.SUCCESS(f'✓ Обновлен шаблон: {template.name}')
            )
        else:
            self.stdout.write(
                self.style.SUCCESS(f'✓ Создан шаблон: {template.name}')
            )
    
    def _generate_html_from_fields(self, template_data):
        """Генерирует HTML контент из полей шаблона"""
        fields = template_data.get('fields', [])
        template_name = template_data.get('template_name', template_data.get('name', 'Шаблон'))
        
        if not fields:
            # Если нет полей, возвращаем базовый контент
            return f'<h1>{template_name}</h1><p>Заполните заметку...</p>'
        
        html_parts = [f'<h1 style="text-align: center; margin-bottom: 30px;">{template_name}</h1>']
        
        for field in fields:
            field_name = field.get('name', '')
            field_label = field.get('label', field_name)
            field_type = field.get('type', 'text')
            placeholder = field.get('placeholder', '')
            required = field.get('required', False)
            required_mark = ' <span style="color: red;">*</span>' if required else ''
            
            if field_type == 'textarea':
                html_parts.append(f'<h3>{field_label}{required_mark}</h3>')
                html_parts.append(f'<p style="color: #666; font-style: italic;">{placeholder}</p>')
            elif field_type == 'select':
                options = field.get('options', [])
                html_parts.append(f'<h3>{field_label}{required_mark}</h3>')
                html_parts.append(f'<p style="color: #666; font-style: italic;">{placeholder}</p>')
            elif field_type == 'checkbox':
                html_parts.append(f'<h3>{field_label}{required_mark}</h3>')
                html_parts.append(f'<p>☐ {placeholder}</p>')
            elif field_type == 'date':
                html_parts.append(f'<h3>{field_label}{required_mark}</h3>')
                html_parts.append(f'<p style="color: #666; font-style: italic;">{placeholder}</p>')
            elif field_type == 'number':
                html_parts.append(f'<h3>{field_label}{required_mark}</h3>')
                html_parts.append(f'<p style="color: #666; font-style: italic;">{placeholder}</p>')
            else:
                html_parts.append(f'<h3>{field_label}{required_mark}</h3>')
                html_parts.append(f'<p style="color: #666; font-style: italic;">{placeholder}</p>')
        
        return '\n'.join(html_parts)
