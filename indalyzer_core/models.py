from django.db import models
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from datetime import timedelta
from datetime import date

class Affilie(models.Model):
    numero_registre_national = models.CharField(max_length=11, unique=True, verbose_name="Numéro de registre national")
    numero_externe = models.CharField(max_length=20, unique=True, verbose_name="Numéro externe", null=True, blank=True)
    nom = models.CharField(max_length=100)
    prenom = models.CharField(max_length=100)
    date_naissance = models.DateField()
    email = models.EmailField(default='example@example.com') # pour développer la fonction d'envoi d'une notification
    
    def __str__(self):
        numero_externe = f": {self.numero_externe}" if self.numero_externe else "Aff: Non défini"
        return f"{self.nom} {self.prenom} - RN: {self.numero_registre_national} - {numero_externe}"
    
    class Meta:
        indexes = [
            models.Index(fields=['numero_registre_national']),
            models.Index(fields=['numero_externe']),  
            models.Index(fields=['nom', 'prenom']),
        ]
    def periodes_indemnisation_groupees(self):
        periodes = list(self.periodes_indemnisation.all())
        groupees = []
        current_group = None

        for periode in periodes:
            if not current_group or periode.taux_journalier != current_group['taux_journalier'] or periode.date_debut != current_group['date_fin'] + timedelta(days=1):
                if current_group:
                    groupees.append(current_group)
                current_group = {
                    'date_debut': periode.date_debut,
                    'date_fin': periode.date_fin,
                    'taux_journalier': periode.taux_journalier,
                    'nombre_jours': periode.nombre_jours
                }
            else:
                current_group['date_fin'] = periode.date_fin
                current_group['nombre_jours'] += periode.nombre_jours

        if current_group:
            groupees.append(current_group)

        return groupees

class Accident(models.Model):
    TYPES_ACCIDENT = [
        ('AT', 'Accident de travail'),
        ('DC', 'Droit commun'),
        ('Autre', 'Autre accident') # pour les accidents de la vie privée, sans récupération etc...
    ]
    STATUT_CHOMAGE = [
        ('NON', 'Non applicable'),
        ('OCCASIONNEL', 'Chômeur occasionnel'),
        ('LONGUE_DUREE', 'Chômeur de longue durée'),
    ]
    
    affilie = models.ForeignKey(Affilie, on_delete=models.CASCADE, related_name='accidents')
    date_accident = models.DateField(null=True, blank=True)
    source_donnees = models.CharField(max_length=10, choices=[('BD', 'Base de données'), ('MANUEL', 'Encodage manuel')])
    type_accident = models.CharField(max_length=6, choices=TYPES_ACCIDENT)
    statut_chomage = models.CharField(max_length=15, choices=STATUT_CHOMAGE, default='NON_APPLICABLE')
    convention_assuralia = models.BooleanField(default=False)

    def clean(self):
        if self.type_accident == 'AT' and self.statut_chomage != 'NON_APPLICABLE':
            raise ValidationError('Le statut de chômage doit être "Non applicable" pour un accident de travail.')
        if self.type_accident == 'DC' and self.convention_assuralia and self.statut_chomage == 'NON_APPLICABLE':
            raise ValidationError('Le statut de chômage doit être spécifié pour un droit commun avec la convention ASSURALIA.')
        if self.type_accident not in dict(self.TYPES_ACCIDENT):
            raise ValidationError("Type d'accident non valide.")


    def __str__(self):
        return f"Accident de {self.affilie} le {self.date_accident} - Type: {self.get_type_accident_display()}"  # pylint: disable=no-member



    def get_type_accident_display(self):
        return dict(self.TYPES_ACCIDENT).get(self.type_accident, self.type_accident)
    


class CalculIndemnite(models.Model):
    TYPES_CALCUL = [
        ('IET', 'Incapacité Temporaire'),
        ('IPP', 'Incapacité Permanente Partielle'),
    ]
    SOURCES_MONTANT = [
        ('CALCULE', 'Calculé automatiquement'),
        ('RECUPERE', 'Récupéré de données existantes'),
        ('ENCODE', 'Encodé manuellement'),
    ]

    nom_affilie = models.CharField(max_length=100)
    prenom_affilie = models.CharField(max_length=100)
    numero_registre_national = models.CharField(max_length=11)
    date_naissance = models.DateField()

    # Référence optionnelle à un Affilie enregistré
    affilie = models.ForeignKey(Affilie, on_delete=models.SET_NULL, null=True, blank=True)


    accident = models.ForeignKey(Accident, on_delete=models.CASCADE)
    type_calcul = models.CharField(max_length=3, choices=TYPES_CALCUL)
    date_calcul = models.DateTimeField(auto_now_add=True)
    source_montant = models.CharField(max_length=10, choices=SOURCES_MONTANT, default='ENCODE')
    salaire_reference = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    taux_incapacite = models.DecimalField(max_digits=5, decimal_places=2)
    date_debut = models.DateField(null=True, blank=True)
    date_fin = models.DateField(null=True, blank=True)
    date_consolidation = models.DateField(null=True, blank=True)
    montant = models.DecimalField(max_digits=10, decimal_places=2)
    montant_calcule = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    taux_journalier = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    nombre_jours = models.IntegerField(null=True, blank=True)
    total = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    details = models.JSONField(null=True, blank=True) # à précisier????? c'est quoi?
    utilisateur = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)  # L'utilisateur qui a effectué le calcul
    commentaire = models.TextField(blank=True, null=True) 

    def clean(self):
        if self.accident.type_accident == 'AT' and not self.salaire_reference: # pylint: disable=E1101
            raise ValidationError('Le salaire de référence est requis pour les accidents de travail.')
        
    def __str__(self):
        return f"Calcul {self.type_calcul} pour {self.accident.affilie} du {self.date_calcul}"  # pylint: disable=E1101
    
    def get_type_calcul_display(self):
          # This method returns the display value for the type_calcul field
        return dict(self.TYPES_CALCUL).get(self.type_calcul, self.type_calcul)
    
class PeriodeIndemnisation(models.Model):
    affilie = models.ForeignKey(Affilie, on_delete=models.CASCADE, related_name='periodes_indemnisation')
    date_debut = models.DateField()
    date_fin = models.DateField()
    nombre_jours = models.PositiveIntegerField()
    taux_journalier = models.DecimalField(max_digits=10, decimal_places=2)

    def clean(self):
        if self.date_fin < self.date_debut:
            raise ValidationError("La date de fin ne peut pas être antérieure à la date de début.")
        
        # Vérifier que la période ne dépasse pas un an
        if (self.date_fin - self.date_debut).days > 365:
            raise ValidationError("La période d'indemnisation ne peut pas dépasser un an.")

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

    class Meta:
        ordering = ['date_debut']

    def __str__(self):
        return f"{self.affilie} - Du {self.date_debut} au {self.date_fin}"
