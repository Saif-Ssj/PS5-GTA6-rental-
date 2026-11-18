import re

from django import forms

INPUT_CLASSES = "w-full px-3 py-2 rounded-lg bg-[#110b1f] text-white border border-purple-500/20 outline-none focus:border-[#00eefc]"


class ContactForm(forms.Form):
    name = forms.CharField(
        max_length=100,
        label="Your name",
        widget=forms.TextInput(attrs={"class": INPUT_CLASSES, "placeholder": "Karim"}),
    )
    phone = forms.CharField(
        max_length=30,
        label="WhatsApp number",
        help_text="With country code, e.g. +49 151 2345678",
        widget=forms.TextInput(attrs={"class": INPUT_CLASSES, "type": "tel", "placeholder": "+49 151 2345678"}),
    )
    residence = forms.CharField(
        max_length=100,
        label="Where in StuSta",
        help_text="House and room number",
        widget=forms.TextInput(attrs={"class": INPUT_CLASSES, "placeholder": "Haus 10, Room 1234"}),
    )
    consent = forms.BooleanField(
        required=True,
        label="I agree to be contacted on WhatsApp about my booking.",
        widget=forms.CheckboxInput(attrs={"class": "w-4 h-4 accent-purple-600"}),
    )

    def clean_phone(self):
        phone = self.cleaned_data["phone"].replace(" ", "")
        if not re.fullmatch(r"\+?\d{8,15}", phone):
            raise forms.ValidationError("Enter a valid number with country code, e.g. +49 151 2345678.")
        return phone