from django.shortcuts import render, redirect
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.contrib.auth import authenticate, login, logout
from django.views.decorators.csrf import csrf_protect
import json
from rest_framework import viewsets
from .models import Affilie, Accident, CalculIndemnite, PeriodeIndemnisation
from .serializers import AffilieSerializer, AccidentSerializer, CalculIndemniteSerializer, PeriodeIndemnisationSerializer
from rest_framework.decorators import action


from django.views.decorators.csrf import csrf_exempt

def home(request):
    return redirect('api_welcome')

@api_view(['GET'])
def api_welcome(request):
    return Response({
        "message": "Bienvenue dans INDalyzer!",
        "status": "opérationnel",
        "version": "1.0"
    })

@require_http_methods(["GET"])
def auth_status(request):
    return JsonResponse({
        'isAuthenticated': request.user.is_authenticated,
        'username': request.user.username if request.user.is_authenticated else None
    })

@csrf_exempt
def login_view(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        username = data.get('username')
        password = data.get('password')
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return JsonResponse({'success': True})
        else:
            return JsonResponse({"success": False, "message": "Nom d'utilisateur ou mot de passe incorrect. Veuillez réessayer."}, status=400)
    return JsonResponse({'message': 'Méthode non autorisée'}, status=405)

def logout_view(request):
    logout(request)
    return JsonResponse({'success': True})

class AffilieViewSet(viewsets.ModelViewSet):
    queryset = Affilie.objects.all()
    serializer_class = AffilieSerializer

    @action(detail=False, methods=['get'])
    def search(self, request):
        query = request.query_params.get('rn', '')
        affilies = Affilie.objects.filter(numero_registre_national__icontains=query)
        serializer = self.get_serializer(affilies, many=True)
        return Response(serializer.data)

    def get_queryset(self):
        queryset = super().get_queryset()
        rn = self.request.query_params.get('rn', None)
        if rn is not None:
            queryset = queryset.filter(numero_registre_national__icontains=rn)
        return queryset

class AccidentViewSet(viewsets.ModelViewSet):
    queryset = Accident.objects.all()
    serializer_class = AccidentSerializer

    def get_queryset(self):
        affilie_id = self.request.query_params.get('affilie', None)
        if affilie_id is not None:
            return self.queryset.filter(affilie_id=affilie_id)
        return self.queryset

class CalculIndemniteViewSet(viewsets.ModelViewSet):
    queryset = CalculIndemnite.objects.all()
    serializer_class = CalculIndemniteSerializer

class PeriodeIndemnisationViewSet(viewsets.ModelViewSet):
    queryset = PeriodeIndemnisation.objects.all()
    serializer_class = PeriodeIndemnisationSerializer