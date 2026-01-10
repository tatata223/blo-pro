// Шаблоны заметок
const NOTE_TEMPLATES = [
    {
        id: 'meeting',
        title: 'Протокол собрания',
        description: 'Шаблон для ведения протоколов собраний',
        content: `<h2>Протокол собрания</h2>
<p><strong>Дата:</strong> ${new Date().toLocaleDateString('ru-RU')}</p>
<p><strong>Время:</strong> ${new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</p>
<p><strong>Участники:</strong></p>
<ul>
    <li>Участник 1</li>
    <li>Участник 2</li>
    <li>Участник 3</li>
</ul>
<h3>Повестка дня:</h3>
<ol>
    <li>Пункт 1</li>
    <li>Пункт 2</li>
    <li>Пункт 3</li>
</ol>
<h3>Решения:</h3>
<ul>
    <li>Решение 1</li>
    <li>Решение 2</li>
</ul>
<h3>Действия:</h3>
<ul>
    <li><strong>Ответственный:</strong> Задача 1</li>
    <li><strong>Ответственный:</strong> Задача 2</li>
</ul>`
    },
    {
        id: 'todo',
        title: 'Список дел',
        description: 'Шаблон для планирования задач',
        content: `<h2>Список дел</h2>
<p><strong>Дата:</strong> ${new Date().toLocaleDateString('ru-RU')}</p>
<h3>Важные задачи:</h3>
<ul>
    <li>Задача 1</li>
    <li>Задача 2</li>
    <li>Задача 3</li>
</ul>
<h3>Обычные задачи:</h3>
<ul>
    <li>Задача 4</li>
    <li>Задача 5</li>
</ul>
<h3>Заметки:</h3>
<p>Дополнительная информация...</p>`
    },
    {
        id: 'diary',
        title: 'Дневник',
        description: 'Шаблон для ведения дневника',
        content: `<h2>Дневник</h2>
<p><strong>Дата:</strong> ${new Date().toLocaleDateString('ru-RU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
<h3>Что произошло сегодня:</h3>
<p>Опишите события дня...</p>
<h3>Мои мысли:</h3>
<p>Ваши размышления...</p>
<h3>Планы на завтра:</h3>
<ul>
    <li>План 1</li>
    <li>План 2</li>
</ul>`
    },
    {
        id: 'memo',
        title: 'Служебная записка',
        description: 'Шаблон для служебных записок',
        content: `<h2>Служебная записка</h2>
<p><strong>Кому:</strong> [Получатель]</p>
<p><strong>От:</strong> [Отправитель]</p>
<p><strong>Дата:</strong> ${new Date().toLocaleDateString('ru-RU')}</p>
<p><strong>Тема:</strong> [Тема записки]</p>
<h3>Текст:</h3>
<p>Основной текст служебной записки...</p>
<p>С уважением,<br>[Ваше имя]</p>`
    },
    {
        id: 'recipe',
        title: 'Рецепт',
        description: 'Шаблон для записи рецептов',
        content: `<h2>Название блюда</h2>
<p><strong>Время приготовления:</strong> [время]</p>
<p><strong>Порций:</strong> [количество]</p>
<h3>Ингредиенты:</h3>
<ul>
    <li>Ингредиент 1 - количество</li>
    <li>Ингредиент 2 - количество</li>
    <li>Ингредиент 3 - количество</li>
</ul>
<h3>Инструкция:</h3>
<ol>
    <li>Шаг 1</li>
    <li>Шаг 2</li>
    <li>Шаг 3</li>
</ol>
<h3>Советы:</h3>
<p>Дополнительные советы по приготовлению...</p>`
    },
    {
        id: 'book-review',
        title: 'Рецензия на книгу',
        description: 'Шаблон для рецензий на книги',
        content: `<h2>Название книги</h2>
<p><strong>Автор:</strong> [Имя автора]</p>
<p><strong>Дата прочтения:</strong> ${new Date().toLocaleDateString('ru-RU')}</p>
<p><strong>Оценка:</strong> ⭐⭐⭐⭐⭐</p>
<h3>Краткое содержание:</h3>
<p>Краткое описание сюжета...</p>
<h3>Мои впечатления:</h3>
<p>Ваши мысли о книге...</p>
<h3>Цитаты:</h3>
<blockquote>Интересная цитата из книги...</blockquote>
<h3>Рекомендация:</h3>
<p>Рекомендую/не рекомендую и почему...</p>`
    },
    {
        id: 'travel',
        title: 'Путевые заметки',
        description: 'Шаблон для путевых заметок',
        content: `<h2>Путевые заметки</h2>
<p><strong>Место:</strong> [Название места]</p>
<p><strong>Дата:</strong> ${new Date().toLocaleDateString('ru-RU')}</p>
<h3>Что посетили:</h3>
<ul>
    <li>Место 1</li>
    <li>Место 2</li>
    <li>Место 3</li>
</ul>
<h3>Впечатления:</h3>
<p>Ваши впечатления от поездки...</p>
<h3>Что понравилось:</h3>
<ul>
    <li>Пункт 1</li>
    <li>Пункт 2</li>
</ul>
<h3>Рекомендации:</h3>
<p>Что стоит посетить, где поесть и т.д.</p>`
    },
    {
        id: 'project',
        title: 'Проект',
        description: 'Шаблон для планирования проектов',
        content: `<h2>Название проекта</h2>
<p><strong>Дата начала:</strong> ${new Date().toLocaleDateString('ru-RU')}</p>
<p><strong>Срок завершения:</strong> [дата]</p>
<p><strong>Статус:</strong> [В работе/Завершен/Отложен]</p>
<h3>Описание проекта:</h3>
<p>Краткое описание проекта...</p>
<h3>Цели:</h3>
<ul>
    <li>Цель 1</li>
    <li>Цель 2</li>
    <li>Цель 3</li>
</ul>
<h3>Задачи:</h3>
<ul>
    <li>✅ Задача 1 (выполнена)</li>
    <li>⏳ Задача 2 (в работе)</li>
    <li>📋 Задача 3 (запланирована)</li>
</ul>
<h3>Ресурсы:</h3>
<ul>
    <li>Ресурс 1</li>
    <li>Ресурс 2</li>
</ul>
<h3>Заметки:</h3>
<p>Дополнительная информация...</p>`
    },
    {
        id: 'interview',
        title: 'Интервью',
        description: 'Шаблон для записи интервью',
        content: `<h2>Интервью</h2>
<p><strong>Интервьюируемый:</strong> [Имя]</p>
<p><strong>Дата:</strong> ${new Date().toLocaleDateString('ru-RU')}</p>
<p><strong>Место:</strong> [Место проведения]</p>
<h3>Вопросы и ответы:</h3>
<p><strong>Вопрос 1:</strong> [Вопрос]</p>
<p>Ответ: [Ответ]</p>
<p><strong>Вопрос 2:</strong> [Вопрос]</p>
<p>Ответ: [Ответ]</p>
<p><strong>Вопрос 3:</strong> [Вопрос]</p>
<p>Ответ: [Ответ]</p>
<h3>Ключевые моменты:</h3>
<ul>
    <li>Момент 1</li>
    <li>Момент 2</li>
</ul>
<h3>Выводы:</h3>
<p>Основные выводы из интервью...</p>`
    },
    {
        id: 'lesson',
        title: 'Конспект урока',
        description: 'Шаблон для конспектов уроков/лекций',
        content: `<h2>Название урока/лекции</h2>
<p><strong>Дата:</strong> ${new Date().toLocaleDateString('ru-RU')}</p>
<p><strong>Преподаватель:</strong> [Имя преподавателя]</p>
<p><strong>Тема:</strong> [Тема урока]</p>
<h3>Основные понятия:</h3>
<ul>
    <li>Понятие 1 - определение</li>
    <li>Понятие 2 - определение</li>
    <li>Понятие 3 - определение</li>
</ul>
<h3>Ключевые моменты:</h3>
<ol>
    <li>Момент 1</li>
    <li>Момент 2</li>
    <li>Момент 3</li>
</ol>
<h3>Примеры:</h3>
<p>Примеры и иллюстрации...</p>
<h3>Домашнее задание:</h3>
<ul>
    <li>Задание 1</li>
    <li>Задание 2</li>
</ul>
<h3>Вопросы для повторения:</h3>
<ul>
    <li>Вопрос 1</li>
    <li>Вопрос 2</li>
</ul>`
    }
];

