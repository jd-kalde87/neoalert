from application.interfaces.emailservice import EmailService
from core.config import Settings
from infrastructure.email.consoleemailadapter import ConsoleEmailAdapter
from infrastructure.email.smtpemailadapter import SmtpEmailAdapter


def build_email_service(settings: Settings) -> EmailService:
    if settings.email_adapter == "smtp":
        return SmtpEmailAdapter(settings)
    return ConsoleEmailAdapter(settings)
