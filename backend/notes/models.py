from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
import uuid


class User(AbstractUser):
    """Расширенная модель пользователя"""
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True, db_index=True, help_text='Уникальный идентификатор пользователя')
    # ImageField требует Pillow, используем FileField как альтернативу
    avatar = models.FileField(upload_to='avatars/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    bio = models.TextField(blank=True, null=True, help_text='Биография пользователя')
    location = models.CharField(max_length=200, blank=True, null=True, help_text='Местоположение')
    website = models.URLField(blank=True, null=True, help_text='Веб-сайт')
    is_public = models.BooleanField(default=False, help_text='Публичный профиль')
    followers_count = models.IntegerField(default=0)
    following_count = models.IntegerField(default=0)
    
    def __str__(self):
        return self.username


class UserProfile(models.Model):
    """Расширенный профиль пользователя"""
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True, db_index=True, help_text='Уникальный идентификатор профиля')
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    display_name = models.CharField(max_length=200, blank=True, help_text='Отображаемое имя')
    bio = models.TextField(blank=True, help_text='Биография')
    location = models.CharField(max_length=200, blank=True, help_text='Местоположение')
    website = models.URLField(blank=True, help_text='Веб-сайт')
    avatar = models.FileField(upload_to='avatars/', null=True, blank=True, help_text='Аватар')
    cover_image = models.FileField(upload_to='covers/', null=True, blank=True, help_text='Обложка профиля')
    is_public = models.BooleanField(default=False, help_text='Публичный профиль')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Профиль пользователя'
        verbose_name_plural = 'Профили пользователей'
    
    def __str__(self):
        return f'Профиль {self.user.username}'


class Follow(models.Model):
    """Подписки пользователей"""
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True, db_index=True, help_text='Уникальный идентификатор подписки')
    follower = models.ForeignKey(User, on_delete=models.CASCADE, related_name='following')
    following = models.ForeignKey(User, on_delete=models.CASCADE, related_name='followers')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['follower', 'following']
        ordering = ['-created_at']
        verbose_name = 'Подписка'
        verbose_name_plural = 'Подписки'
    
    def __str__(self):
        return f'{self.follower.username} подписан на {self.following.username}'
    
    def save(self, *args, **kwargs):
        super(Follow, self).save(*args, **kwargs)
        # Обновляем счетчики
        self.follower.following_count = self.follower.following.count()
        self.follower.save(update_fields=['following_count'])
        self.following.followers_count = self.following.followers.count()
        self.following.save(update_fields=['followers_count'])
    
    def delete(self, *args, **kwargs):
        follower_user = self.follower
        following_user = self.following
        super(Follow, self).delete(*args, **kwargs)
        # Обновляем счетчики после удаления
        follower_user.following_count = follower_user.following.count()
        follower_user.save(update_fields=['following_count'])
        following_user.followers_count = following_user.followers.count()
        following_user.save(update_fields=['followers_count'])


class Folder(models.Model):
    """Модель папки для организации заметок"""
    FOLDER_TYPES = [
        ('normal', 'Обычная папка'),
        ('smart', 'Умная папка'),
        ('favorite', 'Избранная папка'),
    ]
    
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True, db_index=True, help_text='Уникальный идентификатор папки')
    name = models.CharField(max_length=200)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='folders')
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='children')
    color = models.CharField(max_length=7, default='#90EE90', help_text='Цвет папки в HEX')
    folder_type = models.CharField(max_length=20, choices=FOLDER_TYPES, default='normal')
    is_favorite = models.BooleanField(default=False, help_text='Избранная папка для быстрого доступа')
    smart_rules = models.JSONField(default=dict, blank=True, help_text='Правила для умной папки: теги, даты, типы')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-is_favorite', 'name']
        unique_together = ['name', 'user', 'parent']
    
    def __str__(self):
        return self.name
    
    def get_notes_count(self):
        """Получить количество заметок в папке"""
        if self.folder_type == 'smart':
            return self._get_smart_notes_count()
        return self.notes.count()
    
    def _get_smart_notes_count(self):
        """Подсчет заметок для умной папки на основе правил"""
        from django.db.models import Q
        rules = self.smart_rules or {}
        queryset = Note.objects.filter(user=self.user, is_archived=False)
        
        # Фильтр по тегам
        if 'tags' in rules and rules['tags']:
            queryset = queryset.filter(tags__id__in=rules['tags']).distinct()
        
        # Фильтр по дате создания
        if 'date_from' in rules and rules['date_from']:
            queryset = queryset.filter(created_at__gte=rules['date_from'])
        if 'date_to' in rules and rules['date_to']:
            queryset = queryset.filter(created_at__lte=rules['date_to'])
        
        # Фильтр по типу (шаблону)
        if 'template' in rules and rules['template']:
            queryset = queryset.filter(template_id=rules['template'])
        
        return queryset.count()


