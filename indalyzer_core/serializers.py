from rest_framework import serializers
from .models import Affilie, Accident, CalculIndemnite, PeriodeIndemnisation

class PeriodeIndemnisationSerializer(serializers.ModelSerializer):
    class Meta:
        model = PeriodeIndemnisation
        fields = '__all__'


class AccidentSerializer(serializers.ModelSerializer):
    
    date_accident = serializers.DateField(format='%d/%m/%Y')
    type_accident_display = serializers.CharField(source='get_type_accident_display')

    class Meta:
        model = Accident
        fields = ['id', 'date_accident', 'type_accident', 'type_accident_display', 'statut_chomage', 'convention_assuralia']


class AffilieSerializer(serializers.ModelSerializer):
    accidents = AccidentSerializer(many=True, read_only=True)

    class Meta:
        model = Affilie
        fields = ['id', 'numero_registre_national', 'numero_externe', 'nom', 'prenom', 'date_naissance', 'email', 'accidents']

class CalculIndemniteSerializer(serializers.ModelSerializer):
    class Meta:
        model = CalculIndemnite
        fields = '__all__'