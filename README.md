Vice Rentals: PS5 Rental Booking Site

A full-stack Django website for renting out a PS5 in the Studentenstadt Freimann (StuSta) in Munich. Customers pick their dates on a live availability calendar, choose extras, see the price update in real time and send a booking request. The owner gets a WhatsApp alert right away and approves or denies the request from an admin panel.

Live demo: https://vicerentalsvi.pythonanywhere.com

Features
Neon-style landing page with chapter tabs and floating 3D models (Three.js) you can rotate and zoom
Availability calendar, built from scratch in JavaScript
Green = free, yellow = requested (waiting for approval), red = booked
Month and year navigation, past days disabled
Start/end range selection that blocks booked days and enforces a 31-day maximum
Live price estimate from a small JSON API (/api/price/), with a per-day discount for longer rentals
Booking form with server-side validation (phone number format, consent checkbox)
The server re-checks everything (dates, overlaps, limits) and recalculates the price itself, so the browser's values are never trusted
WhatsApp integration
Automatic alert to the owner on every new request (CallMeBot API)
One-tap "Send my request on WhatsApp" link for the customer
Admin panel to review bookings and approve or deny them. Approved days turn red on the calendar for everyone.
Privacy by design: the confirmation page uses the session, not guessable URLs, so nobody can view another customer's booking
Tech stack
Area	Tools
Backend	Python 3.13, Django 6
Database	SQLite
Frontend	HTML, Tailwind CSS, vanilla JavaScript
3D	Three.js (GLTFLoader, OrbitControls)
Integrations	CallMeBot WhatsApp API, wa.me deep links
Deployment	PythonAnywhere
Config	Environment variables via python-dotenv
Project structure
config/                 Django settings, URLs, WSGI
rentals/
├── models.py           Booking model (dates, extras, price, status)
├── views.py            Pages, booking flow, price API
├── forms.py            Contact form + phone validation
├── pricing.py          Pricing formula (single source of truth)
├── whatsapp.py         All WhatsApp logic in one place
├── templates/rentals/  base, home, book, book_details, book_sent
└── static/rentals/     calendar.js, scene.js, 3D models
Pricing formula
price = rate × days / (1 + 0.02 × (days − 1))

Daily rate: 8 € (base) · 10 € (+ controller) · 13 € (+ screen) · 15 € (both). Each extra day adds roughly 2% more discount, so 1 day = 8 €, 1 week = 50 €, 1 month ≈ 150 €.

Run it locally
bash
git clone https://github.com/Saif-Ssj/PS5-GTA6-rental-.git
cd PS5-GTA6-rental-

python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

cp .env.example .env        # then fill in your own values
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver

Open http://127.0.0.1:8000. The admin panel is at /admin.

Environment variables
Variable	Description
DJANGO_SECRET_KEY	Secret key (generate a new one for production)
DJANGO_DEBUG	True locally, False in production
DJANGO_ALLOWED_HOSTS	Comma-separated domains, e.g. 127.0.0.1,localhost
DJANGO_CSRF_TRUSTED_ORIGINS	e.g. https://yourname.pythonanywhere.com
OWNER_WHATSAPP	Owner's number with country code, no + (e.g. 4915112345678)
CALLMEBOT_APIKEY	Personal CallMeBot API key (optional, alerts are skipped if empty)
Roadmap
[ ] User accounts: sign up, log in, "My bookings" with live status
[ ] One-tap "Message customer" confirmation from the admin panel
[ ] Animated intro: press start, slideshow and music
[ ] Privacy policy and Impressum pages
Credits
3D models (all CC BY 4.0, via Sketchfab):
"Ps5" by kiddhunter2
"Ps5" by KIARASH 3D
"GTA 6 Phone Case - 3D Model" by torresgol10.rtd
License: CC BY 4.0
Fonts: Anton, Geist and JetBrains Mono (Google Fonts)
