import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from .models import ChatRoom, ChatMember, ChatMessage

User = get_user_model()


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_id = self.scope['url_route']['kwargs']['room_id']
        self.room_group_name = f'chat_{self.room_id}'
        self.user = self.scope['user']

        # Проверяем, что пользователь аутентифицирован
        if not self.user.is_authenticated:
            await self.close()
            return

        # Проверяем, что пользователь является участником комнаты
        is_member = await self.is_room_member(self.room_id, self.user)
        if not is_member:
            await self.close()
            return

        # Присоединяемся к группе комнаты
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

        # Отправляем информацию о подключении
        await self.send(text_data=json.dumps({
            'type': 'connection_established',
            'message': 'Подключено к чату'
        }))

    async def disconnect(self, close_code):
        # Покидаем группу комнаты
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            message_type = data.get('type', 'message')

            if message_type == 'message':
                content = data.get('content', '')
                note_id = data.get('note_id')
                file_data = data.get('file_data')

                # Создаем сообщение
                message = await self.create_message(
                    self.room_id,
                    self.user,
                    content,
                    note_id=note_id,
                    file_data=file_data
                )

                # Отправляем сообщение в группу
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'chat_message',
                        'message': message
                    }
                )
            elif message_type == 'typing':
                # Отправляем информацию о наборе текста
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'typing_indicator',
                        'user': self.user.username,
                        'user_id': self.user.id,
                    }
                )
            elif message_type == 'read':
                # Обновляем время последнего прочитанного сообщения
                await self.mark_as_read(self.room_id, self.user)

        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Неверный формат данных'
            }))

    async def chat_message(self, event):
        """Отправка сообщения всем участникам комнаты"""
        message = event['message']
        await self.send(text_data=json.dumps({
            'type': 'message',
            'message': message
        }))

    async def typing_indicator(self, event):
        """Отправка индикатора набора текста"""
        await self.send(text_data=json.dumps({
            'type': 'typing',
            'user': event['user'],
            'user_id': event['user_id'],
        }))

    @database_sync_to_async
    def is_room_member(self, room_id, user):
        """Проверка, является ли пользователь участником комнаты"""
        try:
            room = ChatRoom.objects.get(id=room_id)
            return ChatMember.objects.filter(room=room, user=user).exists()
        except ChatRoom.DoesNotExist:
            return False

    @database_sync_to_async
    def create_message(self, room_id, user, content, note_id=None, file_data=None):
        """Создание сообщения в базе данных"""
        try:
            room = ChatRoom.objects.get(id=room_id)
            message = ChatMessage.objects.create(
                room=room,
                sender=user,
                content=content,
                message_type='note' if note_id else 'text'
            )
            if note_id:
                from .models import Note
                try:
                    note = Note.objects.get(id=note_id, user=user)
                    message.note = note
                    message.save()
                except Note.DoesNotExist:
                    pass

            # Обновляем время последнего обновления комнаты
            room.save(update_fields=['updated_at'])

            return {
                'id': message.id,
                'room_id': room_id,
                'sender': {
                    'id': user.id,
                    'username': user.username,
                },
                'content': content,
                'message_type': message.message_type,
                'note_id': note_id,
                'created_at': message.created_at.isoformat(),
            }
        except ChatRoom.DoesNotExist:
            return None

    @database_sync_to_async
    def mark_as_read(self, room_id, user):
        """Отметить сообщения как прочитанные"""
        from django.utils import timezone
        try:
            room = ChatRoom.objects.get(id=room_id)
            member = ChatMember.objects.get(room=room, user=user)
            member.last_read_at = timezone.now()
            member.save(update_fields=['last_read_at'])
        except (ChatRoom.DoesNotExist, ChatMember.DoesNotExist):
            pass
