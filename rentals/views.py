from datetime import timedelta

from django.shortcuts import render

from .models import Booking
from django.http import JsonResponse

from .pricing import MAX_DAYS, estimate_price


def home(request):
    return render(request, "rentals/home.html")


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