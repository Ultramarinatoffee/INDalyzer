"""
URL configuration for INDalyzer project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.0/topics/http/urls/
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
from django.urls import path, include
from indalyzer_core.views import home
from django.views.generic import TemplateView
from indalyzer_core.views import auth_status, login_view
from django.contrib.auth.views import LogoutView

urlpatterns = [
    # path('', home, name='home'),
    path('admin/', admin.site.urls),
    # path('indalyzer/', include('indalyzer_core.urls')),
    path('', TemplateView.as_view(template_name='index.html')),
    path('accounts/', include('django.contrib.auth.urls')),
    path('api/auth-status/', auth_status, name='auth_status'),
    path('api/login/', login_view, name='api_login'),
    path('api/logout/', LogoutView.as_view(), name='logout'),
    path('api/', include('indalyzer_core.urls')),
    
]
