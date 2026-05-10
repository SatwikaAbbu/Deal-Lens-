import os
import logging
from email.message import EmailMessage
import aiosmtplib

logger = logging.getLogger(__name__)

async def send_investor_acknowledgement(founder_email: str, startup_name: str):
    """
    Sends an automated, professional investor acknowledgement email to the founder.
    """
    smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_user = os.getenv("SMTP_USER")
    smtp_password = os.getenv("SMTP_PASSWORD")
    investor_name = os.getenv("INVESTOR_NAME", "Investor")

    if not all([smtp_user, smtp_password, founder_email]):
        logger.warning(f"[email] Missing SMTP credentials or founder email. Skipping email for {startup_name}.")
        return False

    message = EmailMessage()
    message["From"] = f"{investor_name} <{smtp_user}>"
    message["To"] = founder_email
    message["Subject"] = f"{investor_name} | Receipt of Pitch Deck - {startup_name}"

    body = f"""Hi Founder,

Thank you for sharing the pitch deck for {startup_name}. I've received it and added it to my review pipeline.

My team (and our internal analysis system) is currently looking over the materials. We prioritize high-alignment deals, and if there's a strong fit with my current investment thesis, you’ll hear back from me regarding next steps.

In the meantime, no further action is needed on your part.

Best,
{investor_name}
"""
    message.set_content(body)

    try:
        logger.info(f"[email] Sending acknowledgement email to {founder_email} for {startup_name}...")
        await aiosmtplib.send(
            message,
            hostname=smtp_server,
            port=smtp_port,
            start_tls=True,
            username=smtp_user,
            password=smtp_password,
        )
        logger.info(f"[email] ✅ Email sent successfully to {founder_email}")
        return True
    except Exception as e:
        logger.error(f"[email] ❌ Failed to send email to {founder_email}: {e}")
        return False


async def send_meeting_invite(founder_email: str, startup_name: str):
    """
    Sends a professional meeting request email from the investor to the founder.
    """
    smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_user = os.getenv("SMTP_USER")
    smtp_password = os.getenv("SMTP_PASSWORD")
    investor_name = os.getenv("INVESTOR_NAME", "Investor")

    if not all([smtp_user, smtp_password, founder_email]):
        logger.warning(f"[email] Missing SMTP credentials or founder email. Cannot send meeting invite.")
        return False

    message = EmailMessage()
    message["From"] = f"{investor_name} <{smtp_user}>"
    message["To"] = founder_email
    message["Subject"] = f"{investor_name} | Meeting Request - {startup_name}"

    body = f"""Hi,

I've had the chance to review the pitch deck for {startup_name}, and I'd love to schedule a brief conversation to learn more about your vision and explore how we might work together.

Would you be available for a 30-minute call sometime this week or next? Please feel free to suggest a few time slots that work for you, and I'll do my best to accommodate.

Looking forward to connecting.

Best,
{investor_name}
"""
    message.set_content(body)

    try:
        logger.info(f"[email] Sending meeting invite to {founder_email} for {startup_name}...")
        await aiosmtplib.send(
            message,
            hostname=smtp_server,
            port=smtp_port,
            start_tls=True,
            username=smtp_user,
            password=smtp_password,
        )
        logger.info(f"[email] ✅ Meeting invite sent successfully to {founder_email}")
        return True
    except Exception as e:
        logger.error(f"[email] ❌ Failed to send meeting invite to {founder_email}: {e}")
        return False
