from celery import shared_task

from celery import Celery, states
from celery.exceptions import Ignore

from . import models


@shared_task(bind=True)
def expire_document(self, data):
    try:
        activated_document = models.ActivateDocument.objects.filter(
            id=int(data))
        if len(activated_document) > 0:
            activated_document = activated_document.first()
            activated_document.expired = True
            activated_document.save()
        else:
            self.update_state(state='FAILURE_len', meta={'exe': 'Not Found'})
    except:
        self.update_state(state='FAILURE_', meta={'exe': 'Not Found'})
        # raise Ignore()

    # self.update_state(state='SUCCESS', meta={'exe': 'completed'})
    return 'Done'
