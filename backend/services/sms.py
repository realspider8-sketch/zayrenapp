import os
import logging
import anyio
from twilio.rest import Client

logger = logging.getLogger(__name__)

class SMSService:
    @staticmethod
    async def send_otp(phone_number: str, code: str) -> bool:
        account_sid = os.getenv("TWILIO_ACCOUNT_SID")
        auth_token = os.getenv("TWILIO_AUTH_TOKEN")
        from_number = os.getenv("TWILIO_PHONE_NUMBER")

        if not account_sid or not auth_token or not from_number:
            logger.warning(f"SMS send request ignored: Twilio credentials not configured. Code is: {code}")
            return False

        # Normalize phone number (remove spaces)
        cleaned_phone = phone_number.replace(" ", "")
        
        # Verify it has country code, e.g. +234
        if not cleaned_phone.startswith("+"):
            logger.warning(f"Phone number {phone_number} does not start with country code (+). Twilio might reject it.")

        try:
            def _send_twilio_sms():
                client = Client(account_sid, auth_token)
                message = client.messages.create(
                    body=f"Your Zayren verification code is: {code}. It expires in 10 minutes.",
                    from_=from_number,
                    to=cleaned_phone
                )
                return message.sid

            sid = await anyio.to_thread.run_sync(_send_twilio_sms)
            logger.info(f"SMS sent successfully to {cleaned_phone}. Message SID: {sid}")
            return True
        except Exception as e:
            logger.error(f"Failed to send SMS to {cleaned_phone} via Twilio: {e}")
            return False
