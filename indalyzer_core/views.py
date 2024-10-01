# views.py

from django.shortcuts import render, redirect
from rest_framework.decorators import api_view, action
from rest_framework.response import Response
from django.http import JsonResponse, HttpResponse
from django.views.decorators.http import require_http_methods
from django.contrib.auth import authenticate, login, logout
from django.views.decorators.csrf import csrf_protect, csrf_exempt
import json
from rest_framework import viewsets
from .models import Affilie, Accident, CalculIndemnite, PeriodeIndemnisation
from .serializers import AffilieSerializer, AccidentSerializer, CalculIndemniteSerializer, PeriodeIndemnisationSerializer
from decimal import Decimal
from datetime import datetime, date
import traceback

# Importer les classes de calcul
from .calculs.fabrique_calculateur import obtenir_calculateur
from indalyzer_core.calculs.fabrique_calculateur import obtenir_calculateur


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

        # Débogage
        print("Données reçues pour calculer_rente:", data)

        affilie_id = data.get('affilie')
        accident_id = data.get('accident')
        is_manual_entry = data.get('is_manual_entry', False)

        if not affilie_id or not accident_id:
            return Response({'error': 'Les IDs de l\'affilié et de l\'accident sont requis.'}, status=400)

        try:
            affilie = Affilie.objects.get(id=affilie_id)
            accident = Accident.objects.get(id=accident_id)

            calculateur = obtenir_calculateur(affilie, accident, data, is_manual_entry)

            # Préparer les périodes
            calculateur.preparer_periodes()

            # Générer le résultat
            resultat = calculateur.generer_resultat()

            generate_pdf = data.get('generate_pdf', False)
            if generate_pdf:
                # Générer le PDF
                pdf_buffer = self.generer_rapport_pdf(resultat)
                response = HttpResponse(content_type='application/pdf')
                response['Content-Disposition'] = 'attachment; filename="rapport_rente.pdf"'
                response.write(pdf_buffer.getvalue())
                return response
            else:
                return Response(resultat)

        except Affilie.DoesNotExist:
            return Response({'error': "L'affilié spécifié n'existe pas."}, status=400)
        except Accident.DoesNotExist:
            return Response({'error': "L'accident spécifié n'existe pas."}, status=400)
        except Exception as e:
            print("Erreur lors du calcul:", str(e))
            print("Traceback:", traceback.format_exc())
            return Response({'error': str(e)}, status=400)

    def generer_rapport_pdf(self, data):
        # Votre code existant pour générer le PDF
        from reportlab.pdfgen import canvas
        from reportlab.lib.pagesizes import letter
        from io import BytesIO

        print("Début de generer_rapport_pdf")
        print("Contenu de data:", data)

        buffer = BytesIO()
        p = canvas.Canvas(buffer, pagesize=letter)

        try:
            # Informations de base
            y = 750
            p.drawString(100, y, f"Assuré(e): {data['affilie']['nom']} {data['affilie']['prenom']}")
            y -= 20
            p.drawString(100, y, f"NISS: {data['affilie']['niss']}")
            y -= 20
            p.drawString(100, y, f"Date de l'accident: {data['accident']['date']}")
            y -= 20
            p.drawString(100, y, f"Taux IPP: {data['accident']['taux_ipp']}%")
            y -= 40  # Espacement supplémentaire après les informations générales

            # Ajout du commentaire
            if 'commentaire' in data and data['commentaire']:
                p.drawString(100, y, data['commentaire'])
                y -= 30  # Espacement après le commentaire

            # Espacement supplémentaire avant le tableau
            y -= 20

            # Dessiner le tableau des périodes
            p.drawString(50, y, "Période")
            p.drawString(200, y, "Nombre de jours")
            p.drawString(350, y, "Montant journalier")
            p.drawString(500, y, "Total")
            y -= 20

            for idx, periode in enumerate(data['periodes']):
                debut = periode.get('debut')
                fin = periode.get('fin')
                nombre_jours = periode.get('nombre_jours', 'N/A')
                montant_journalier = periode.get('montant_journalier_rente', 0)
                total = periode.get('total', 0)

                p.drawString(50, y, f"{debut} - {fin}")
                p.drawString(200, y, str(nombre_jours))
                p.drawString(350, y, f"{montant_journalier:.2f}€")
                p.drawString(500, y, f"{total:.2f}€")
                y -= 20

            p.drawString(250, y - 20, "Total général:")
            p.drawString(350, y - 20, f"{data['total_general']:.2f}€")

            p.showPage()
            p.save()

            buffer.seek(0)
            print("Génération du PDF terminée avec succès")
            return buffer
        except Exception as e:
            print(f"Erreur dans generer_rapport_pdf: {str(e)}")
            print(f"Données problématiques: {data}")
            raise

