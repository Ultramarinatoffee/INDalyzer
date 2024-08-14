from rest_framework import serializers
from .models import Affilie, Accident, CalculIndemnite, PeriodeIndemnisation

class PeriodeIndemnisationSerializer(serializers.ModelSerializer):
    class Meta:
        model = PeriodeIndemnisation
        fields = '__all__'

class AffilieSerializer(serializers.ModelSerializer):
    periodes_indemnisation = PeriodeIndemnisationSerializer(many=True, read_only=True)
    
    class Meta:
        model = Affilie
        fields = '__all__'

class AccidentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Accident
        fields = '__all__'

class CalculIndemniteSerializer(serializers.ModelSerializer):
    class Meta:
        model = CalculIndemnite
        fields = '__all__'