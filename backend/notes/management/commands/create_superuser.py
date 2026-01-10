from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()


class Command(BaseCommand):
    help = 'Создает суперпользователя admin с паролем admin123'

    def handle(self, *args, **options):
        username = 'admin'
        email = 'admin@example.com'
        password = 'admin123'

        if User.objects.filter(username=username).exists():
            # Обновляем пароль если пользователь существует
            user = User.objects.get(username=username)
            user.set_password(password)
            user.is_superuser = True
            user.is_staff = True
            user.save()
            self.stdout.write(
                self.style.SUCCESS(f'Пароль суперпользователя {username} обновлен!')
            )
        else:
            User.objects.create_superuser(username, email, password)
            self.stdout.write(
                self.style.SUCCESS(f'Суперпользователь {username} успешно создан!')
            )
        
        self.stdout.write(
            self.style.SUCCESS(f'Логин: {username}')
        )
        self.stdout.write(
            self.style.SUCCESS(f'Пароль: {password}')
        )

