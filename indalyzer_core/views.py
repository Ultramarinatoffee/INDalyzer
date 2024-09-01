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
from django.http import HttpResponse
from decimal import Decimal
from datetime import datetime
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from io import BytesIO
from django.utils.formats import date_format

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

    @action(detail=False, methods=['post'])

    def calculer_rente(self, request):
        data = request.data
        affilie_id = data.get('affilie')
        accident_id = data.get('accident')
        date_debut = datetime.strptime(data.get('date_debut'), '%Y-%m-%d').date()
        date_fin = datetime.strptime(data.get('date_fin'), '%Y-%m-%d').date()
        type_reclamation = data.get('type_reclamation')
        type_commentaire = data['type_commentaire']
        commentaire_texte = data.get('commentaire_texte', '')
        generate_pdf = data.get('generate_pdf', False)


        # deboggage
        print("Données reçues du frontend:", data)

        try:
            affilie = Affilie.objects.get(id=affilie_id)
            accident = Accident.objects.get(id=accident_id)

            periodes = PeriodeIndemnisation.objects.filter(
                affilie=affilie,
                date_debut__lte=date_fin,
                date_fin__gte=date_debut
            ).order_by('date_debut')

            taux_ipp = Decimal(accident.taux_IPP) / 100
            salaire_base = Decimal(accident.salaire_base)

            type_commentaire = data.get('type_commentaire', 'AUTRE')
            commentaire = self.generer_commentaire(
                type_commentaire,
                data.get('commentaire_texte'),
                accident,
                date_debut,
                date_fin
            )
            
            # Assurez-vous que le commentaire n'est pas None
            if commentaire is None:
                commentaire = "Aucun commentaire spécifié"
            

            def formater_date(date):
                return date.strftime('%d/%m/%Y')

            resultats = []
            total_general = Decimal('0')

            for periode in periodes:
                debut_calcul = max(periode.date_debut, date_debut)
                fin_calcul = min(periode.date_fin, date_fin)
                nombre_jours = periode.nombre_jours
                # nombre_jours = (fin_calcul - debut_calcul).days + 1

                if debut_calcul > periode.date_debut or fin_calcul < periode.date_fin:
                    jours_totaux = (periode.date_fin - periode.date_debut).days + 1
                    jours_calcules = (fin_calcul - debut_calcul).days + 1
                    nombre_jours = int(nombre_jours * jours_calcules / jours_totaux)  

                montant_journalier_rente = (salaire_base * Decimal('0.8693') * taux_ipp) / 312

                if taux_ipp < Decimal('0.05'):
                    montant_journalier_rente *= Decimal('0.5')
                elif taux_ipp < Decimal('0.10'):
                    montant_journalier_rente *= Decimal('0.75')

                total = montant_journalier_rente * nombre_jours
                total_general += total

                resultats.append({
                    'debut': formater_date(debut_calcul),
                    'fin': formater_date(fin_calcul),
                    'nombre_jours': nombre_jours,
                    'montant_journalier_rente': float(montant_journalier_rente),
                    'total': float(total)
                })

            resultat = {
                'affilie': {
                    'nom': affilie.nom,
                    'prenom': affilie.prenom,
                    'niss': affilie.numero_registre_national,
                },
                'accident': {
                    'date': accident.date_accident.strftime('%d/%m/%Y'),
                    'taux_ipp': float(taux_ipp),
                },
                'periodes': resultats,
                'total_general': float(total_general),
                'commentaire': commentaire,
            }

            if generate_pdf:
                pdf_buffer = self.generer_rapport_pdf(resultat)
                response = HttpResponse(content_type='application/pdf')
                response['Content-Disposition'] = 'attachment; filename="rapport_rente.pdf"'
                response.write(pdf_buffer.getvalue())
                return response
            else:
                return Response(resultat)

        except KeyError as e:
            return Response({'error': f'Donnée manquante: {str(e)}'}, status=400)
        except (Affilie.DoesNotExist, Accident.DoesNotExist):
            return Response({'error': 'Affilié ou accident non trouvé'}, status=404)
        except Exception as e:
            print("Erreur lors du calcul:", str(e))
            return Response({'error': str(e)}, status=400)
        
    def generer_commentaire(self, type_commentaire, commentaire_texte, accident, date_debut, date_fin):

       
        def formater_date(date):
            if isinstance(date, str):
                # Si la date est déjà une chaîne, on suppose qu'elle est au format YYYY-MM-DD
                date = datetime.strptime(date, '%Y-%m-%d').date()
            return date.strftime('%d/%m/%Y') if date else 'date non définie'
        
        if type_commentaire == 'IPP':
            return f"Reconnaissance d'une IPP de {accident.taux_IPP}% à partir du {formater_date(accident.date_consolidation)}"
        elif type_commentaire == 'AGGRAVATION':
            return f"Aggravation d'une IPP passée à {accident.taux_IPP}% à partir du {formater_date(accident.date_consolidation)}"
        elif type_commentaire == 'ITT':
            return f"Reconnaissance d'une ITT à 100% pour la période du {formater_date(date_debut)} au {formater_date(date_fin)}"
        elif type_commentaire == 'SALAIRE':
            return f"Modification du salaire de base à {accident.salaire_base}€ à partir du {formater_date(accident.date_consolidation)}"
        elif commentaire_texte:
            return commentaire_texte
        else:
            return "Aucun commentaire spécifié"

       
    def generer_rapport_pdf(self, data):
        buffer = BytesIO()
        p = canvas.Canvas(buffer, pagesize=letter)
        
        print("Contenu de data:", data)

        # Informations de base
        y = 750
        p.drawString(100, y, f"Assuré(e): {data['affilie']['nom']} {data['affilie']['prenom']}")
        y -= 20
        p.drawString(100, y, f"NISS: {data['affilie']['niss']}")
        y -= 20
        p.drawString(100, y, f"Date de l'accident: {data['accident']['date']}")
        y -= 20
        p.drawString(100, y, f"Taux IPP: {data['accident']['taux_ipp']*100}%")
        y -= 40  # Espacement supplémentaire après les informations générales

        # Ajout du commentaire
        if 'commentaire' in data and data['commentaire']:
            p.drawString(100, y, data['commentaire'])
            y -= 30  # Espacement après le commentaire
        
        # Espacement supplémentaire avant le tableau
        y -= 20
        
        # Dessiner le tableau des périodes
        # y = 650
        p.drawString(50, y, "Période")
        p.drawString(200, y, "Nombre de jours")
        p.drawString(350, y, "Montant journalier")
        p.drawString(500, y, "Total")
        y -= 20

        for periode in data['periodes']:
            p.drawString(50, y, f"{periode['debut']} - {periode['fin']}")
            p.drawString(200, y, str(periode['nombre_jours']))
            p.drawString(350, y, f"{periode['montant_journalier_rente']:.2f}€")
            p.drawString(500, y, f"{periode['total']:.2f}€")
            y -= 20

        p.drawString(250, y-20, "Total général:")
        p.drawString(350, y-20, f"{data['total_general']:.2f}€")
        
        p.showPage()
        p.save()
        
        buffer.seek(0)
        return buffer


class PeriodeIndemnisationViewSet(viewsets.ModelViewSet):
    queryset = PeriodeIndemnisation.objects.all()
    serializer_class = PeriodeIndemnisationSerializer