class Tag(models.Model):
    """Модель тега для категоризации заметок"""
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True, db_index=True, help_text='Уникальный идентификатор тега')
    name = models.CharField(max_length=50)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tags')
    color = models.CharField(max_length=7, default='#FFD700', help_text='Цвет тега в HEX')
    usage_count = models.IntegerField(default=0, help_text='Количество использований')
    is_auto = models.BooleanField(default=False, help_text='Автоматически созданный тег')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-usage_count', 'name']
        unique_together = ['name', 'user']
    
    def __str__(self):
        return self.name
    
    def get_notes_count(self):
        """Получить количество заметок с этим тегом"""
        return self.notes.count()
    
    def increment_usage(self):
        """Увеличить счетчик использования"""
        self.usage_count += 1
        self.save(update_fields=['usage_count'])


class NoteTemplate(models.Model):
    """Модель шаблона заметки"""
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True, db_index=True, help_text='Уникальный идентификатор шаблона')
    name = models.CharField(max_length=200)
    category = models.CharField(max_length=100, blank=True, default='')
    description = models.TextField(blank=True)
    icon_svg = models.TextField(help_text='SVG код иконки')
    content = models.TextField(help_text='HTML содержимое шаблона', blank=True)
    template_data = models.JSONField(default=dict, blank=True, help_text='JSON структура шаблона с полями')
    tags = models.JSONField(default=list, blank=True, help_text='Теги для категоризации')
    is_default = models.BooleanField(default=False)
    is_premium = models.BooleanField(default=False, help_text='Премиум шаблон')
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00, help_text='Цена шаблона')
    creator = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_templates')
    purchases_count = models.IntegerField(default=0, help_text='Количество покупок')
    rating = models.FloatField(default=0.0, help_text='Рейтинг шаблона')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['category', 'name']
    
    def __str__(self):
        return self.name


class Note(models.Model):
    """Модель заметки"""
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True, db_index=True, help_text='Уникальный идентификатор заметки')
    title = models.CharField(max_length=200)
    content = models.TextField(blank=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notes')
    folder = models.ForeignKey(Folder, on_delete=models.SET_NULL, null=True, blank=True, related_name='notes')
    tags = models.ManyToManyField(Tag, blank=True, related_name='notes')
    template = models.ForeignKey(NoteTemplate, on_delete=models.SET_NULL, null=True, blank=True, related_name='notes')
    is_pinned = models.BooleanField(default=False)
    is_archived = models.BooleanField(default=False)
    is_encrypted = models.BooleanField(default=False)
    encryption_key_hash = models.CharField(max_length=255, blank=True, null=True, help_text='Хеш ключа шифрования')
    encryption_salt = models.TextField(blank=True, null=True, help_text='Salt для шифрования в base64')
    is_hidden = models.BooleanField(default=False, help_text='Скрытая заметка')
    visibility = models.CharField(max_length=20, default='private', choices=[('public', 'Публичная'), ('friends', 'Друзья'), ('private', 'Приватная')])
    attachment = models.FileField(upload_to='note_attachments/', null=True, blank=True, help_text='Прикрепленный файл')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-is_pinned', '-updated_at']
    
    def __str__(self):
        return self.title


class UserStatistics(models.Model):
    """Статистика пользователя"""
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True, db_index=True, help_text='Уникальный идентификатор статистики')
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='statistics')
    total_notes = models.IntegerField(default=0)
    total_characters = models.IntegerField(default=0)
    total_words = models.IntegerField(default=0)
    typing_speed_wpm = models.FloatField(default=0.0, help_text='Слов в минуту')
    typing_speed_cpm = models.FloatField(default=0.0, help_text='Символов в минуту')
    average_session_duration = models.DurationField(null=True, blank=True)
    total_sessions = models.IntegerField(default=0)
    last_active = models.DateTimeField(auto_now=True)
    streak_days = models.IntegerField(default=0, help_text='Текущий стрик')
    longest_streak = models.IntegerField(default=0)
    last_activity_date = models.DateField(null=True, blank=True)
    fireflies_count = models.IntegerField(default=0, help_text='Количество "огоньков"')
    rating_score = models.FloatField(default=0.0, help_text='Рейтинг активности')
    level = models.IntegerField(default=1, help_text='Уровень пользователя')
    experience_points = models.IntegerField(default=0)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Статистика пользователя'
        verbose_name_plural = 'Статистика пользователей'
    
    def __str__(self):
        return f'Статистика {self.user.username}'