class PeriodeIndemnisationViewSet(viewsets.ModelViewSet):
    queryset = PeriodeIndemnisation.objects.all()
    serializer_class = PeriodeIndemnisationSerializer




# from django.shortcuts import render, redirect
# from rest_framework.decorators import api_view
# from rest_framework.response import Response
# from django.http import JsonResponse
# from django.views.decorators.http import require_http_methods
# from django.contrib.auth import authenticate, login, logout
# from django.views.decorators.csrf import csrf_protect
# import json
# from rest_framework import viewsets
# from .models import Affilie, Accident, CalculIndemnite, PeriodeIndemnisation
# from .serializers import AffilieSerializer, AccidentSerializer, CalculIndemniteSerializer, PeriodeIndemnisationSerializer
# from rest_framework.decorators import action
# from django.views.decorators.csrf import csrf_exempt
# from django.http import HttpResponse
# from decimal import Decimal
# from datetime import datetime, date
# from reportlab.pdfgen import canvas
# from reportlab.lib.pagesizes import letter
# from io import BytesIO
# from django.utils.formats import date_format
# import traceback
# from .calculs.fabrique_calculateur import obtenir_calculateur
# from indalyzer_core.calculs.fabrique_calculateur import obtenir_calculateur

# def home(request):
#     return redirect('api_welcome')

# @api_view(['GET'])
# def api_welcome(request):
#     return Response({
#         "message": "Bienvenue dans INDalyzer!",
#         "status": "opérationnel",
#         "version": "1.0"
#     })

# @require_http_methods(["GET"])
# def auth_status(request):
#     return JsonResponse({
#         'isAuthenticated': request.user.is_authenticated,
#         'username': request.user.username if request.user.is_authenticated else None
#     })

# @csrf_exempt
# def login_view(request):
#     if request.method == 'POST':
#         data = json.loads(request.body)
#         username = data.get('username')
#         password = data.get('password')
#         user = authenticate(request, username=username, password=password)
#         if user is not None:
#             login(request, user)
#             return JsonResponse({'success': True})
#         else:
#             return JsonResponse({"success": False, "message": "Nom d'utilisateur ou mot de passe incorrect. Veuillez réessayer."}, status=400)
#     return JsonResponse({'message': 'Méthode non autorisée'}, status=405)

# def logout_view(request):
#     logout(request)
#     return JsonResponse({'success': True})

# class AffilieViewSet(viewsets.ModelViewSet):
#     queryset = Affilie.objects.all()
#     serializer_class = AffilieSerializer

#     @action(detail=False, methods=['get'])
#     def search(self, request):
#         query = request.query_params.get('rn', '')
#         affilies = Affilie.objects.filter(numero_registre_national__icontains=query)
#         serializer = self.get_serializer(affilies, many=True)
#         return Response(serializer.data)

#     def get_queryset(self):
#         queryset = super().get_queryset()
#         rn = self.request.query_params.get('rn', None)
#         if rn is not None:
#             queryset = queryset.filter(numero_registre_national__icontains=rn)
#         return queryset

# class AccidentViewSet(viewsets.ModelViewSet):
#     queryset = Accident.objects.all()
#     serializer_class = AccidentSerializer

#     def get_queryset(self):
#         affilie_id = self.request.query_params.get('affilie', None)
#         if affilie_id is not None:
#             return self.queryset.filter(affilie_id=affilie_id)
#         return self.queryset

# class CalculIndemniteViewSet(viewsets.ModelViewSet):
#     queryset = CalculIndemnite.objects.all()
#     serializer_class = CalculIndemniteSerializer

