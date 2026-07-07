# support.py
# Purpose: Customer support contact API router endpoint.
# Responsibilities:
#   - Receive support messages and dispatch them via SMTP to neurachat.support@gmail.com
#   - Fall back to simulated logging if SMTP parameters are missing

import os
import logging
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from pydantic import BaseModel, EmailStr
from fastapi import APIRouter, HTTPException, status

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/support")


class ContactInquiry(BaseModel):
    """Pydantic validation schema for contact inputs."""
    name: str
    email: EmailStr
    message: str


@router.post("/contact")
async def contact_support(payload: ContactInquiry):
    """
    Accept support inquiries and forward them via SMTP.
    Fallback to console logs if SMTP variables are not set in backend/.env.
    """
    logger.info(f"Support endpoint: Received request from {payload.email}")
    
    recipient = "neurachat.support@gmail.com"
    subject = f"CoFoundr Support: Message from {payload.name}"
    body = (
        f"You have received a new support inquiry from CoFoundr:\n\n"
        f"Name: {payload.name}\n"
        f"Sender Email: {payload.email}\n\n"
        f"Message:\n{payload.message}\n"
    )

    # Load SMTP settings
    smtp_host = os.getenv("SMTP_HOST")
    smtp_port = os.getenv("SMTP_PORT")
    smtp_user = os.getenv("SMTP_USER")
    smtp_password = os.getenv("SMTP_PASSWORD")

    if smtp_host and smtp_port and smtp_user and smtp_password:
        try:
            msg = MIMEMultipart()
            msg['From'] = smtp_user
            msg['To'] = recipient
            msg['Subject'] = subject
            msg.attach(MIMEText(body, 'plain'))

            server = smtplib.SMTP(smtp_host, int(smtp_port))
            server.starttls()
            server.login(smtp_user, smtp_password)
            server.sendmail(smtp_user, recipient, msg.as_string())
            server.quit()

            logger.info("Support endpoint: Email dispatched successfully via SMTP.")
            return {"status": "success", "message": "Inquiry sent successfully to support."}
        except Exception as e:
            logger.error(f"Support endpoint: SMTP dispatch failed: {e}")

    # Fallback to local development log simulation
    logger.warning("Support endpoint: SMTP parameters missing/failed. Simulating email transmission:")
    logger.warning("======================================================================")
    logger.warning(f"TO: {recipient}")
    logger.warning(f"SUBJECT: {subject}")
    logger.warning(f"MESSAGE BODY:\n{body}")
    logger.warning("======================================================================")

    return {
        "status": "simulated",
        "message": "Message received! (Support simulator mode: logged to console)."
    }