class TypingSession(models.Model):
    """Сессия печати пользователя"""
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True, db_index=True, help_text='Уникальный идентификатор сессии')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='typing_sessions')
    note = models.ForeignKey(Note, on_delete=models.SET_NULL, null=True, blank=True, related_name='typing_sessions')
    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(null=True, blank=True)
    characters_typed = models.IntegerField(default=0)
    words_typed = models.IntegerField(default=0)
    typing_speed_wpm = models.FloatField(default=0.0)
    typing_speed_cpm = models.FloatField(default=0.0)
    errors_count = models.IntegerField(default=0)
    
    class Meta:
        ordering = ['-start_time']
        verbose_name = 'Сессия печати'
        verbose_name_plural = 'Сессии печати'
    
    def __str__(self):
        return f'Сессия {self.user.username} - {self.start_time}'
    
    def calculate_speed(self):
        """Рассчитать скорость печати"""
        if self.end_time and self.start_time:
            duration = (self.end_time - self.start_time).total_seconds() / 60.0  # в минутах
            if duration > 0:
                self.typing_speed_wpm = self.words_typed / duration
                self.typing_speed_cpm = self.characters_typed / duration
                self.save(update_fields=['typing_speed_wpm', 'typing_speed_cpm'])


class UserRating(models.Model):
    """Рейтинг пользователя"""
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True, db_index=True, help_text='Уникальный идентификатор рейтинга')
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='rating')
    rating = models.FloatField(default=0.0)
    rank = models.IntegerField(default=0, help_text='Позиция в рейтинге')
    last_calculated = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-rating']
        verbose_name = 'Рейтинг пользователя'
        verbose_name_plural = 'Рейтинги пользователей'
    
    def __str__(self):
        return f'Рейтинг {self.user.username}: {self.rating}'


class ChatRoom(models.Model):
    """Модель чат-комнаты"""
    ROOM_TYPES = [
        ('direct', 'Личный чат'),
        ('group', 'Групповой чат'),
    ]
    
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True, db_index=True, help_text='Уникальный идентификатор чат-комнаты')
    name = models.CharField(max_length=200, blank=True, help_text='Название для группового чата')
    room_type = models.CharField(max_length=20, choices=ROOM_TYPES, default='direct')
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_chat_rooms')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['-updated_at']
        verbose_name = 'Чат-комната'
        verbose_name_plural = 'Чат-комнаты'
    
    def __str__(self):
        if self.room_type == 'direct':
            members = self.members.all()[:2]
            if members.count() == 2:
                return f'Чат: {members[0].user.username} и {members[1].user.username}'
        return self.name or f'Групповой чат #{self.id}'
    
    def get_display_name(self, current_user):
        """Получить отображаемое имя чата для текущего пользователя"""
        if self.room_type == 'direct':
            other_member = self.members.exclude(user=current_user).first()
            if other_member:
                return other_member.user.username
        return self.name or f'Групповой чат #{self.id}'


class ChatMember(models.Model):
    """Участник чат-комнаты"""
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True, db_index=True, help_text='Уникальный идентификатор участника')
    room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE, related_name='members')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='chat_memberships')
    joined_at = models.DateTimeField(auto_now_add=True)
    last_read_at = models.DateTimeField(null=True, blank=True, help_text='Время последнего прочитанного сообщения')
    is_muted = models.BooleanField(default=False)
    is_admin = models.BooleanField(default=False, help_text='Администратор группы')
    is_favorite = models.BooleanField(default=False, help_text='Избранный чат')
    
    class Meta:
        unique_together = ['room', 'user']
        ordering = ['-is_favorite', '-joined_at']
        verbose_name = 'Участник чата'
        verbose_name_plural = 'Участники чата'
    
    def __str__(self):
        return f'{self.user.username} в {self.room}'