#     def formater_date(self, date_input):
#         print(f"Type de date_input: {type(date_input)}")
#         print(f"Valeur de date_input: {date_input}")

#         if not date_input:
#             return 'date non définie'
#         if isinstance(date_input, str):
#             try:
#                 date_input = datetime.strptime(date_input, '%Y-%m-%d').date()
#             except ValueError:
#                 return 'date non valide'
#         elif isinstance(date_input, datetime):
#             date_input = date_input.date()
#         elif not isinstance(date_input, date):
#             return 'date non valide'
        
#         return date_input.strftime('%d/%m/%Y')
        

#     @action(detail=False, methods=['post'])
    

#     def calculer_rente(self, request):
#         data = request.data

        
#         def parse_date(date_str):
#             for fmt in ('%Y-%m-%d', '%d/%m/%Y'):
#                 try:
#                     return datetime.strptime(date_str, fmt).date()
#                 except ValueError:
#                     continue
#             return None
        

#         # deboggage à supprimer
#         print("Données reçues pour calculer_rente:", data)

#         affilie_id = data.get('affilie')
#         accident_id = data.get('accident')

#         # deboggage
#         is_manual_entry = data.get('is_manual_entry', False)

#         if not affilie_id:
#             return Response({"error": "L'ID de l'affilié est requis."}, status=400)
        
#         print(f"Tentative de récupération de l'affilié avec ID: {affilie_id}")
#         print(f"Tentative de récupération de l'accident avec ID: {accident_id}")



#         is_manual_entry = data.get('is_manual_entry', False)

#         if not affilie_id or not accident_id:
#             return Response({'error': 'Les IDs de l\'affilié et de l\'accident sont requis.'}, status=400)



#         type_reclamation = data.get('type_reclamation')
#         type_commentaire = data['type_commentaire']
#         commentaire_texte = data.get('commentaire_texte', '')
#         generate_pdf = data.get('generate_pdf', False)


#         # deboggage
#         print("Données reçues du frontend:", data)
#         print("URL de la requête:", request.path)
#         print("Méthode de la requête:", request.method)
#         print("Données reçues complètes:", data)
#         print("Is manual entry:", data.get('is_manual_entry'))
#         print("Affilie ID:", data.get('affilie'))
#         print("Accident ID:", data.get('accident'))

#         if not affilie_id or not accident_id:
#             return Response({'error': 'Les IDs de l\'affilié et de l\'accident sont requis.'}, status=400)


#         try:
#             affilie = Affilie.objects.get(id=affilie_id)
#             accident = Accident.objects.get(id=accident_id)


#             if is_manual_entry:
#                 print("debut de if is manuel entry", data)
#                 periodes = data.get('periodes', [])
#                 if not periodes:
#                     return Response({"error": "Aucune période fournie pour l'encodage manuel"}, status=400)
                
#                 try:
#                     dates = []

#                     # def parse_date(date_str):
#                     #     for fmt in ('%Y-%m-%d', '%d/%m/%Y'):
#                     #         try:
#                     #             return datetime.strptime(date_str, fmt).date()
#                     #         except ValueError:
#                     #             continue
#                     #     return None
                    
#                     for idx, p in enumerate(periodes):
#                         # Récupération des dates au format 'YYYY-MM-DD'
#                         debut_str = p.get('dateDebut') or p.get('debut')
#                         fin_str = p.get('dateFin') or p.get('fin')
#                         print(f"Période {idx} - Date début (str): {debut_str}, Date fin (str): {fin_str}")

#                         debut = parse_date(debut_str)
#                         fin = parse_date(fin_str)

#                         if debut is None or fin is None:
#                             raise ValueError(f"Format de date invalide pour la période {idx}")

#                         # Conversion des chaînes en objets date
#                         # debut = datetime.strptime(debut_str, '%Y-%m-%d').date()
#                         # fin = datetime.strptime(fin_str, '%Y-%m-%d').date()
#                         print(f"Période {idx} - Date début (objet date): {debut}, Date fin (objet date): {fin}")
                        

#                         dates.append(debut)
#                         dates.append(fin)
                    
#                     if not dates:
#                         raise ValueError("Aucune date valide trouvée dans les périodes")

#                     date_debut = min(dates)
#                     date_fin = max(dates)

