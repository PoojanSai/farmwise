from django.apps import AppConfig
import logging

logger = logging.getLogger(__name__)


class CropsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.crops'

    def ready(self):
        """
        Pre-train / load the Random Forest model when Django starts.
        This avoids a cold-start delay on the first API request.
        """
        try:
            from .ml_engine import get_model
            model = get_model()
            logger.info(
                f"[FarmWise] ML crop model loaded successfully "
                f"({len(model.classes_)} crop classes)."
            )
        except Exception as exc:
            logger.warning(f"[FarmWise] ML model preload failed: {exc}")
