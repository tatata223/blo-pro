from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    FolderViewSet, TagViewSet, NoteTemplateViewSet, NoteViewSet,
    login_view, logout_view, current_user_view, register_view,
    user_statistics_view, user_rating_view,
    typing_session_start_view, typing_session_end_view, typing_session_keystroke_view,
    user_profile_view, update_user_profile_view, user_public_notes_view,
    follow_user_view, user_followers_view, user_following_view,
    chat_rooms_view, create_chat_room_view, chat_room_detail_view,
    chat_messages_view, send_chat_message_view, mark_chat_read_view,
    toggle_chat_favorite_view, chat_search_view,
    user_settings_view,
    marketplace_items_view, marketplace_item_detail_view, purchase_marketplace_item_view,
    upload_marketplace_item_view,
    currency_balance_view, currency_transactions_view, earn_currency_view,
    daily_tasks_view, complete_task_view,
    fireflies_view, send_firefly_view, user_streak_view, check_streak_view
)

router = DefaultRouter()
router.register(r'folders', FolderViewSet, basename='folder')
router.register(r'tags', TagViewSet, basename='tag')
router.register(r'templates', NoteTemplateViewSet, basename='template')
router.register(r'notes', NoteViewSet, basename='note')

urlpatterns = [
    path('', include(router.urls)),
    path('auth/login/', login_view, name='login'),
    path('auth/logout/', logout_view, name='logout'),
    path('auth/user/', current_user_view, name='current-user'),
    path('auth/register/', register_view, name='register'),
    # Статистика
    path('users/statistics/', user_statistics_view, name='user-statistics'),
    path('users/rating/', user_rating_view, name='user-rating'),
    path('typing-sessions/start/', typing_session_start_view, name='typing-session-start'),
    path('typing-sessions/end/', typing_session_end_view, name='typing-session-end'),
    path('typing-sessions/keystroke/', typing_session_keystroke_view, name='typing-session-keystroke'),
    # Профиль пользователя
    path('users/<int:user_id>/profile/', user_profile_view, name='user-profile'),
    path('users/profile/', update_user_profile_view, name='update-profile'),
    path('users/<int:user_id>/notes/public/', user_public_notes_view, name='user-public-notes'),
    path('users/<int:user_id>/follow/', follow_user_view, name='follow-user'),
    path('users/<int:user_id>/followers/', user_followers_view, name='user-followers'),
    path('users/<int:user_id>/following/', user_following_view, name='user-following'),
    # Чат
    path('chat/rooms/', chat_rooms_view, name='chat-rooms'),
    path('chat/rooms/create/', create_chat_room_view, name='create-chat-room'),
    path('chat/search/', chat_search_view, name='chat-search'),
    path('chat/rooms/<int:room_id>/', chat_room_detail_view, name='chat-room-detail'),
    path('chat/rooms/<int:room_id>/messages/', chat_messages_view, name='chat-messages'),
    path('chat/rooms/<int:room_id>/send/', send_chat_message_view, name='send-chat-message'),
    path('chat/rooms/<int:room_id>/read/', mark_chat_read_view, name='mark-chat-read'),
    path('chat/rooms/<int:room_id>/toggle_favorite/', toggle_chat_favorite_view, name='toggle-chat-favorite'),
    # Настройки пользователя
    path('users/settings/', user_settings_view, name='user-settings'),
    # Маркетплейс
    path('marketplace/', marketplace_items_view, name='marketplace-items'),
    path('marketplace/<int:item_id>/', marketplace_item_detail_view, name='marketplace-item-detail'),
    path('marketplace/<int:item_id>/purchase/', purchase_marketplace_item_view, name='purchase-item'),
    path('marketplace/upload/', upload_marketplace_item_view, name='upload-item'),
    # Валюта
    path('currency/balance/', currency_balance_view, name='currency-balance'),
    path('currency/transactions/', currency_transactions_view, name='currency-transactions'),
    path('currency/earn/', earn_currency_view, name='earn-currency'),
    # Задания
    path('tasks/daily/', daily_tasks_view, name='daily-tasks'),
    path('tasks/<int:task_id>/complete/', complete_task_view, name='complete-task'),
    # Огоньки
    path('fireflies/', fireflies_view, name='fireflies'),
    path('fireflies/send/', send_firefly_view, name='send-firefly'),
    path('users/<int:user_id>/streak/', user_streak_view, name='user-streak'),
    path('users/check-streak/', check_streak_view, name='check-streak'),
]

