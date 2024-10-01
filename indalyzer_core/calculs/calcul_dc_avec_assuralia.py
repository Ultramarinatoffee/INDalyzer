# calculs/calcul_dc_avec_assuralia.py

from .calculateur_rente import CalculateurRente
from decimal import Decimal
from ..models import PeriodeIndemnisation

class CalculDCAvecAssuralia(CalculateurRente):
    def calculer_montant_journalier(self):
        # Calcul spécifique pour DC avec Assuralia
        statut_chomage = self.accident.statut_chomage
        taux_ipp = self.taux_ipp

        if statut_chomage == 'OCCASIONNEL':
            # Calcul pour chômeur occasionnel
            if taux_ipp < Decimal('0.15'):
                # Calcul pour IPP < 15%
                montant_journalier = (self.salaire_base * Decimal('0.80') * taux_ipp) / 365
            else:
                # Calcul pour IPP >= 15%
                montant_journalier = (self.salaire_base * Decimal('0.90') * taux_ipp) / 365
        elif statut_chomage == 'LONGUE_DUREE':
            # Calcul pour chômeur de longue durée
            if taux_ipp < Decimal('0.15'):
                montant_journalier = (self.salaire_base * Decimal('0.70') * taux_ipp) / 365
            else:
                montant_journalier = (self.salaire_base * Decimal('0.80') * taux_ipp) / 365
        else:
            # Autres cas si nécessaire
            montant_journalier = (self.salaire_base * taux_ipp) / 365

        return montant_journalier

    def preparer_periodes(self):
        # La même logique que dans CalculAT
        if self.is_manual_entry:
            # ... (Copier la logique de CalculAT)
            pass
        else:
            # ... (Copier la logique de CalculAT)
            pass

    def generer_commentaire(self):
        # Personnaliser le commentaire si nécessaire
        return super().generer_commentaire()

    def generer_resultat(self):
        self.calculer_total()
        self.resultat = {
            'affilie': {
                'nom': self.affilie.nom,
                'prenom': self.affilie.prenom,
                'niss': self.affilie.numero_registre_national,
            },
            'accident': {
                'date': self.formater_date(self.accident.date_accident),
                'taux_ipp': float(self.taux_ipp * 100),
            },
            'periodes': self.periodes,
            'total_general': float(self.total_general),
            'commentaire': self.generer_commentaire(),
        }
        return self.resultat

    def calculer_total(self):
        montant_journalier_rente = self.calculer_montant_journalier()
        for periode in self.periodes:
            nombre_jours = periode['nombre_jours']
            total = montant_journalier_rente * nombre_jours
            self.total_general += total
            periode['montant_journalier_rente'] = float(montant_journalier_rente)
            periode['total'] = float(total)
