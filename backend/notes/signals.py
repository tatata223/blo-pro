"""
Сигналы Django для автоматического начисления валюты
"""
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.utils import timezone
from datetime import timedelta
from .models import (
    User, Note, Currency, Transaction, UserStatistics,
    DailyTask, TaskCompletion
)


@receiver(post_save, sender=Note)
def on_note_created(sender, instance, created, **kwargs):
    """Начисление валюты при создании заметки"""
    if created:
        currency, _ = Currency.objects.get_or_create(user=instance.user)
        reward = 10  # 10 монет за создание заметки
        currency.balance += reward
        currency.total_earned += reward
        currency.save()
        
        Transaction.objects.create(
            user=instance.user,
            amount=reward,
            transaction_type='earn',
            description='Создание заметки'
        )
        
        # Обновляем статистику
        stats, _ = UserStatistics.objects.get_or_create(user=instance.user)
        stats.total_notes += 1
        stats.save()


# Начисление валюты при входе обрабатывается через API endpoint earn_currency_view
# Сигнал post_save на User не подходит для отслеживания входа


@receiver(post_save, sender=TaskCompletion)
def on_task_completed(sender, instance, created, **kwargs):
    """Начисление валюты при выполнении задания (уже обработано в API)"""
    # Валюта уже начисляется в API, здесь можно добавить дополнительную логику
    pass
