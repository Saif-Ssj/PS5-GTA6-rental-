"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from rentals import views 

urlpatterns = [
    path("admin/", admin.site.urls),
    path("", views.home, name="home"),
    path("book/", views.book, name="book"),
    path("book/details/", views.book_details, name="book_details"),
    path("book/sent/", views.book_sent, name="book_sent"),
    path("api/price/", views.price_api, name="price_api"),
]
