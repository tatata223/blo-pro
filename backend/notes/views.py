from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth import authenticate, login, logout
from django.db.models import Q, Max, Sum
from django.contrib.auth import get_user_model
from .models import (
    Folder, Tag, NoteTemplate, Note, UserStatistics, 
    TypingSession, UserRating, UserProfile, Follow,
    ChatRoom, ChatMember, ChatMessage, UserSettings,
    MarketplaceItem, Purchase, Currency, DailyTask, TaskCompletion, Transaction, Firefly
)
from .serializers import (
    UserSerializer, FolderSerializer, TagSerializer, 
    NoteTemplateSerializer, NoteSerializer,
    ChatRoomSerializer, ChatMemberSerializer, ChatMessageSerializer,
    MarketplaceItemSerializer, PurchaseSerializer, CurrencySerializer,
    DailyTaskSerializer, TaskCompletionSerializer, TransactionSerializer, FireflySerializer
)
from django.utils import timezone
from datetime import timedelta, date
from .permissions import IsOwnerOrReadOnly

# Опциональный импорт EncryptionService
try:
    from .services.encryption_service import EncryptionService
    ENCRYPTION_AVAILABLE = True
except ImportError:
    ENCRYPTION_AVAILABLE = False
    EncryptionService = None

User = get_user_model()


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    username = request.data.get('username', '').strip()
    password = request.data.get('password', '')
    
    if not username or not password:
        return Response(
            {'error': 'Имя пользователя и пароль обязательны'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    user = authenticate(request, username=username, password=password)
    if user:
        login(request, user)
        return Response(UserSerializer(user).data)
    else:
        return Response(
            {'error': 'Неверное имя пользователя или пароль'}, 
            status=status.HTTP_401_UNAUTHORIZED
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    logout(request)
    return Response({'message': 'Logged out successfully'})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user_view(request):
    return Response(UserSerializer(request.user).data)


@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    try:
        username = request.data.get('username', '').strip()
        email = request.data.get('email', '').strip()
        password = request.data.get('password', '')
        
        if not username or not password:
            return Response(
                {'error': 'Имя пользователя и пароль обязательны'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if len(password) < 8:
            return Response(
                {'error': 'Пароль должен содержать минимум 8 символов'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if User.objects.filter(username=username).exists():
            return Response(
                {'error': 'Пользователь с таким именем уже существует'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if email and User.objects.filter(email=email).exists():
            return Response(
                {'error': 'Пользователь с таким email уже существует'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user = User.objects.create_user(
            username=username,
            email=email or f'{username}@example.com',
            password=password
        )
        login(request, user)
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response(
            {'error': f'Ошибка регистрации: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


class FolderViewSet(viewsets.ModelViewSet):
    serializer_class = FolderSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]
    
    def get_queryset(self):
        queryset = Folder.objects.filter(user=self.request.user)
        
        # Фильтр по типу папки
        folder_type = self.request.query_params.get('type', None)
        if folder_type:
            queryset = queryset.filter(folder_type=folder_type)
        
        # Фильтр избранных папок
        favorites_only = self.request.query_params.get('favorites', None)
        if favorites_only == 'true':
            queryset = queryset.filter(is_favorite=True)
        
        return queryset.order_by('-is_favorite', 'name')
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    def create(self, request, *args, **kwargs):
        try:
            return super(FolderViewSet, self).create(request, *args, **kwargs)
        except Exception as e:
            return Response(
                {'error': f'Ошибка при создании папки: {str(e)}'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['post'])
    def toggle_favorite(self, request, pk=None):
        """Переключение избранного статуса папки"""
        folder = self.get_object()
        folder.is_favorite = not folder.is_favorite
        folder.save()
        return Response({'is_favorite': folder.is_favorite})
    
    @action(detail=False, methods=['get'])
    def tree(self, request):
        """Получить дерево папок"""
        folders = Folder.objects.filter(user=request.user, parent=None)
        serializer = self.get_serializer(folders, many=True)
        return Response(serializer.data)


class TagViewSet(viewsets.ModelViewSet):
    serializer_class = TagSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]
    
    def get_queryset(self):
        queryset = Tag.objects.filter(user=self.request.user)
        
        # Поиск по имени
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(name__icontains=search)
        
        # Сортировка по популярности или имени
        order_by = self.request.query_params.get('order_by', '-usage_count')
        if order_by in ['-usage_count', 'usage_count', '-name', 'name']:
            queryset = queryset.order_by(order_by)
        else:
            queryset = queryset.order_by('-usage_count', 'name')
        
        return queryset
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    def create(self, request, *args, **kwargs):
        try:
            return super(TagViewSet, self).create(request, *args, **kwargs)
        except Exception as e:
            return Response(
                {'error': f'Ошибка при создании тега: {str(e)}'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=False, methods=['get'])
    def cloud(self, request):
        """Получить облако тегов с популярностью"""
        from django.db.models import Max
        tags = Tag.objects.filter(user=request.user)
        max_count = tags.aggregate(Max('usage_count'))['usage_count__max'] or 1
        
        cloud_data = []
        for tag in tags:
            size = min(100, max(12, int((tag.usage_count / max_count) * 100))) if max_count > 0 else 12
            cloud_data.append({
                'id': tag.id,
                'name': tag.name,
                'color': tag.color,
                'count': tag.get_notes_count(),
                'usage_count': tag.usage_count,
                'size': size
            })
        
        return Response(cloud_data)
    
    @action(detail=False, methods=['get'])
    def autocomplete(self, request):
        """Автодополнение тегов"""
        query = request.query_params.get('q', '').strip()
        if not query:
            return Response([])
        
        tags = Tag.objects.filter(
            user=request.user,
            name__icontains=query
        ).order_by('-usage_count', 'name')[:10]
        
        serializer = self.get_serializer(tags, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Статистика использования тегов"""
        from django.db.models import Sum
        tags = Tag.objects.filter(user=request.user)
        total_tags = tags.count()
        total_usage = tags.aggregate(Sum('usage_count'))['usage_count__sum'] or 0
        most_used = tags.order_by('-usage_count')[:10]
        
        return Response({
            'total_tags': total_tags,
            'total_usage': total_usage,
            'most_used': TagSerializer(most_used, many=True).data
        })


class NoteTemplateViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = NoteTemplateSerializer
    permission_classes = [AllowAny]  # Разрешаем доступ без авторизации для просмотра шаблонов
    queryset = NoteTemplate.objects.all()


class NoteViewSet(viewsets.ModelViewSet):
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]
    
    def get_queryset(self):
        queryset = Note.objects.filter(user=self.request.user, is_archived=False)
        
        # Фильтрация по папке
        folder_id = self.request.query_params.get('folder', None)
        if folder_id:
            queryset = queryset.filter(folder_id=folder_id)
        
        # Фильтрация по тегам
        tag_ids = self.request.query_params.getlist('tags', [])
        if tag_ids:
            queryset = queryset.filter(tags__id__in=tag_ids).distinct()
        
        # Поиск
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | Q(content__icontains=search)
            )
        
        return queryset
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def pin(self, request, pk=None):
        note = self.get_object()
        note.is_pinned = not note.is_pinned
        note.save()
        return Response({'is_pinned': note.is_pinned})
    
    @action(detail=True, methods=['post'])
    def archive(self, request, pk=None):
        note = self.get_object()
        note.is_archived = not note.is_archived
        note.save()
        return Response({'is_archived': note.is_archived})
    
    @action(detail=True, methods=['post'])
    def encrypt(self, request, pk=None):
        """Зашифровать заметку"""
        if not ENCRYPTION_AVAILABLE:
            return Response(
                {'error': 'Модуль cryptography не установлен. Установите: pip install cryptography'}, 
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        
        note = self.get_object()
        password = request.data.get('password')
        
        if not password:
            return Response(
                {'error': 'Пароль обязателен'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if note.is_encrypted:
            return Response(
                {'error': 'Заметка уже зашифрована'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            from .services.encryption_service import EncryptionService
            # Шифруем содержимое
            encrypted_content, salt = EncryptionService.encrypt_content(
                note.content, 
                password
            )
            
            # Сохраняем зашифрованное содержимое
            note.content = encrypted_content
            note.encryption_salt = salt
            note.encryption_key_hash = EncryptionService.hash_password(password)
            note.is_encrypted = True
            note.save()
            
            return Response({
                'message': 'Заметка успешно зашифрована',
                'is_encrypted': True
            })
        except Exception as e:
            return Response(
                {'error': f'Ошибка шифрования: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['post'])
    def decrypt(self, request, pk=None):
        """Расшифровать заметку"""
        if not ENCRYPTION_AVAILABLE:
            return Response(
                {'error': 'Модуль cryptography не установлен. Установите: pip install cryptography'}, 
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        
        note = self.get_object()
        password = request.data.get('password')
        
        if not password:
            return Response(
                {'error': 'Пароль обязателен'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not note.is_encrypted:
            return Response(
                {'error': 'Заметка не зашифрована'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not note.encryption_salt:
            return Response(
                {'error': 'Ошибка: отсутствует salt для расшифровки'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        try:
            from .services.encryption_service import EncryptionService
            # Проверяем пароль
            if not EncryptionService.verify_password(password, note.encryption_key_hash):
                return Response(
                    {'error': 'Неверный пароль'}, 
                    status=status.HTTP_401_UNAUTHORIZED
                )
            
            # Расшифровываем содержимое
            decrypted_content = EncryptionService.decrypt_content(
                note.content,
                password,
                note.encryption_salt
            )
            
            return Response({
                'content': decrypted_content,
                'message': 'Заметка успешно расшифрована'
            })
        except Exception as e:
            return Response(
                {'error': f'Ошибка расшифровки: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['post'])
    def remove_encryption(self, request, pk=None):
        """Убрать шифрование с заметки"""
        if not ENCRYPTION_AVAILABLE:
            return Response(
                {'error': 'Модуль cryptography не установлен. Установите: pip install cryptography'}, 
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        
        note = self.get_object()
        password = request.data.get('password')
        
        if not password:
            return Response(
                {'error': 'Пароль обязателен'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not note.is_encrypted:
            return Response(
                {'error': 'Заметка не зашифрована'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            from .services.encryption_service import EncryptionService
            # Проверяем пароль
            if not EncryptionService.verify_password(password, note.encryption_key_hash):
                return Response(
                    {'error': 'Неверный пароль'}, 
                    status=status.HTTP_401_UNAUTHORIZED
                )
            
            # Расшифровываем и сохраняем без шифрования
            decrypted_content = EncryptionService.decrypt_content(
                note.content,
                password,
                note.encryption_salt
            )
            
            note.content = decrypted_content
            note.is_encrypted = False
            note.encryption_key_hash = None
            note.encryption_salt = None
            note.save()
            
            return Response({
                'message': 'Шифрование успешно удалено',
                'is_encrypted': False
            })
        except Exception as e:
            return Response(
                {'error': f'Ошибка: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def retrieve(self, request, *args, **kwargs):
        """Переопределяем retrieve для автоматической расшифровки"""
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        data = serializer.data
        
        # Если заметка зашифрована, не показываем содержимое
        if instance.is_encrypted:
            data['content'] = '[Зашифровано]'
            data['requires_password'] = True
        
        return Response(data)
    
    @action(detail=False, methods=['post'])
    def create_from_template(self, request):
        """Создание заметки из шаблона"""
        template_id = request.data.get('template_id')
        if not template_id:
            return Response(
                {'error': 'template_id is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            template = NoteTemplate.objects.get(id=template_id)
        except NoteTemplate.DoesNotExist:
            return Response(
                {'error': 'Template not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Создаем заметку из шаблона
        # Если у шаблона есть template_data, создаем базовую структуру
        content = template.content or ''
        
        # Если есть template_data, создаем начальную структуру документа
        if template.template_data and isinstance(template.template_data, dict):
            if 'fields' in template.template_data:
                # Создаем базовую HTML структуру для Word-стиля
                content = f'''<div style="font-family: 'Times New Roman', Times, serif; font-size: 12pt; line-height: 1.5; color: #000000; background: #ffffff; width: 210mm; min-height: 297mm; margin: 0 auto; padding: 25.4mm 31.7mm; box-shadow: 0 0 20px rgba(0,0,0,0.1);">
<div style="text-align: center; margin-bottom: 24pt; border-bottom: 2px solid #000000; padding-bottom: 12pt;">
<h1 style="font-size: 18pt; font-weight: bold; margin: 0; color: #000000; text-transform: uppercase; letter-spacing: 1px;">{template.name}</h1>
</div>
<p style="margin: 0 0 12pt 0; text-indent: 0; text-align: justify;">Начните заполнять шаблон...</p>
</div>'''
        
        note = Note.objects.create(
            user=request.user,
            title=template.name,
            content=content,
            template=template
        )
        
        serializer = self.get_serializer(note)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'])
    def export_pdf(self, request, pk=None):
        """Экспорт заметки в PDF (скачивание)"""
        note = self.get_object()
        try:
            pdf_bytes = export_note_to_pdf(note)
            filename = f"{note.title or 'note'}.pdf"
            return create_pdf_response(pdf_bytes, filename)
        except Exception as e:
            return Response(
                {'error': f'Ошибка при экспорте в PDF: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['post'])
    def export_email(self, request, pk=None):
        """Отправка заметки на email"""
        note = self.get_object()
        recipient_email = request.data.get('email')
        
        if not recipient_email:
            return Response(
                {'error': 'Email адрес обязателен'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            send_note_via_email(note, recipient_email)
            return Response({'message': 'Заметка успешно отправлена на email'})
        except Exception as e:
            return Response(
                {'error': f'Ошибка при отправке email: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['post'])
    def export_telegram(self, request, pk=None):
        """Отправка заметки в Telegram"""
        note = self.get_object()
        chat_id = request.data.get('chat_id')
        bot_token = request.data.get('bot_token')
        
        if not chat_id:
            return Response(
                {'error': 'Chat ID обязателен'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            result = send_note_via_telegram(note, chat_id, bot_token)
            return Response({'message': 'Заметка успешно отправлена в Telegram', 'result': result})
        except Exception as e:
            return Response(
                {'error': f'Ошибка при отправке в Telegram: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['post'])
    def export_whatsapp(self, request, pk=None):
        """Получить PDF для отправки в WhatsApp"""
        note = self.get_object()
        
        # WhatsApp не имеет прямого API, поэтому возвращаем PDF для скачивания
        try:
            pdf_bytes = export_note_to_pdf(note)
            filename = f"{note.title or 'note'}.pdf"
            return create_pdf_response(pdf_bytes, filename)
        except Exception as e:
            return Response(
                {'error': f'Ошибка при создании PDF: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# Профиль пользователя
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_profile_view(request, user_id=None):
    """Получить профиль пользователя"""
    target_user_id = user_id or request.user.id
    try:
        target_user = User.objects.get(id=target_user_id)
    except User.DoesNotExist:
        return Response(
            {'error': 'Пользователь не найден'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Проверяем доступность профиля
    if target_user.id != request.user.id and not target_user.is_public:
        profile, _ = UserProfile.objects.get_or_create(user=target_user)
        if not profile.is_public:
            return Response(
                {'error': 'Профиль недоступен'}, 
                status=status.HTTP_403_FORBIDDEN
            )
    
    profile, _ = UserProfile.objects.get_or_create(user=target_user)
    is_following = Follow.objects.filter(follower=request.user, following=target_user).exists()
    
    return Response({
        'user_id': target_user.id,
        'username': target_user.username,
        'display_name': profile.display_name or target_user.username,
        'bio': profile.bio or target_user.bio or '',
        'location': profile.location or target_user.location or '',
        'website': profile.website or target_user.website or '',
        'avatar': profile.avatar.url if profile.avatar else (target_user.avatar.url if target_user.avatar else None),
        'cover_image': profile.cover_image.url if profile.cover_image else None,
        'followers_count': target_user.followers_count,
        'following_count': target_user.following_count,
        'is_following': is_following,
        'is_own_profile': target_user.id == request.user.id,
    })


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_user_profile_view(request):
    """Обновить профиль текущего пользователя"""
    profile, created = UserProfile.objects.get_or_create(user=request.user)
    
    # Обработка текстовых полей
    display_name = request.data.get('display_name', '')
    bio = request.data.get('bio', '')
    location = request.data.get('location', '')
    website = request.data.get('website', '')
    is_public_raw = request.data.get('is_public', False)
    
    # Конвертируем строку в boolean если нужно
    if isinstance(is_public_raw, str):
        is_public = is_public_raw.lower() in ('true', '1', 'yes', 'on')
    else:
        is_public = bool(is_public_raw)
    
    if display_name:
        profile.display_name = display_name
    if bio is not None:
        profile.bio = bio
    if location is not None:
        profile.location = location
    if website is not None:
        profile.website = website
    if is_public is not None:
        profile.is_public = is_public
        request.user.is_public = is_public
        request.user.save(update_fields=['is_public'])
    
    # Обработка загрузки файлов
    if 'avatar' in request.FILES:
        profile.avatar = request.FILES['avatar']
    if 'cover_image' in request.FILES:
        profile.cover_image = request.FILES['cover_image']
    
    profile.save()
    
    # Формируем URL для изображений
    avatar_url = profile.avatar.url if profile.avatar else None
    cover_url = profile.cover_image.url if profile.cover_image else None
    
    return Response({
        'message': 'Профиль обновлен',
        'profile': {
            'display_name': profile.display_name,
            'bio': profile.bio,
            'location': profile.location,
            'website': profile.website,
            'is_public': profile.is_public,
            'avatar': avatar_url,
            'cover_image': cover_url,
        }
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_public_notes_view(request, user_id):
    """Получить публичные заметки пользователя"""
    try:
        target_user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response(
            {'error': 'Пользователь не найден'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Получаем только публичные заметки
    notes = Note.objects.filter(
        user=target_user,
        is_archived=False,
        visibility='public'
    ).order_by('-created_at')[:50]
    
    serializer = NoteSerializer(notes, many=True)
    return Response(serializer.data)


@api_view(['POST', 'DELETE'])
@permission_classes([IsAuthenticated])
def follow_user_view(request, user_id):
    """Подписаться/отписаться на пользователя"""
    try:
        target_user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response(
            {'error': 'Пользователь не найден'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    if target_user.id == request.user.id:
        return Response(
            {'error': 'Нельзя подписаться на себя'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if request.method == 'POST':
        # Подписаться
        follow, created = Follow.objects.get_or_create(
            follower=request.user,
            following=target_user
        )
        if created:
            return Response({'message': 'Вы подписались на пользователя', 'is_following': True})
        else:
            return Response({'message': 'Вы уже подписаны на этого пользователя', 'is_following': True})
    else:
        # Отписаться
        try:
            follow = Follow.objects.get(follower=request.user, following=target_user)
            follow.delete()
            return Response({'message': 'Вы отписались от пользователя', 'is_following': False})
        except Follow.DoesNotExist:
            return Response({'message': 'Вы не подписаны на этого пользователя', 'is_following': False})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_followers_view(request, user_id):
    """Получить подписчиков пользователя"""
    try:
        target_user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response(
            {'error': 'Пользователь не найден'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Проверяем доступность
    if target_user.id != request.user.id and not target_user.is_public:
        return Response(
            {'error': 'Доступ запрещен'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    followers = Follow.objects.filter(following=target_user).select_related('follower')
    followers_data = [{
        'user_id': f.follower.id,
        'username': f.follower.username,
        'followed_at': f.created_at
    } for f in followers]
    
    return Response(followers_data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_following_view(request, user_id):
    """Получить подписки пользователя"""
    try:
        target_user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response(
            {'error': 'Пользователь не найден'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Проверяем доступность
    if target_user.id != request.user.id and not target_user.is_public:
        return Response(
            {'error': 'Доступ запрещен'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    following = Follow.objects.filter(follower=target_user).select_related('following')
    following_data = [{
        'user_id': f.following.id,
        'username': f.following.username,
        'followed_at': f.created_at
    } for f in following]
    
    return Response(following_data)


# Статистика пользователя
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_statistics_view(request):
    """Получить статистику текущего пользователя"""
    stats, created = UserStatistics.objects.get_or_create(user=request.user)
    
    # Обновляем статистику на основе реальных данных
    notes = Note.objects.filter(user=request.user, is_archived=False)
    stats.total_notes = notes.count()
    stats.total_characters = sum(len(note.content) for note in notes)
    stats.total_words = sum(len(note.content.split()) for note in notes)
    stats.save()
    
    return Response({
        'total_notes': stats.total_notes,
        'total_characters': stats.total_characters,
        'total_words': stats.total_words,
        'typing_speed_wpm': stats.typing_speed_wpm,
        'typing_speed_cpm': stats.typing_speed_cpm,
        'total_sessions': stats.total_sessions,
        'last_active': stats.last_active,
        'streak_days': stats.streak_days,
        'longest_streak': stats.longest_streak,
        'rating_score': stats.rating_score,
        'level': stats.level,
        'experience_points': stats.experience_points,
        'fireflies_count': stats.fireflies_count,
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_rating_view(request):
    """Получить рейтинг пользователей"""
    # Обновляем рейтинги всех пользователей
    users = User.objects.all()
    ratings = []
    
    for user in users:
        stats, _ = UserStatistics.objects.get_or_create(user=user)
        rating, _ = UserRating.objects.get_or_create(user=user)
        
        # Расчет рейтинга на основе активности
        notes_count = Note.objects.filter(user=user, is_archived=False).count()
        sessions_count = stats.total_sessions
        streak = stats.streak_days
        
        # Формула рейтинга: заметки * 10 + сессии * 5 + стрик * 20
        rating.rating = (notes_count * 10) + (sessions_count * 5) + (streak * 20)
        rating.save()
        
        ratings.append({
            'user_id': user.id,
            'username': user.username,
            'rating': rating.rating,
            'rank': 0,  # Будет установлен после сортировки
        })
    
    # Сортируем и устанавливаем ранги
    ratings.sort(key=lambda x: x['rating'], reverse=True)
    for i, rating_data in enumerate(ratings, 1):
        rating_data['rank'] = i
        UserRating.objects.filter(user_id=rating_data['user_id']).update(rank=i)
    
    # Возвращаем топ-100
    return Response(ratings[:100])


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def typing_session_start_view(request):
    """Начать сессию печати"""
    note_id = request.data.get('note_id')
    note = None
    if note_id:
        try:
            note = Note.objects.get(id=note_id, user=request.user)
        except Note.DoesNotExist:
            pass
    
    session = TypingSession.objects.create(
        user=request.user,
        note=note,
        start_time=timezone.now()
    )
    
    return Response({
        'session_id': session.id,
        'start_time': session.start_time
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def typing_session_end_view(request):
    """Завершить сессию печати"""
    session_id = request.data.get('session_id')
    characters_typed = request.data.get('characters_typed', 0)
    words_typed = request.data.get('words_typed', 0)
    errors_count = request.data.get('errors_count', 0)
    
    try:
        session = TypingSession.objects.get(id=session_id, user=request.user)
    except TypingSession.DoesNotExist:
        return Response(
            {'error': 'Session not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    session.end_time = timezone.now()
    session.characters_typed = characters_typed
    session.words_typed = words_typed
    session.errors_count = errors_count
    session.calculate_speed()
    session.save()
    
    # Обновляем статистику пользователя
    stats, _ = UserStatistics.objects.get_or_create(user=request.user)
    stats.total_sessions += 1
    
    # Обновляем среднюю скорость печати
    recent_sessions = TypingSession.objects.filter(
        user=request.user,
        end_time__isnull=False
    ).order_by('-end_time')[:10]
    
    if recent_sessions:
        avg_wpm = sum(s.typing_speed_wpm for s in recent_sessions) / len(recent_sessions)
        avg_cpm = sum(s.typing_speed_cpm for s in recent_sessions) / len(recent_sessions)
        stats.typing_speed_wpm = avg_wpm
        stats.typing_speed_cpm = avg_cpm
    
    stats.save()
    
    return Response({
        'session_id': session.id,
        'typing_speed_wpm': session.typing_speed_wpm,
        'typing_speed_cpm': session.typing_speed_cpm,
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def typing_session_keystroke_view(request):
    """Отслеживание нажатий клавиш (для реального времени)"""
    session_id = request.data.get('session_id')
    characters_typed = request.data.get('characters_typed', 0)
    words_typed = request.data.get('words_typed', 0)
    
    try:
        session = TypingSession.objects.get(id=session_id, user=request.user)
    except TypingSession.DoesNotExist:
        return Response(
            {'error': 'Session not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    session.characters_typed = characters_typed
    session.words_typed = words_typed
    
    # Рассчитываем текущую скорость
    if session.start_time:
        duration = (timezone.now() - session.start_time).total_seconds() / 60.0
        if duration > 0:
            session.typing_speed_wpm = words_typed / duration
            session.typing_speed_cpm = characters_typed / duration
    
    session.save(update_fields=['characters_typed', 'words_typed', 'typing_speed_wpm', 'typing_speed_cpm'])
    
    return Response({
        'typing_speed_wpm': session.typing_speed_wpm,
        'typing_speed_cpm': session.typing_speed_cpm,
    })


# Экспорт заметок
@action(detail=True, methods=['post'])
def export_pdf(self, request, pk=None):
    """Экспорт заметки в PDF (скачивание)"""
    note = self.get_object()
    try:
        pdf_bytes = export_note_to_pdf(note)
        filename = f"{note.title or 'note'}.pdf"
        return create_pdf_response(pdf_bytes, filename)
    except Exception as e:
        return Response(
            {'error': f'Ошибка при экспорте в PDF: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@action(detail=True, methods=['post'])
def export_email(self, request, pk=None):
    """Отправка заметки на email"""
    note = self.get_object()
    recipient_email = request.data.get('email')
    
    if not recipient_email:
        return Response(
            {'error': 'Email адрес обязателен'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        send_note_via_email(note, recipient_email)
        return Response({'message': 'Заметка успешно отправлена на email'})
    except Exception as e:
        return Response(
            {'error': f'Ошибка при отправке email: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@action(detail=True, methods=['post'])
def export_telegram(self, request, pk=None):
    """Отправка заметки в Telegram"""
    note = self.get_object()
    chat_id = request.data.get('chat_id')
    bot_token = request.data.get('bot_token')
    
    if not chat_id:
        return Response(
            {'error': 'Chat ID обязателен'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        result = send_note_via_telegram(note, chat_id, bot_token)
        return Response({'message': 'Заметка успешно отправлена в Telegram', 'result': result})
    except Exception as e:
        return Response(
            {'error': f'Ошибка при отправке в Telegram: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@action(detail=True, methods=['post'])
def export_whatsapp(self, request, pk=None):
    """Получить ссылку для отправки в WhatsApp"""
    note = self.get_object()
    
    # WhatsApp не имеет прямого API, поэтому создаем ссылку для веб-версии
    # или возвращаем инструкции для скачивания и отправки вручную
    try:
        pdf_bytes = export_note_to_pdf(note)
        filename = f"{note.title or 'note'}.pdf"
        
        # Возвращаем PDF для скачивания, пользователь сам отправит в WhatsApp
        return create_pdf_response(pdf_bytes, filename)
    except Exception as e:
        return Response(
            {'error': f'Ошибка при создании PDF: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# Chat API endpoints
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def chat_rooms_view(request):
    """Получить список чат-комнат пользователя"""
    rooms = ChatRoom.objects.filter(
        members__user=request.user,
        is_active=True
    ).distinct().order_by('-updated_at')
    
    # Сортируем в Python, чтобы избранные были первыми
    def sort_key(room):
        member = ChatMember.objects.filter(room=room, user=request.user).first()
        is_fav = member.is_favorite if member else False
        return (not is_fav, room.updated_at)
    
    rooms_list = list(rooms)
    rooms_list.sort(key=sort_key, reverse=True)
    
    serializer = ChatRoomSerializer(rooms_list, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_chat_room_view(request):
    """Создать новую чат-комнату"""
    room_type = request.data.get('room_type', 'direct')
    user_ids = request.data.get('user_ids', [])
    
    if room_type == 'direct' and len(user_ids) != 1:
        return Response(
            {'error': 'Для личного чата нужен один пользователь'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Проверяем, не существует ли уже личный чат с этим пользователем
    if room_type == 'direct':
        existing_room = ChatRoom.objects.filter(
            room_type='direct',
            members__user=request.user
        ).filter(
            members__user_id__in=user_ids
        ).distinct()
        
        if existing_room.exists():
            room = existing_room.first()
            serializer = ChatRoomSerializer(room, context={'request': request})
            return Response(serializer.data, status=status.HTTP_200_OK)
    
    # Создаем новую комнату
    room = ChatRoom.objects.create(
        name=request.data.get('name', ''),
        room_type=room_type,
        created_by=request.user
    )
    
    # Добавляем создателя в участники
    ChatMember.objects.create(room=room, user=request.user, is_admin=True)
    
    # Добавляем других участников
    for user_id in user_ids:
        try:
            user = User.objects.get(id=user_id)
            ChatMember.objects.get_or_create(room=room, user=user)
        except User.DoesNotExist:
            pass
    
    serializer = ChatRoomSerializer(room, context={'request': request})
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def chat_room_detail_view(request, room_id):
    """Получить детали чат-комнаты"""
    try:
        room = ChatRoom.objects.get(id=room_id)
    except ChatRoom.DoesNotExist:
        return Response(
            {'error': 'Чат-комната не найдена'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Проверяем, что пользователь является участником
    if not ChatMember.objects.filter(room=room, user=request.user).exists():
        return Response(
            {'error': 'Доступ запрещен'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    serializer = ChatRoomSerializer(room, context={'request': request})
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def chat_messages_view(request, room_id):
    """Получить сообщения чат-комнаты"""
    try:
        room = ChatRoom.objects.get(id=room_id)
    except ChatRoom.DoesNotExist:
        return Response(
            {'error': 'Чат-комната не найдена'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Проверяем, что пользователь является участником
    if not ChatMember.objects.filter(room=room, user=request.user).exists():
        return Response(
            {'error': 'Доступ запрещен'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    messages = room.messages.filter(is_deleted=False).order_by('-created_at')[:50]
    serializer = ChatMessageSerializer(messages, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_chat_message_view(request, room_id):
    """Отправить сообщение в чат-комнату"""
    try:
        room = ChatRoom.objects.get(id=room_id)
    except ChatRoom.DoesNotExist:
        return Response(
            {'error': 'Чат-комната не найдена'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Проверяем, что пользователь является участником
    if not ChatMember.objects.filter(room=room, user=request.user).exists():
        return Response(
            {'error': 'Доступ запрещен'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    content = request.data.get('content', '')
    note_id = request.data.get('note_id')
    file = request.FILES.get('file')
    message_type = request.data.get('message_type', 'text')
    
    if not content and not note_id and not file:
        return Response(
            {'error': 'Сообщение не может быть пустым'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Определяем тип сообщения
    if note_id:
        message_type = 'note'
    elif file:
        if file.content_type and file.content_type.startswith('image/'):
            message_type = 'image'
        else:
            message_type = 'file'
    
    message = ChatMessage.objects.create(
        room=room,
        sender=request.user,
        content=content or '',
        message_type=message_type,
        note_id=note_id if note_id else None,
        file=file if file else None
    )
    
    serializer = ChatMessageSerializer(message, context={'request': request})
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_chat_read_view(request, room_id):
    """Отметить сообщения как прочитанные"""
    try:
        room = ChatRoom.objects.get(id=room_id)
    except ChatRoom.DoesNotExist:
        return Response(
            {'error': 'Чат-комната не найдена'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    member = ChatMember.objects.filter(room=room, user=request.user).first()
    if not member:
        return Response(
            {'error': 'Доступ запрещен'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    member.last_read_at = timezone.now()
    member.save(update_fields=['last_read_at'])
    
    return Response({'message': 'Сообщения отмечены как прочитанные'})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_chat_favorite_view(request, room_id):
    """Добавить/удалить чат из избранного"""
    try:
        room = ChatRoom.objects.get(id=room_id)
    except ChatRoom.DoesNotExist:
        return Response(
            {'error': 'Чат-комната не найдена'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    member = ChatMember.objects.filter(room=room, user=request.user).first()
    if not member:
        return Response(
            {'error': 'Доступ запрещен'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    member.is_favorite = not member.is_favorite
    member.save(update_fields=['is_favorite'])
    
    return Response({
        'message': 'Чат добавлен в избранное' if member.is_favorite else 'Чат удален из избранного',
        'is_favorite': member.is_favorite
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def chat_search_view(request):
    """Поиск пользователей по ID/username и чатов по ID"""
    query = request.query_params.get('q', '').strip()
    
    if not query:
        return Response({'error': 'Пустой запрос поиска'}, status=status.HTTP_400_BAD_REQUEST)
    
    results = {
        'users': [],
        'rooms': []
    }
    
    # Поиск пользователей по ID или username
    try:
        # Попытка поиска по UUID или числовому ID
        try:
            user = User.objects.get(id=query)
            profile = UserProfile.objects.filter(user=user).first()
            avatar_url = None
            if profile and profile.avatar:
                avatar_url = profile.avatar.url
            elif hasattr(user, 'avatar') and user.avatar:
                avatar_url = user.avatar.url
            
            results['users'].append({
                'id': str(user.id),
                'username': user.username,
                'display_name': (profile.display_name if profile else None) or user.username,
                'avatar': avatar_url
            })
        except (User.DoesNotExist, ValueError):
            # Поиск по username
            users = User.objects.filter(username__icontains=query)[:10]
            user_profiles = {p.user_id: p for p in UserProfile.objects.filter(user__in=users)}
            results['users'] = []
            for user in users:
                profile = user_profiles.get(user.id)
                avatar_url = None
                if profile and profile.avatar:
                    avatar_url = profile.avatar.url
                elif hasattr(user, 'avatar') and user.avatar:
                    avatar_url = user.avatar.url
                
                results['users'].append({
                    'id': str(user.id),
                    'username': user.username,
                    'display_name': (profile.display_name if profile else None) or user.username,
                    'avatar': avatar_url
                })
    except Exception as e:
        print(f'Error searching users: {e}')
    
    # Поиск чатов по ID
    try:
        try:
            room = ChatRoom.objects.get(id=query, members__user=request.user, is_active=True)
            serializer = ChatRoomSerializer(room, context={'request': request})
            results['rooms'] = [serializer.data]
        except (ChatRoom.DoesNotExist, ValueError):
            # Поиск по частичному совпадению имени
            rooms = ChatRoom.objects.filter(
                members__user=request.user,
                is_active=True
            ).filter(Q(name__icontains=query))[:10]
            serializer = ChatRoomSerializer(rooms, many=True, context={'request': request})
            results['rooms'] = serializer.data
    except Exception as e:
        print(f'Error searching rooms: {e}')
    
    return Response(results)


# User Settings API
@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def user_settings_view(request):
    """Получить или обновить настройки пользователя"""
    from .models import UserSettings
    from .serializers import UserSettingsSerializer
    
    settings, created = UserSettings.objects.get_or_create(user=request.user)
    
    if request.method == 'GET':
        serializer = UserSettingsSerializer(settings)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = UserSettingsSerializer(settings, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# Marketplace API
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def marketplace_items_view(request):
    """Получить список товаров маркетплейса"""
    item_type = request.query_params.get('type')
    queryset = MarketplaceItem.objects.filter(is_active=True)
    
    if item_type:
        queryset = queryset.filter(item_type=item_type)
    
    serializer = MarketplaceItemSerializer(queryset, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def marketplace_item_detail_view(request, item_id):
    """Получить детали товара"""
    try:
        item = MarketplaceItem.objects.get(id=item_id, is_active=True)
    except MarketplaceItem.DoesNotExist:
        return Response(
            {'error': 'Товар не найден'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    serializer = MarketplaceItemSerializer(item, context={'request': request})
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def purchase_marketplace_item_view(request, item_id):
    """Купить товар на маркетплейсе"""
    try:
        item = MarketplaceItem.objects.get(id=item_id, is_active=True)
    except MarketplaceItem.DoesNotExist:
        return Response(
            {'error': 'Товар не найден'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Проверяем, не куплен ли уже товар
    if Purchase.objects.filter(user=request.user, item=item).exists():
        return Response(
            {'error': 'Товар уже куплен'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Получаем или создаем валюту пользователя
    currency, _ = Currency.objects.get_or_create(user=request.user)
    
    # Проверяем баланс
    if currency.balance < item.price:
        return Response(
            {'error': 'Недостаточно средств'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Создаем покупку
    purchase = Purchase.objects.create(
        user=request.user,
        item=item,
        price_paid=item.price
    )
    
    # Списываем валюту
    currency.balance -= item.price
    currency.total_spent += item.price
    currency.save()
    
    # Создаем транзакцию
    Transaction.objects.create(
        user=request.user,
        amount=int(item.price),
        transaction_type='spend',
        description=f'Покупка: {item.name}'
    )
    
    # Обновляем статистику товара
    item.purchases_count += 1
    item.save()
    
    serializer = PurchaseSerializer(purchase)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_marketplace_item_view(request):
    """Загрузить товар на маркетплейс"""
    name = request.data.get('name')
    item_type = request.data.get('item_type', 'template')
    price = request.data.get('price', 0)
    description = request.data.get('description', '')
    
    if not name:
        return Response(
            {'error': 'Название товара обязательно'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    item = MarketplaceItem.objects.create(
        name=name,
        item_type=item_type,
        creator=request.user,
        price=price,
        description=description,
        file=request.FILES.get('file'),
        preview_image=request.FILES.get('preview_image')
    )
    
    serializer = MarketplaceItemSerializer(item, context={'request': request})
    return Response(serializer.data, status=status.HTTP_201_CREATED)


# Currency API
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def currency_balance_view(request):
    """Получить баланс валюты"""
    currency, _ = Currency.objects.get_or_create(user=request.user)
    serializer = CurrencySerializer(currency)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def currency_transactions_view(request):
    """Получить историю транзакций"""
    transactions = Transaction.objects.filter(user=request.user)[:50]
    serializer = TransactionSerializer(transactions, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def earn_currency_view(request):
    """Начислить валюту (при входе, выполнении заданий)"""
    amount = request.data.get('amount', 0)
    description = request.data.get('description', 'Начисление валюты')
    
    if amount <= 0:
        return Response(
            {'error': 'Сумма должна быть положительной'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    currency, _ = Currency.objects.get_or_create(user=request.user)
    currency.balance += amount
    currency.total_earned += amount
    currency.save()
    
    Transaction.objects.create(
        user=request.user,
        amount=amount,
        transaction_type='earn',
        description=description
    )
    
    serializer = CurrencySerializer(currency)
    return Response(serializer.data)


# Daily Tasks API
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def daily_tasks_view(request):
    """Получить список заданий"""
    task_type = request.query_params.get('type', 'daily')
    tasks = DailyTask.objects.filter(is_active=True, task_type=task_type)
    serializer = DailyTaskSerializer(tasks, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def complete_task_view(request, task_id):
    """Выполнить задание"""
    try:
        task = DailyTask.objects.get(id=task_id, is_active=True)
    except DailyTask.DoesNotExist:
        return Response(
            {'error': 'Задание не найдено'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Проверяем, не выполнено ли уже сегодня
    from django.utils import timezone
    today = timezone.now().date()
    if TaskCompletion.objects.filter(user=request.user, task=task, completed_at__date=today).exists():
        return Response(
            {'error': 'Задание уже выполнено сегодня'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Создаем выполнение задания
    completion = TaskCompletion.objects.create(
        user=request.user,
        task=task,
        reward_earned=task.reward
    )
    
    # Начисляем валюту
    currency, _ = Currency.objects.get_or_create(user=request.user)
    currency.balance += task.reward
    currency.total_earned += task.reward
    currency.save()
    
    # Создаем транзакцию
    Transaction.objects.create(
        user=request.user,
        amount=task.reward,
        transaction_type='earn',
        description=f'Выполнение задания: {task.title}'
    )
    
    serializer = TaskCompletionSerializer(completion)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


# Fireflies API
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def fireflies_view(request):
    """Получить "огоньки" пользователя"""
    fireflies = Firefly.objects.filter(receiver=request.user)[:50]
    serializer = FireflySerializer(fireflies, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_firefly_view(request):
    """Отправить "огонек" другу"""
    receiver_id = request.data.get('receiver_id')
    note_id = request.data.get('note_id')
    message = request.data.get('message', '')
    
    if not receiver_id:
        return Response(
            {'error': 'ID получателя обязателен'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        receiver = User.objects.get(id=receiver_id)
    except User.DoesNotExist:
        return Response(
            {'error': 'Получатель не найден'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    note = None
    if note_id:
        try:
            note = Note.objects.get(id=note_id, user=receiver)
        except Note.DoesNotExist:
            pass
    
    firefly = Firefly.objects.create(
        sender=request.user,
        receiver=receiver,
        note=note,
        message=message
    )
    
    # Обновляем статистику получателя
    stats, _ = UserStatistics.objects.get_or_create(user=receiver)
    stats.fireflies_count += 1
    stats.save()
    
    serializer = FireflySerializer(firefly)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_streak_view(request, user_id):
    """Получить стрик пользователя"""
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response(
            {'error': 'Пользователь не найден'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    stats, _ = UserStatistics.objects.get_or_create(user=user)
    return Response({
        'streak_days': stats.streak_days,
        'longest_streak': stats.longest_streak,
        'last_activity_date': stats.last_activity_date,
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def check_streak_view(request):
    """Проверить и обновить стрик"""
    from django.utils import timezone
    from datetime import timedelta
    
    stats, _ = UserStatistics.objects.get_or_create(user=request.user)
    today = timezone.now().date()
    
    if stats.last_activity_date:
        days_diff = (today - stats.last_activity_date).days
        
        if days_diff == 1:
            # Продолжаем стрик
            stats.streak_days += 1
        elif days_diff > 1:
            # Стрик прерван
            if stats.streak_days > stats.longest_streak:
                stats.longest_streak = stats.streak_days
            stats.streak_days = 1
        # Если days_diff == 0, стрик уже обновлен сегодня
    else:
        # Первая активность
        stats.streak_days = 1
    
    stats.last_activity_date = today
    stats.save()
    
    return Response({
        'streak_days': stats.streak_days,
        'longest_streak': stats.longest_streak,
    })