#                     print(f"Dates extraites - début: {date_debut}, fin: {date_fin}")

#                 except Exception as e:
#                     print(f"Erreur lors du traitement des dates : {str(e)}")
#                     print("Structure des périodes :")
#                     for idx, p in enumerate(periodes):
#                         print(f"Période {idx}: {p}")
#                     return Response({'error': f"Erreur lors du traitement des périodes : {str(e)}"}, status=400)

#                 print("Fin du traitement pour une entrée manuelle", data)
#             else:
#                 date_debut_str = data.get('date_debut')
#                 date_fin_str = data.get('date_fin')
#                 if not date_debut_str or not date_fin_str:
#                     return Response({'error': 'Les dates de début et de fin sont requises pour le calcul non manuel.'}, status=400)
                
#                 date_debut = parse_date(date_debut_str)
#                 date_fin = parse_date(date_fin_str)
#                 # date_debut = datetime.strptime(date_debut_str, '%Y-%m-%d').date()
#                 # date_fin = datetime.strptime(date_fin_str, '%Y-%m-%d').date()


#                 # Vérification si la date_debut est après la date_fin
#                 if date_debut > date_fin:
#                     return Response({'error': 'La date de début ne peut pas être postérieure à la date de fin.'}, status=400)



#                 periodes = PeriodeIndemnisation.objects.filter(
#                     affilie=affilie,
#                     date_debut__lte=date_fin,
#                     date_fin__gte=date_debut
#                 ).order_by('date_debut')

#                   # Ajout de la vérification si periodes est vide
#                 if not periodes.exists():
#                     return Response({'error': 'Aucune période d\'indemnisation trouvée pour les dates fournies.'}, status=400)


#             taux_ipp = Decimal(accident.taux_IPP) / 100
#             salaire_base = Decimal(accident.salaire_base)

#             type_commentaire = data.get('type_commentaire', 'AUTRE')
#             commentaire = self.generer_commentaire(
#                 type_commentaire,
#                 data.get('commentaire_texte'),
#                 accident,
#                 date_debut,
#                 date_fin
#             )
            
#             # Assurez-vous que le commentaire n'est pas None
#             if commentaire is None:
#                 commentaire = "Aucun commentaire spécifié"
            

#             # def formater_date(date):
#             #     return date.strftime('%d/%m/%Y')

#             resultats = []
#             total_general = Decimal('0')

#             for idx, periode in enumerate(periodes):
#                 if is_manual_entry:
#                 # Pour les entrées manuelles, les dates sont déjà au format 'YYYY-MM-DD'
#                     debut_calcul = datetime.strptime(periode.get('dateDebut') or periode.get('debut'), '%Y-%m-%d').date()
#                     fin_calcul = datetime.strptime(periode.get('dateFin') or periode.get('fin'), '%Y-%m-%d').date()
#                     nombre_jours = int(periode.get('nombreJours') or periode.get('nombre_jours'))

#                     print(f"Période {idx} - Début: {debut_calcul}, Fin: {fin_calcul}, Nombre de jours: {nombre_jours}")

#                     # debut_calcul = datetime.strptime(periode['dateDebut'], '%Y-%m-%d').date()
#                     # fin_calcul = datetime.strptime(periode['dateFin'], '%Y-%m-%d').date()
#                     # nombre_jours = int(periode['nombreJours'])
#                 else:
#                     debut_calcul = max(periode.date_debut, date_debut)
#                     fin_calcul = min(periode.date_fin, date_fin)
#                     # nombre_jours = periode.nombre_jours
#                     nombre_jours = (fin_calcul - debut_calcul).days + 1

#                     if debut_calcul > periode.date_debut or fin_calcul < periode.date_fin:
#                         jours_totaux = (periode.date_fin - periode.date_debut).days + 1
#                         jours_calcules = (fin_calcul - debut_calcul).days + 1
#                         nombre_jours = int(nombre_jours * jours_calcules / jours_totaux)
                        
                
#                 print(f"Traitement de la période: début={debut_calcul}, fin={fin_calcul}, jours={nombre_jours}")


#                 montant_journalier_rente = (salaire_base * Decimal('0.8693') * taux_ipp) / 312

