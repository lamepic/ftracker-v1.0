from django.contrib.auth.base_user import BaseUserManager


class UserManager(BaseUserManager):
    use_in_migrations = True

    def _create_user(self, staff_id, password, **extra_fields):
        """
        Creates and saves a User with the given email and password.
        """
        if not staff_id:
            raise ValueError('The given staff_id must be set')
        # email = self.normalize_email(email)
        user = self.model(staff_id=staff_id, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, staff_id, password=None, **extra_fields):
        extra_fields.setdefault('is_admin', False)
        return self._create_user(staff_id, password, **extra_fields)

    def create_superuser(self, staff_id, password, **extra_fields):
        # extra_fields.setdefault('is_admin', True)

        # if extra_fields.get('is_admin') is not True:
        #     raise ValueError('Superuser must have is_superuser=True.')

        user = self.create_user(
            staff_id,
            password=password,
        )
        user.is_admin = True
        user.save(using=self._db)
        return user
