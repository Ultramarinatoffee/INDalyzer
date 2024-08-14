from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# urlpatterns = [
#     path('hello/', views.hello_world, name='hello_world'),
# ]

router = DefaultRouter()
router.register(r'affilies', views.AffilieViewSet)
router.register(r'accidents', views.AccidentViewSet)
router.register(r'calculs', views.CalculIndemniteViewSet)
router.register(r'periodes', views.PeriodeIndemnisationViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('welcome/', views.api_welcome, name='api_welcome'),
]