from django.db import models


class Booking(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("approved", "Approved"),
        ("denied", "Denied"),
    ]

    name = models.CharField(max_length=100)
    phone = models.CharField(max_length=30)
    residence = models.CharField(max_length=100, default="")
    start_date = models.DateField()
    end_date = models.DateField()
    extra_controller = models.BooleanField(default=False)
    extra_screen = models.BooleanField(default=False)
    total_price = models.DecimalField(max_digits=7, decimal_places=2)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="pending")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} | {self.start_date} → {self.end_date} | {self.status}"
    