#                 if taux_ipp < Decimal('0.05'):
#                     montant_journalier_rente *= Decimal('0.5')
#                 elif taux_ipp < Decimal('0.10'):
#                     montant_journalier_rente *= Decimal('0.75')

#                 total = montant_journalier_rente * nombre_jours
#                 total_general += total

#                 resultats.append({
#                     'debut': self.formater_date(debut_calcul),
#                     'fin': self.formater_date(fin_calcul),
#                     'nombre_jours': nombre_jours,
#                     'montant_journalier_rente': float(montant_journalier_rente),
#                     'total': float(total)
#                 })

#             resultat = {
#                 'affilie': {
#                     'nom': affilie.nom,
#                     'prenom': affilie.prenom,
#                     'niss': affilie.numero_registre_national,
#                 },
#                 'accident': {
#                     # 'date': accident.date_accident.strftime('%d/%m/%Y'),
#                     'date': self.formater_date(accident.date_accident),
#                     'taux_ipp': float(taux_ipp),
#                 },
#                 'periodes': resultats,
#                 'total_general': float(total_general),
#                 'commentaire': commentaire,
#             }

#             print(f"Traitement de la période: début={debut_calcul}, fin={fin_calcul}, jours={nombre_jours}")
#             print("Structure finale de resultat:", json.dumps(resultat, default=str, indent=2))


#             if generate_pdf:
#                 # deboggage à supprimer
#                 print("Génération du PDF...")
#                 print("Données pour le PDF:", resultat)
#                 print("Données passées à generer_rapport_pdf:", resultat)
#                 print("Structure finale de resultat:", json.dumps(resultat, default=str, indent=2))
                
                
#                 try:
#                     # Créez une nouvelle structure pour le PDF qui inclut explicitement dateDebut et dateFin
#                     resultat_for_pdf = {
#                         **resultat,
#                         'periodes': [
#                             {
#                                 **periode,
#                                 'dateDebut': periode['debut'],
#                                 'dateFin': periode['fin'],
#                                 'debut': periode['debut'],
#                                 'fin': periode['fin']
#                             }
#                             for periode in resultat['periodes']
#                         ]
#                     }

#                     # Partie deboggage
#                     print("Structure de resultat_for_pdf avant génération PDF:")
#                     print(json.dumps(resultat_for_pdf, indent=2, default=str))
#                     print("Données passées à generer_rapport_pdf:", json.dumps(resultat_for_pdf, default=str, indent=2))

#                     print("Structure des périodes:")
#                     for idx, periode in enumerate(resultat_for_pdf['periodes']):
#                         print(f"Période {idx}:")
#                         print(json.dumps(periode, indent=2, default=str))

#                     print("Structure de resultat_for_pdf avant génération PDF:")
#                     for key, value in resultat_for_pdf.items():
#                         if key == 'periodes':
#                             print("Périodes:")
#                             for idx, periode in enumerate(value):
#                                 print(f"  Période {idx}:")
#                                 for p_key, p_value in periode.items():
#                                     print(f"    {p_key}: {p_value}")
#                         else:
#                             print(f"{key}: {value}")
                    
#                     pdf_buffer = self.generer_rapport_pdf(resultat_for_pdf)
#                     response = HttpResponse(content_type='application/pdf')
#                     response['Content-Disposition'] = 'attachment; filename="rapport_rente.pdf"'
#                     response.write(pdf_buffer.getvalue())

#                     return response

                
#                 except Exception as e:
#                     print("Erreur lors de la génération du PDF:", str(e))
#                     print("Traceback complet:", traceback.format_exc())
#                     return Response({'error': 'Erreur lors de la génération du PDF: ' + str(e)}, status=400)



#                 finally:
#                     # Déplacez la suppression des entrées temporaires ici
#                     if is_manual_entry:
#                         if affilie.est_temporaire:
#                             affilie.delete()
#                         if accident.est_temporaire:
#                             accident.delete()


     
                
#             else:
#                 return Response(resultat)

#             #     return response
#             # else:
#             #     return Response(resultat)

