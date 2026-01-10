"""
Сервис для шифрования заметок
Использует AES-256 для шифрования данных
"""
import base64
import os
from django.conf import settings

# Опциональный импорт cryptography
try:
    from cryptography.fernet import Fernet
    from cryptography.hazmat.primitives import hashes
    from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
    from cryptography.hazmat.backends import default_backend
    CRYPTOGRAPHY_AVAILABLE = True
except ImportError:
    CRYPTOGRAPHY_AVAILABLE = False
    Fernet = None


class EncryptionService:
    """Сервис для шифрования и расшифровки заметок"""
    
    @staticmethod
    def generate_key_from_password(password: str, salt: bytes = None) -> bytes:
        """
        Генерирует ключ шифрования из пароля пользователя
        Использует PBKDF2 для создания ключа из пароля
        """
        if not CRYPTOGRAPHY_AVAILABLE:
            raise ImportError('Модуль cryptography не установлен. Установите: pip install cryptography')
        
        if salt is None:
            salt = os.urandom(16)
        
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=salt,
            iterations=100000,
            backend=default_backend()
        )
        key = base64.urlsafe_b64encode(kdf.derive(password.encode()))
        return key, salt
    
    @staticmethod
    def encrypt_content(content: str, password: str, salt: bytes = None) -> tuple:
        """
        Шифрует содержимое заметки
        Возвращает (encrypted_content, salt) в base64
        """
        if not CRYPTOGRAPHY_AVAILABLE:
            raise ImportError('Модуль cryptography не установлен. Установите: pip install cryptography')
        
        if not content:
            return '', None
        
        key, salt = EncryptionService.generate_key_from_password(password, salt)
        fernet = Fernet(key)
        encrypted_content = fernet.encrypt(content.encode())
        
        # Возвращаем в base64 для хранения в БД
        return base64.urlsafe_b64encode(encrypted_content).decode(), base64.urlsafe_b64encode(salt).decode()
    
    @staticmethod
    def decrypt_content(encrypted_content: str, password: str, salt: str) -> str:
        """
        Расшифровывает содержимое заметки
        Принимает encrypted_content и salt в base64
        """
        if not CRYPTOGRAPHY_AVAILABLE:
            raise ImportError('Модуль cryptography не установлен. Установите: pip install cryptography')
        
        if not encrypted_content:
            return ''
        
        try:
            salt_bytes = base64.urlsafe_b64decode(salt.encode())
            key, _ = EncryptionService.generate_key_from_password(password, salt_bytes)
            fernet = Fernet(key)
            
            encrypted_bytes = base64.urlsafe_b64decode(encrypted_content.encode())
            decrypted_content = fernet.decrypt(encrypted_bytes)
            
            return decrypted_content.decode()
        except Exception as e:
            raise ValueError(f'Ошибка расшифровки: {str(e)}')
    
    @staticmethod
    def hash_password(password: str) -> str:
        """
        Создает хеш пароля для проверки
        Использует SHA-256
        """
        from hashlib import sha256
        return sha256(password.encode()).hexdigest()
    
    @staticmethod
    def verify_password(password: str, password_hash: str) -> bool:
        """Проверяет правильность пароля"""
        return EncryptionService.hash_password(password) == password_hash
