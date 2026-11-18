from urllib.parse import quote

from django.conf import settings


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