from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import (
    Folder, Tag, NoteTemplate, Note, ChatRoom, ChatMember, ChatMessage, UserSettings,
    MarketplaceItem, Purchase, Currency, DailyTask, TaskCompletion, Transaction, Firefly
)

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'avatar']
        read_only_fields = ['id']


class FolderSerializer(serializers.ModelSerializer):
    notes_count = serializers.SerializerMethodField()
    children_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Folder
        fields = [
            'id', 'name', 'color', 'parent', 'folder_type', 'is_favorite', 
            'smart_rules', 'notes_count', 'children_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_notes_count(self, obj):
        return obj.get_notes_count()
    
    def get_children_count(self, obj):
        return obj.children.count()


class TagSerializer(serializers.ModelSerializer):
    notes_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Tag
        fields = [
            'id', 'name', 'color', 'notes_count', 'usage_count', 
            'is_auto', 'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'usage_count']
    
    def get_notes_count(self, obj):
        return obj.get_notes_count()


class NoteTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = NoteTemplate
        fields = [
            'id', 'name', 'category', 'description', 'icon_svg', 'content', 
            'template_data', 'tags', 'is_default', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class NoteSerializer(serializers.ModelSerializer):
    tags = TagSerializer(many=True, read_only=True)
    tag_ids = serializers.PrimaryKeyRelatedField(
        many=True, 
        queryset=Tag.objects.all(), 
        source='tags', 
        write_only=True,
        required=False
    )
    folder_name = serializers.CharField(source='folder.name', read_only=True)
    attachment = serializers.SerializerMethodField()
    
    class Meta:
        model = Note
        fields = [
            'id', 'title', 'content', 'folder', 'folder_name', 
            'tags', 'tag_ids', 'template', 'is_pinned', 'is_archived',
            'attachment', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_attachment(self, obj):
        if obj.attachment:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.attachment.url)
            return obj.attachment.url
        return None
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        tags = validated_data.pop('tags', [])
        note = Note.objects.create(**validated_data)
        if tags:
            note.tags.set(tags)
        return note
    
    def update(self, instance, validated_data):
        tags = validated_data.pop('tags', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if tags is not None:
            instance.tags.set(tags)
        return instance


class ChatRoomSerializer(serializers.ModelSerializer):
    members_count = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()
    display_name = serializers.SerializerMethodField()
    is_favorite = serializers.SerializerMethodField()
    
    class Meta:
        model = ChatRoom
        fields = [
            'id', 'name', 'room_type', 'created_by', 'created_at', 
            'updated_at', 'is_active', 'members_count', 'unread_count',
            'last_message', 'display_name', 'is_favorite'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by']
    
    def get_members_count(self, obj):
        return obj.members.count()
    
    def get_unread_count(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            member = obj.members.filter(user=request.user).first()
            if member and member.last_read_at:
                return obj.messages.filter(created_at__gt=member.last_read_at).count()
            return obj.messages.count()
        return 0
    
    def get_last_message(self, obj):
        last_msg = obj.messages.filter(is_deleted=False).last()
        if last_msg:
            return {
                'id': last_msg.id,
                'content': last_msg.content[:100],
                'sender': last_msg.sender.username,
                'created_at': last_msg.created_at.isoformat(),
            }
        return None
    
    def get_display_name(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.get_display_name(request.user)
        return obj.name or f'Чат #{obj.id}'
    
    def get_is_favorite(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            member = obj.members.filter(user=request.user).first()
            return member.is_favorite if member else False
        return False


class ChatMemberSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = ChatMember
        fields = ['id', 'user', 'joined_at', 'last_read_at', 'is_muted', 'is_admin', 'is_favorite']
        read_only_fields = ['id', 'joined_at']


class ChatMessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    note = serializers.SerializerMethodField()
    file = serializers.SerializerMethodField()
    file_name = serializers.SerializerMethodField()
    
    class Meta:
        model = ChatMessage
        fields = [
            'id', 'room', 'sender', 'content', 'message_type', 
            'note', 'file', 'file_name', 'is_edited', 'is_deleted', 
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'sender']
    
    def get_note(self, obj):
        if obj.note:
            return {
                'id': obj.note.id,
                'title': obj.note.title,
            }
        return None
    
    def get_file(self, obj):
        if obj.file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.file.url)
            return obj.file.url
        return None
    
    def get_file_name(self, obj):
        if obj.file:
            return obj.file.name.split('/')[-1]
        return None


class UserSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserSettings
        fields = [
            'profile_visibility', 'show_email', 'show_statistics', 'allow_follow_requests',
            'default_note_visibility', 'auto_save_enabled', 'auto_save_interval',
            'email_notifications', 'push_notifications', 'notify_on_follow', 'notify_on_message',
            'two_factor_enabled', 'session_timeout'
        ]
        read_only_fields = []


class MarketplaceItemSerializer(serializers.ModelSerializer):
    creator = UserSerializer(read_only=True)
    is_purchased = serializers.SerializerMethodField()
    
    class Meta:
        model = MarketplaceItem
        fields = [
            'id', 'name', 'item_type', 'creator', 'price', 'file', 'preview_image',
            'description', 'purchases_count', 'rating', 'is_active', 'is_purchased',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'purchases_count', 'rating']
    
    def get_is_purchased(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Purchase.objects.filter(user=request.user, item=obj).exists()
        return False


class PurchaseSerializer(serializers.ModelSerializer):
    item = MarketplaceItemSerializer(read_only=True)
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Purchase
        fields = ['id', 'user', 'item', 'purchased_at', 'price_paid']
        read_only_fields = ['id', 'purchased_at']


class CurrencySerializer(serializers.ModelSerializer):
    class Meta:
        model = Currency
        fields = ['balance', 'total_earned', 'total_spent', 'updated_at']
        read_only_fields = ['balance', 'total_earned', 'total_spent', 'updated_at']


class DailyTaskSerializer(serializers.ModelSerializer):
    is_completed = serializers.SerializerMethodField()
    
    class Meta:
        model = DailyTask
        fields = [
            'id', 'title', 'description', 'reward', 'task_type', 'is_active',
            'is_completed', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
    
    def get_is_completed(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            from django.utils import timezone
            today = timezone.now().date()
            return TaskCompletion.objects.filter(
                user=request.user,
                task=obj,
                completed_at__date=today
            ).exists()
        return False


class TaskCompletionSerializer(serializers.ModelSerializer):
    task = DailyTaskSerializer(read_only=True)
    
    class Meta:
        model = TaskCompletion
        fields = ['id', 'task', 'completed_at', 'reward_earned']
        read_only_fields = ['id', 'completed_at', 'reward_earned']


class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = ['id', 'amount', 'transaction_type', 'description', 'created_at']
        read_only_fields = ['id', 'created_at']


class FireflySerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    receiver = UserSerializer(read_only=True)
    note = serializers.SerializerMethodField()
    
    class Meta:
        model = Firefly
        fields = ['id', 'sender', 'receiver', 'note', 'message', 'created_at']
        read_only_fields = ['id', 'created_at']
    
    def get_note(self, obj):
        if obj.note:
            return {
                'id': obj.note.id,
                'title': obj.note.title,
            }
        return None