class ChatMessage(models.Model):
    """Модель сообщения в чате"""
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True, db_index=True, help_text='Уникальный идентификатор сообщения')
    room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    content = models.TextField(help_text='Текст сообщения')
    message_type = models.CharField(
        max_length=20, 
        default='text',
        choices=[
            ('text', 'Текст'),
            ('note', 'Заметка'),
            ('file', 'Файл'),
            ('image', 'Изображение'),
        ]
    )
    # Для сообщений типа 'note' - ссылка на заметку
    note = models.ForeignKey(Note, on_delete=models.SET_NULL, null=True, blank=True, related_name='chat_messages')
    # Для файлов и изображений
    file = models.FileField(upload_to='chat_files/', null=True, blank=True)
    is_edited = models.BooleanField(default=False)
    is_deleted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['created_at']
        verbose_name = 'Сообщение чата'
        verbose_name_plural = 'Сообщения чата'
    
    def __str__(self):
        return f'{self.sender.username}: {self.content[:50]}'
    
    def get_unread_count(self, user):
        """Получить количество непрочитанных сообщений для пользователя"""
        member = ChatMember.objects.filter(room=self.room, user=user).first()
        if not member or not member.last_read_at:
            return self.room.messages.filter(created_at__gt=member.joined_at).count()
        return self.room.messages.filter(created_at__gt=member.last_read_at).count()


class UserSettings(models.Model):
    """Настройки пользователя для приватности и конфиденциальности"""
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True, db_index=True, help_text='Уникальный идентификатор настроек')
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='settings')
    
    # Настройки приватности
    profile_visibility = models.CharField(
        max_length=20,
        default='public',
        choices=[
            ('public', 'Публичный'),
            ('friends', 'Только друзья'),
            ('private', 'Приватный'),
        ],
        help_text='Видимость профиля'
    )
    show_email = models.BooleanField(default=False, help_text='Показывать email')
    show_statistics = models.BooleanField(default=True, help_text='Показывать статистику')
    allow_follow_requests = models.BooleanField(default=True, help_text='Разрешить запросы на подписку')
    
    # Настройки заметок
    default_note_visibility = models.CharField(
        max_length=20,
        default='private',
        choices=[
            ('public', 'Публичная'),
            ('friends', 'Друзья'),
            ('private', 'Приватная'),
        ],
        help_text='Видимость заметок по умолчанию'
    )
    auto_save_enabled = models.BooleanField(default=True, help_text='Автосохранение заметок')
    auto_save_interval = models.IntegerField(default=30, help_text='Интервал автосохранения в секундах')
    
    # Настройки уведомлений
    email_notifications = models.BooleanField(default=False, help_text='Email уведомления')
    push_notifications = models.BooleanField(default=True, help_text='Push уведомления')
    notify_on_follow = models.BooleanField(default=True, help_text='Уведомлять о подписках')
    notify_on_message = models.BooleanField(default=True, help_text='Уведомлять о сообщениях')
    
    # Настройки безопасности
    two_factor_enabled = models.BooleanField(default=False, help_text='Двухфакторная аутентификация')
    session_timeout = models.IntegerField(default=7, help_text='Таймаут сессии в днях')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Настройки пользователя'
        verbose_name_plural = 'Настройки пользователей'
    
    def __str__(self):
        return f'Настройки {self.user.username}'


class MarketplaceItem(models.Model):
    """Товар на рынке (шаблоны, шрифты, анимации, темы)"""
    ITEM_TYPES = [
        ('template', 'Шаблон'),
        ('font', 'Шрифт'),
        ('animation', 'Анимация'),
        ('theme', 'Тема'),
    ]
    
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True, db_index=True, help_text='Уникальный идентификатор товара')
    name = models.CharField(max_length=200)
    item_type = models.CharField(max_length=20, choices=ITEM_TYPES, default='template')
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name='marketplace_items')
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    file = models.FileField(upload_to='marketplace/', null=True, blank=True, help_text='Файл товара')
    preview_image = models.FileField(upload_to='marketplace/previews/', null=True, blank=True, help_text='Превью изображение')
    description = models.TextField(help_text='Описание товара')
    purchases_count = models.IntegerField(default=0, help_text='Количество покупок')
    rating = models.FloatField(default=0.0, help_text='Рейтинг товара')
    is_active = models.BooleanField(default=True, help_text='Товар активен')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-rating', '-purchases_count', '-created_at']
        verbose_name = 'Товар маркетплейса'
        verbose_name_plural = 'Товары маркетплейса'
    
    def __str__(self):
        return f'{self.name} ({self.get_item_type_display()})'


