import os
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from dotenv import load_dotenv

load_dotenv()

SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY")
SENDGRID_FROM_EMAIL = os.getenv("SENDGRID_FROM_EMAIL")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")


def send_verification_email(to_email: str, username: str, token: str):
    verification_link = f"{FRONTEND_URL}/verify-email?token={token}"

    message = Mail(
        from_email=SENDGRID_FROM_EMAIL,
        to_emails=to_email,
        subject="Verify your Price Optimization Tool account",
        html_content=f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #00D4AA;">Price Optimization Tool</h2>
            <p>Hi <strong>{username}</strong>,</p>
            <p>Thanks for registering! Please verify your email address by clicking the button below:</p>
            <a href="{verification_link}"
               style="display: inline-block; padding: 12px 24px;
                      background-color: #00D4AA; color: #000;
                      text-decoration: none; border-radius: 6px;
                      font-weight: bold; margin: 16px 0;">
               Verify Email
            </a>
            <p>Or copy this link: <a href="{verification_link}">{verification_link}</a></p>
            <p>This link expires in <strong>24 hours</strong>.</p>
            <p style="color: #aaa; font-size: 12px;">
               If you didn't register, ignore this email.
            </p>
        </div>
        """
    )

    try:
        sg = SendGridAPIClient(SENDGRID_API_KEY)
        sg.send(message)
        print(f"Verification email sent to {to_email}")
    except Exception as e:
        print(f"Email send failed: {e}")
        raise