from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.html import format_html
from .models import (
    User, Folder, Tag, NoteTemplate, Note,
    UserStatistics, TypingSession, UserRating,
    UserProfile, Follow, UserSettings,
    ChatRoom, ChatMember, ChatMessage,
    MarketplaceItem, Purchase,
    Currency, DailyTask, TaskCompletion, Transaction,
    Firefly
)

# Настройка админ-панели
admin.site.site_header = "BlocknotPRO - Админ-панель"
admin.site.site_title = "BlocknotPRO Admin"
admin.site.index_title = "Управление системой заметок"


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ['uuid', 'username', 'email', 'created_at']
    list_filter = ['created_at']
    search_fields = ['username', 'email', 'uuid']
    readonly_fields = ['uuid']
    
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'email')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
        ('UUID', {'fields': ('uuid',)}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'password1', 'password2'),
        }),
    )


@admin.register(Folder)
class FolderAdmin(admin.ModelAdmin):
    list_display = ['uuid', 'name', 'user', 'parent', 'color', 'created_at']
    list_filter = ['user', 'created_at']
    search_fields = ['name', 'uuid']
    readonly_fields = ['uuid']


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ['uuid', 'name', 'user', 'color', 'created_at']
    list_filter = ['user', 'created_at']
    search_fields = ['name', 'uuid']
    readonly_fields = ['uuid']


@admin.register(NoteTemplate)
class NoteTemplateAdmin(admin.ModelAdmin):
    list_display = ['uuid', 'name', 'is_default', 'created_at']
    list_filter = ['is_default', 'created_at']
    search_fields = ['name', 'description', 'uuid']
    readonly_fields = ['uuid']


@admin.register(Note)
class NoteAdmin(admin.ModelAdmin):
    list_display = ['uuid', 'title', 'user', 'folder', 'is_pinned', 'is_archived', 'updated_at']
    list_filter = ['is_pinned', 'is_archived', 'created_at', 'updated_at']
    search_fields = ['title', 'content', 'uuid']
    filter_horizontal = ['tags']
    readonly_fields = ['uuid']


@admin.register(UserStatistics)
class UserStatisticsAdmin(admin.ModelAdmin):
    list_display = ['uuid', 'user', 'total_notes', 'streak_days', 'level', 'rating_score', 'last_active']
    list_filter = ['level']
    search_fields = ['user__username', 'uuid']
    readonly_fields = ['uuid']


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['uuid', 'user', 'display_name', 'is_public', 'created_at']
    list_filter = ['is_public', 'created_at']
    search_fields = ['user__username', 'display_name', 'uuid']
    readonly_fields = ['uuid']


@admin.register(UserSettings)
class UserSettingsAdmin(admin.ModelAdmin):
    list_display = ['uuid', 'user', 'profile_visibility', 'default_note_visibility']
    list_filter = ['profile_visibility', 'default_note_visibility']
    search_fields = ['user__username', 'uuid']
    readonly_fields = ['uuid']


@admin.register(MarketplaceItem)
class MarketplaceItemAdmin(admin.ModelAdmin):
    list_display = ['uuid', 'name', 'item_type', 'creator', 'price', 'purchases_count', 'rating', 'is_active']
    list_filter = ['item_type', 'is_active', 'created_at']
    search_fields = ['name', 'description', 'uuid']
    readonly_fields = ['uuid']


@admin.register(Currency)
class CurrencyAdmin(admin.ModelAdmin):
    list_display = ['uuid', 'user', 'balance', 'total_earned', 'total_spent']
    search_fields = ['user__username', 'uuid']
    readonly_fields = ['uuid']


@admin.register(DailyTask)
class DailyTaskAdmin(admin.ModelAdmin):
    list_display = ['uuid', 'title', 'task_type', 'reward', 'is_active']
    list_filter = ['task_type', 'is_active']
    search_fields = ['title', 'description', 'uuid']
    readonly_fields = ['uuid']


@admin.register(Firefly)
class FireflyAdmin(admin.ModelAdmin):
    list_display = ['uuid', 'sender', 'receiver', 'created_at']
    list_filter = ['created_at']
    search_fields = ['sender__username', 'receiver__username', 'uuid']
    readonly_fields = ['uuid']


@admin.register(Follow)
class FollowAdmin(admin.ModelAdmin):
    list_display = ['uuid', 'follower', 'following', 'created_at']
    list_filter = ['created_at']
    search_fields = ['follower__username', 'following__username', 'uuid']
    readonly_fields = ['uuid']


@admin.register(TypingSession)
class TypingSessionAdmin(admin.ModelAdmin):
    list_display = ['uuid', 'user', 'note', 'start_time', 'end_time', 'typing_speed_wpm']
    list_filter = ['start_time']
    search_fields = ['user__username', 'uuid']
    readonly_fields = ['uuid']


@admin.register(UserRating)
class UserRatingAdmin(admin.ModelAdmin):
    list_display = ['uuid', 'user', 'rating', 'rank', 'last_calculated']
    list_filter = ['rank']
    search_fields = ['user__username', 'uuid']
    readonly_fields = ['uuid']


@admin.register(ChatRoom)
class ChatRoomAdmin(admin.ModelAdmin):
    list_display = ['uuid', 'name', 'room_type', 'created_by', 'created_at', 'is_active']
    list_filter = ['room_type', 'is_active', 'created_at']
    search_fields = ['name', 'uuid']
    readonly_fields = ['uuid']


@admin.register(ChatMember)
class ChatMemberAdmin(admin.ModelAdmin):
    list_display = ['uuid', 'room', 'user', 'joined_at', 'is_muted', 'is_admin', 'is_favorite']
    list_filter = ['is_muted', 'is_admin', 'is_favorite', 'joined_at']
    search_fields = ['user__username', 'room__name', 'uuid']
    readonly_fields = ['uuid']


@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ['uuid', 'room', 'sender', 'message_type', 'created_at', 'is_edited', 'is_deleted']
    list_filter = ['message_type', 'is_edited', 'is_deleted', 'created_at']
    search_fields = ['content', 'sender__username', 'uuid']
    readonly_fields = ['uuid']


@admin.register(Purchase)
class PurchaseAdmin(admin.ModelAdmin):
    list_display = ['uuid', 'user', 'item', 'price_paid', 'purchased_at']
    list_filter = ['purchased_at']
    search_fields = ['user__username', 'item__name', 'uuid']
    readonly_fields = ['uuid']


@admin.register(TaskCompletion)
class TaskCompletionAdmin(admin.ModelAdmin):
    list_display = ['uuid', 'user', 'task', 'reward_earned', 'completed_at']
    list_filter = ['completed_at']
    search_fields = ['user__username', 'task__title', 'uuid']
    readonly_fields = ['uuid']


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ['uuid', 'user', 'amount', 'transaction_type', 'created_at']
    list_filter = ['transaction_type', 'created_at']
    search_fields = ['user__username', 'description', 'uuid']
    readonly_fields = ['uuid']









