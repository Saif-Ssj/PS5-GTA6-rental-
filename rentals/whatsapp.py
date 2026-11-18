import logging
from urllib.parse import quote

import requests
from django.conf import settings

logger = logging.getLogger(__name__)


def wa_link(number, text):
    """A link that opens WhatsApp with a chat to `number` and `text` already typed."""
    number = number.replace("+", "").replace(" ", "")
    return f"https://wa.me/{number}?text={quote(text)}"


def booking_summary(booking):
    """The booking details as a few lines of text."""
    extras = []
    if booking.extra_controller:
        extras.append("+1 controller")
    if booking.extra_screen:
        extras.append("+1 screen")

    return (
        f"Booking #{booking.id}\n"
        f"Dates: {booking.start_date:%a %d %b} → {booking.end_date:%a %d %b %Y}\n"
        f"Extras: {', '.join(extras) or 'none'}\n"
        f"Price: {booking.total_price} €\n"
        f"Name: {booking.name}\n"
        f"StuSta: {booking.residence}"
    )


def customer_to_owner_link(booking):
    """Link for the customer: opens a chat with the owner, booking already written out."""
    text = "Hi! I just sent a PS5 rental request 🎮\n\n" + booking_summary(booking)
    return wa_link(settings.OWNER_WHATSAPP, text)


def notify_owner(booking):
    """Send the owner an automatic WhatsApp about a new request (via CallMeBot).
    Never crashes: if it fails, the booking is still saved and the error is logged."""
    if not settings.CALLMEBOT_APIKEY or not settings.OWNER_WHATSAPP:
        logger.warning("CallMeBot not configured, skipping owner alert.")
        return

    text = (
        "🎮 NEW PS5 REQUEST\n\n"
        + booking_summary(booking)
        + f"\nWhatsApp: +{booking.phone.lstrip('+')}"
    )

    try:
        response = requests.get(
            "https://api.callmebot.com/whatsapp.php",
            params={
                "phone": settings.OWNER_WHATSAPP,
                "text": text,
                "apikey": settings.CALLMEBOT_APIKEY,
            },
            timeout=10,
        )
        response.raise_for_status()
    except requests.RequestException as error:
        logger.error("Owner WhatsApp alert failed: %s", error)