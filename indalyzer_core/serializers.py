from rest_framework import serializers
from .models import Affilie, Accident, CalculIndemnite, PeriodeIndemnisation

class PeriodeIndemnisationSerializer(serializers.ModelSerializer):
    class Meta:
        model = PeriodeIndemnisation
        fields = '__all__'


class AccidentSerializer(serializers.ModelSerializer):
    
    date_accident = serializers.DateField(format='%d/%m/%Y')
    date_consolidation = serializers.DateField(format='%d/%m/%Y', required=False)
    type_accident_display = serializers.CharField(source='get_type_accident_display')
    taux_IPP = serializers.IntegerField(min_value=0, max_value=100, required=False)

    class Meta:
        model = Accident
        fields = ['id', 'date_accident', 'type_accident', 'type_accident_display', 
                  'date_consolidation', 'taux_IPP', 'salaire_base', 'statut_chomage', 
                  'convention_assuralia']

class AffilieSerializer(serializers.ModelSerializer):
    accidents = AccidentSerializer(many=True, read_only=True)

    class Meta:
        model = Affilie
        fields = ['id', 'numero_registre_national', 'numero_externe', 'nom', 'prenom', 'date_naissance', 'email', 'accidents']

class CalculIndemniteSerializer(serializers.ModelSerializer):
    class Meta:
        model = CalculIndemnite
        fields = ['id', 'nom_affilie', 'prenom_affilie', 'numero_registre_national', 
                  'date_naissance', 'affilie', 'accident', 'type_calcul', 'date_calcul', 
                  'source_montant', 'date_debut', 'date_fin', 'montant', 'montant_calcule', 
                  'taux_journalier', 'nombre_jours', 'total', 'details', 'utilisateur', 
                  'commentaire']