class Purchase(models.Model):
    """Покупка товара на маркетплейсе"""
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True, db_index=True, help_text='Уникальный идентификатор покупки')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='purchases')
    item = models.ForeignKey(MarketplaceItem, on_delete=models.CASCADE, related_name='purchases')
    purchased_at = models.DateTimeField(auto_now_add=True)
    price_paid = models.DecimalField(max_digits=10, decimal_places=2)
    
    class Meta:
        unique_together = ['user', 'item']
        ordering = ['-purchased_at']
        verbose_name = 'Покупка'
        verbose_name_plural = 'Покупки'
    
    def __str__(self):
        return f'{self.user.username} купил {self.item.name}'


class Currency(models.Model):
    """Внутренняя валюта пользователя"""
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True, db_index=True, help_text='Уникальный идентификатор валюты')
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='currency')
    balance = models.IntegerField(default=0, help_text='Текущий баланс')
    total_earned = models.IntegerField(default=0, help_text='Всего заработано')
    total_spent = models.IntegerField(default=0, help_text='Всего потрачено')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Валюта пользователя'
        verbose_name_plural = 'Валюты пользователей'
    
    def __str__(self):
        return f'{self.user.username}: {self.balance} монет'


class DailyTask(models.Model):
    """Ежедневное задание"""
    TASK_TYPES = [
        ('daily', 'Ежедневное'),
        ('weekly', 'Еженедельное'),
        ('special', 'Специальное'),
    ]
    
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True, db_index=True, help_text='Уникальный идентификатор задания')
    title = models.CharField(max_length=200)
    description = models.TextField(help_text='Описание задания')
    reward = models.IntegerField(default=0, help_text='Награда в валюте')
    task_type = models.CharField(max_length=20, choices=TASK_TYPES, default='daily')
    is_active = models.BooleanField(default=True, help_text='Задание активно')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['task_type', 'reward']
        verbose_name = 'Задание'
        verbose_name_plural = 'Задания'
    
    def __str__(self):
        return f'{self.title} ({self.reward} монет)'


class TaskCompletion(models.Model):
    """Выполнение задания пользователем"""
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True, db_index=True, help_text='Уникальный идентификатор выполнения')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='task_completions')
    task = models.ForeignKey(DailyTask, on_delete=models.CASCADE, related_name='completions')
    completed_at = models.DateTimeField(auto_now_add=True)
    reward_earned = models.IntegerField(default=0, help_text='Полученная награда')
    
    class Meta:
        unique_together = ['user', 'task']
        ordering = ['-completed_at']
        verbose_name = 'Выполнение задания'
        verbose_name_plural = 'Выполнения заданий'
    
    def __str__(self):
        return f'{self.user.username} выполнил {self.task.title}'


class Transaction(models.Model):
    """Транзакция валюты"""
    TRANSACTION_TYPES = [
        ('earn', 'Заработано'),
        ('spend', 'Потрачено'),
    ]
    
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True, db_index=True, help_text='Уникальный идентификатор транзакции')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='transactions')
    amount = models.IntegerField(help_text='Сумма транзакции')
    transaction_type = models.CharField(max_length=10, choices=TRANSACTION_TYPES)
    description = models.TextField(help_text='Описание транзакции')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Транзакция'
        verbose_name_plural = 'Транзакции'
    
    def __str__(self):
        return f'{self.user.username}: {self.transaction_type} {self.amount} монет'


class Firefly(models.Model):
    """Модель "огонька" (лайка) для заметок друзей"""
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True, db_index=True, help_text='Уникальный идентификатор огонька')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_fireflies')
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_fireflies')
    note = models.ForeignKey(Note, on_delete=models.CASCADE, null=True, blank=True, related_name='fireflies')
    message = models.TextField(blank=True, null=True, help_text='Сообщение с "огоньком"')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Огонек'
        verbose_name_plural = 'Огоньки'
    
    def __str__(self):
        return f'{self.sender.username} → {self.receiver.username}'

