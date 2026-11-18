from datetime import date, timedelta

from django.http import JsonResponse
from django.shortcuts import redirect, render

from .forms import ContactForm
from .models import Booking
from .pricing import MAX_DAYS, estimate_price
from .whatsapp import customer_to_owner_link

def home(request):
    return render(request, "rentals/home.html")


# ---------- Calendar data ----------

def get_day_status():
    pending = set()
    approved = set()

    for booking in Booking.objects.exclude(status="denied"):
        day = booking.start_date
        while day <= booking.end_date:
            if booking.status == "approved":
                approved.add(day.isoformat())
            else:
                pending.add(day.isoformat())
            day += timedelta(days=1)

    pending -= approved
    return {"pending": sorted(pending), "approved": sorted(approved)}


def book(request):
    data = get_day_status()
    data["max_days"] = MAX_DAYS
    return render(request, "rentals/book.html", {"day_status": data})


# ---------- Price API ----------

def price_api(request):
    try:
        days = int(request.GET.get("days", 0))
    except ValueError:
        return JsonResponse({"error": "Days must be a number."}, status=400)

    if days < 1 or days > MAX_DAYS:
        return JsonResponse({"error": f"Days must be between 1 and {MAX_DAYS}."}, status=400)

    controller = request.GET.get("controller") == "1"
    screen = request.GET.get("screen") == "1"

    return JsonResponse({"price": estimate_price(days, controller, screen)})


# ---------- Booking details + saving ----------

def parse_selection(params):
    """Read the dates and options from the address and check them.
    Returns (selection, None) if OK, or (None, error message) if not."""
    try:
        start = date.fromisoformat(params.get("start", ""))
        end = date.fromisoformat(params.get("end", ""))
    except ValueError:
        return None, "Invalid dates."

    if start < date.today():
        return None, "The start date is in the past."
    if end < start:
        return None, "The end date is before the start date."

    days = (end - start).days + 1
    if days > MAX_DAYS:
        return None, f"You can rent for {MAX_DAYS} days maximum."

    overlaps_booked = Booking.objects.filter(
        status="approved", start_date__lte=end, end_date__gte=start
    ).exists()
    if overlaps_booked:
        return None, "Some of these days are already booked."

    controller = params.get("controller") == "1"
    screen = params.get("screen") == "1"

    return {
        "start": start,
        "end": end,
        "days": days,
        "controller": controller,
        "screen": screen,
        "price": estimate_price(days, controller, screen),
    }, None


def book_details(request):
    selection, error = parse_selection(request.GET)
    if error:
        return render(request, "rentals/book_details.html", {"error": error})

    if request.method == "POST":
        form = ContactForm(request.POST)
        if form.is_valid():
            booking = Booking.objects.create(
                name=form.cleaned_data["name"],
                phone=form.cleaned_data["phone"],
                residence=form.cleaned_data["residence"],
                start_date=selection["start"],
                end_date=selection["end"],
                extra_controller=selection["controller"],
                extra_screen=selection["screen"],
                total_price=selection["price"],
            )
            request.session["last_booking_id"] = booking.id
            return redirect("book_sent")
    else:
        form = ContactForm()

    return render(request, "rentals/book_details.html", {"selection": selection, "form": form})


def book_sent(request):
    booking_id = request.session.get("last_booking_id")
    booking = Booking.objects.filter(id=booking_id).first() if booking_id else None

    context = {"booking": booking}
    if booking:
        context["whatsapp_url"] = customer_to_owner_link(booking)

    return render(request, "rentals/book_sent.html", context)