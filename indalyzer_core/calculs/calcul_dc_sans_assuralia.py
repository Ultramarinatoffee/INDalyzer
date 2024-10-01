# calculs/calcul_dc_sans_assuralia.py

from .calculateur_rente import CalculateurRente
from decimal import Decimal
from ..models import PeriodeIndemnisation

class CalculDCSansAssuralia(CalculateurRente):
    def calculer_montant_journalier(self):
        # Calcul spécifique pour DC sans Assuralia
        montant_journalier = (self.salaire_base * self.taux_ipp) / 365
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
        # Vous pouvez personnaliser les commentaires si nécessaire
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
