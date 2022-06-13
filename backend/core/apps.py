from django.apps import AppConfig
from watson import search as watson


class CoreConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'core'

    def ready(self):
        Trail = self.get_model('Trail')
        Archive = self.get_model('Archive')
        RequestDocument = self.get_model('RequestDocument')
        ActivateDocument = self.get_model('ActivateDocument')

        watson.register(Trail, fields=('document',))
        watson.register(Archive, fields=('document',))
        watson.register(RequestDocument, fields=('document',))
        watson.register(ActivateDocument, fields=('document',))