#         except Affilie.DoesNotExist:
#             return Response({'error': "L'affilié spécifié n'existe pas."}, status=400)
#         except Accident.DoesNotExist:
#             return Response({'error': "L'accident spécifié n'existe pas."}, status=400)
#         except Exception as e:
#             print("Erreur lors du calcul:", str(e))
#             return Response({'error': str(e)}, status=400)

        
#     def generer_commentaire(self, type_commentaire, commentaire_texte, accident, date_debut, date_fin):
     

#         if type_commentaire == 'IPP':
#             return f"Reconnaissance d'une IPP de {accident.taux_IPP}% à partir du {self.formater_date(accident.date_consolidation)}"
#         elif type_commentaire == 'AGGRAVATION':
#             return f"Aggravation d'une IPP passée à {accident.taux_IPP}% à partir du {self.formater_date(accident.date_consolidation)}"
#         elif type_commentaire == 'ITT':
#             return f"Reconnaissance d'une ITT à 100% pour la période du {self.formater_date(date_debut)} au {self.formater_date(date_fin)}"
#         elif type_commentaire == 'SALAIRE':
#             return f"Modification du salaire de base à {accident.salaire_base}€ à partir du {self.formater_date(accident.date_consolidation)}"
#         elif commentaire_texte:
#             return commentaire_texte
#         else:
#             return "Aucun commentaire spécifié"

       
#     def generer_rapport_pdf(self, data):

#         print("Début de generer_rapport_pdf")
#         print("Contenu de data:", data)


#         buffer = BytesIO()
#         p = canvas.Canvas(buffer, pagesize=letter)


#         try:

#             # Informations de base
#             y = 750
#             p.drawString(100, y, f"Assuré(e): {data['affilie']['nom']} {data['affilie']['prenom']}")
#             y -= 20
#             p.drawString(100, y, f"NISS: {data['affilie']['niss']}")
#             y -= 20
#             p.drawString(100, y, f"Date de l'accident: {data['accident']['date']}")
#             y -= 20
#             p.drawString(100, y, f"Taux IPP: {data['accident']['taux_ipp']*100}%")
#             y -= 40  # Espacement supplémentaire après les informations générales

#             # Ajout du commentaire
#             if 'commentaire' in data and data['commentaire']:
#                 p.drawString(100, y, data['commentaire'])
#                 y -= 30  # Espacement après le commentaire
            
#             # Espacement supplémentaire avant le tableau
#             y -= 20
            
#             # Dessiner le tableau des périodes
#             # y = 650
#             p.drawString(50, y, "Période")
#             p.drawString(200, y, "Nombre de jours")
#             p.drawString(350, y, "Montant journalier")
#             p.drawString(500, y, "Total")
#             y -= 20

#             for idx, periode in enumerate(data['periodes']):
#                 print(f"Traitement de la période {idx}:")
#                 for key, value in periode.items():
#                     print(f"  {key}: {value}")

#                 debut = periode.get('debut') or periode.get('dateDebut')
#                 fin = periode.get('fin') or periode.get('dateFin')
                
#                 if debut is None or fin is None:
#                     print(f"Erreur: données de période invalides: {periode}")
#                     continue  # Passe à la période suivante si les données sont invalides
                
#                 nombre_jours = periode.get('nombre_jours', 'N/A')
#                 montant_journalier = periode.get('montant_journalier_rente', 0)
#                 total = periode.get('total', 0)
                
#                 p.drawString(50, y, f"{debut} - {fin}")
#                 p.drawString(200, y, str(nombre_jours))
#                 p.drawString(350, y, f"{montant_journalier:.2f}€")
#                 p.drawString(500, y, f"{total:.2f}€")
#                 y -= 20

#             p.drawString(250, y-20, "Total général:")
#             p.drawString(350, y-20, f"{data['total_general']:.2f}€")
            
#             p.showPage()
#             p.save()
            
#             buffer.seek(0)
#             print("Génération du PDF terminée avec succès")
#             return buffer
#         except Exception as e:
#             print(f"Erreur dans generer_rapport_pdf: {str(e)}")
#             print(f"Données problématiques: {data}")
#             raise


    

# class PeriodeIndemnisationViewSet(viewsets.ModelViewSet):
#     queryset = PeriodeIndemnisation.objects.all()
#     serializer_class = PeriodeIndemnisationSerializer