// Управление заметками
class NotesApp {
    constructor() {
        this.notes = this.loadNotes();
        this.currentNoteId = null;
        this.init();
    }

    init() {
        this.renderTemplates();
        this.renderNotes();
        this.setupEventListeners();
        this.initRTE();
    }

    // Загрузка заметок из localStorage
    loadNotes() {
        const savedNotes = localStorage.getItem('notes');
        return savedNotes ? JSON.parse(savedNotes) : [];
    }

    // Сохранение заметок в localStorage
    saveNotes() {
        localStorage.setItem('notes', JSON.stringify(this.notes));
    }


    // Генерация уникального ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Форматирование даты
    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
            return 'Сегодня';
        } else if (diffDays === 2) {
            return 'Вчера';
        } else if (diffDays <= 7) {
            return `${diffDays - 1} дней назад`;
        } else {
            return date.toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'long',
                year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
            });
        }
    }

    // Инициализация Rich Text Editor
    initRTE() {
        const editor = document.getElementById('rteEditor');
        const toolbar = document.getElementById('rteToolbar');
        
        // Обработчики для кнопок панели инструментов
        toolbar.addEventListener('click', (e) => {
            if (e.target.classList.contains('rte-btn')) {
                e.preventDefault();
                const command = e.target.dataset.command;
                const value = e.target.dataset.value;
                
                editor.focus();
                
                if (command === 'formatBlock' && value) {
                    document.execCommand(command, false, value);
                } else {
                    document.execCommand(command, false, null);
                }
                
                this.updateToolbarState();
            }
        });

        // Обновление состояния кнопок при изменении выделения
        editor.addEventListener('keyup', () => this.updateToolbarState());
        editor.addEventListener('mouseup', () => this.updateToolbarState());

        // Горячие клавиши
        editor.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
                e.preventDefault();
                document.execCommand('bold', false, null);
                this.updateToolbarState();
            } else if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
                e.preventDefault();
                document.execCommand('italic', false, null);
                this.updateToolbarState();
            } else if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
                e.preventDefault();
                document.execCommand('underline', false, null);
                this.updateToolbarState();
            }
        });
    }

    // Обновление состояния кнопок панели инструментов
    updateToolbarState() {
        const toolbar = document.getElementById('rteToolbar');
        const buttons = toolbar.querySelectorAll('.rte-btn');
        
        buttons.forEach(btn => {
            const command = btn.dataset.command;
            const value = btn.dataset.value;
            
            let isActive = false;
            
            if (command === 'formatBlock' && value) {
                const block = document.queryCommandValue('formatBlock');
                isActive = block === value;
            } else {
                isActive = document.queryCommandState(command);
            }
            
            btn.classList.toggle('active', isActive);
        });
    }

    // Отрисовка шаблонов
    renderTemplates() {
        const menu = document.getElementById('templatesMenu');
        menu.innerHTML = '';
        
        NOTE_TEMPLATES.forEach(template => {
            const item = document.createElement('div');
            item.className = 'template-item';
            item.innerHTML = `
                <div class="template-item-title">${template.title}</div>
                <div class="template-item-desc">${template.description}</div>
            `;
            item.addEventListener('click', () => {
                this.applyTemplate(template);
                menu.classList.remove('show');
            });
            menu.appendChild(item);
        });
    }

    // Применение шаблона - создает новую заметку сразу
    applyTemplate(template) {
        // Создаем новую заметку с шаблоном
        const newNote = {
            id: this.generateId(),
            title: template.title,
            content: template.content,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        this.notes.unshift(newNote);
        this.saveNotes();
        this.renderNotes();
        
        // Открываем для редактирования
        this.openModal(newNote.id);
    }

    // Открытие модального окна
    openModal(noteId = null) {
        this.currentNoteId = noteId;
        const modal = document.getElementById('noteModal');
        const modalTitle = document.getElementById('modalTitle');
        const titleInput = document.getElementById('noteTitleInput');
        const editor = document.getElementById('rteEditor');

        if (noteId) {
            // Редактирование существующей заметки
            const note = this.notes.find(n => n.id === noteId);
            if (note) {
                modalTitle.textContent = 'Редактировать заметку';
                titleInput.value = note.title;
                editor.innerHTML = note.content || '';
            }
        } else {
            // Создание новой заметки
            modalTitle.textContent = 'Новая заметка';
            titleInput.value = '';
            editor.innerHTML = '';
        }

        modal.classList.add('show');
        titleInput.focus();
        this.updateToolbarState();
    }

    // Закрытие модального окна
    closeModal() {
        const modal = document.getElementById('noteModal');
        modal.classList.remove('show');
        this.currentNoteId = null;
    }

    // Сохранение заметки
    saveNote() {
        const titleInput = document.getElementById('noteTitleInput');
        const editor = document.getElementById('rteEditor');
        const title = titleInput.value.trim();
        const content = editor.innerHTML.trim();

        if (!title && !content) {
            alert('Заметка не может быть пустой');
            return;
        }

        if (this.currentNoteId) {
            // Обновление существующей заметки
            const noteIndex = this.notes.findIndex(n => n.id === this.currentNoteId);
            if (noteIndex !== -1) {
                this.notes[noteIndex] = {
                    ...this.notes[noteIndex],
                    title: title || 'Без названия',
                    content: content,
                    updatedAt: new Date().toISOString()
                };
            }
        } else {
            // Создание новой заметки
            const newNote = {
                id: this.generateId(),
                title: title || 'Без названия',
                content: content,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            this.notes.unshift(newNote);
        }

        this.saveNotes();
        this.renderNotes();
        this.closeModal();
    }

    // Удаление заметки
    deleteNote(noteId, event) {
        event.stopPropagation();
        if (confirm('Вы уверены, что хотите удалить эту заметку?')) {
            this.notes = this.notes.filter(note => note.id !== noteId);
            this.saveNotes();
            this.renderNotes();
        }
    }

    // Поиск заметок
    searchNotes(query) {
        const searchTerm = query.toLowerCase().trim();
        if (!searchTerm) {
            this.renderNotes();
            return;
        }

        const filteredNotes = this.notes.filter(note => {
            const titleMatch = note.title.toLowerCase().includes(searchTerm);
            // Удаляем HTML теги для поиска
            const textContent = note.content ? note.content.replace(/<[^>]*>/g, '').toLowerCase() : '';
            const contentMatch = textContent.includes(searchTerm);
            return titleMatch || contentMatch;
        });

        this.renderNotes(filteredNotes);
    }

    // Отрисовка заметок
    renderNotes(notesToRender = null) {
        const notesGrid = document.getElementById('notesGrid');
        const emptyState = document.getElementById('emptyState');
        const notes = notesToRender !== null ? notesToRender : this.notes;

        notesGrid.innerHTML = '';

        if (notes.length === 0) {
            emptyState.classList.add('show');
        } else {
            emptyState.classList.remove('show');
            notes.forEach(note => {
                const noteCard = this.createNoteCard(note);
                notesGrid.appendChild(noteCard);
            });
        }
    }

    // Создание карточки заметки
    createNoteCard(note) {
        const card = document.createElement('div');
        card.className = 'note-card';
        card.addEventListener('click', () => this.openModal(note.id));

        const header = document.createElement('div');
        header.className = 'note-card-header';

        const title = document.createElement('div');
        title.className = 'note-card-title';
        title.textContent = note.title;

        const actions = document.createElement('div');
        actions.className = 'note-card-actions';

        const editBtn = document.createElement('button');
        editBtn.className = 'action-btn';
        editBtn.innerHTML = '✏️';
        editBtn.title = 'Редактировать';
        editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.openModal(note.id);
        });

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'action-btn delete';
        deleteBtn.innerHTML = '🗑️';
        deleteBtn.title = 'Удалить';
        deleteBtn.addEventListener('click', (e) => this.deleteNote(note.id, e));

        actions.appendChild(editBtn);
        actions.appendChild(deleteBtn);

        header.appendChild(title);
        header.appendChild(actions);

        const content = document.createElement('div');
        content.className = 'note-card-content';
        // Отображаем HTML контент, но ограничиваем количество
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = note.content || 'Нет содержимого';
        content.innerHTML = tempDiv.innerHTML;

        const date = document.createElement('div');
        date.className = 'note-card-date';
        date.textContent = this.formatDate(note.updatedAt || note.createdAt);

        card.appendChild(header);
        card.appendChild(content);
        card.appendChild(date);

        return card;
    }

    // Настройка обработчиков событий
    setupEventListeners() {
        // Кнопка добавления заметки
        document.getElementById('addNoteBtn').addEventListener('click', () => {
            this.openModal();
        });

        // Шаблоны
        const templatesBtn = document.getElementById('templatesBtn');
        const templatesMenu = document.getElementById('templatesMenu');
        
        templatesBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            templatesMenu.classList.toggle('show');
        });

        document.addEventListener('click', (e) => {
            if (!templatesBtn.contains(e.target) && !templatesMenu.contains(e.target)) {
                templatesMenu.classList.remove('show');
            }
        });

        // Закрытие модального окна
        document.getElementById('closeModal').addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('cancelBtn').addEventListener('click', () => {
            this.closeModal();
        });

        // Сохранение заметки
        document.getElementById('saveNoteBtn').addEventListener('click', () => {
            this.saveNote();
        });

        // Закрытие по клику вне модального окна
        document.getElementById('noteModal').addEventListener('click', (e) => {
            if (e.target.id === 'noteModal') {
                this.closeModal();
            }
        });

        // Закрытие по Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
                templatesMenu.classList.remove('show');
            }
        });

        // Поиск
        const searchInput = document.getElementById('searchInput');
        searchInput.addEventListener('input', (e) => {
            this.searchNotes(e.target.value);
        });

        // Сохранение по Ctrl+S / Cmd+S
        document.addEventListener('keydown', (e) => {
            const modal = document.getElementById('noteModal');
            if (modal.classList.contains('show') && (e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                this.saveNote();
            }
        });
    }
}

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
    new NotesApp();
});