# calculs/calcul_dc_avec_assuralia.py

from .calculateur_rente import CalculateurRente
from decimal import Decimal

class CalculDCAvecAssuralia(CalculateurRente):
    def __init__(self, affilie, accident, data, is_manual_entry):
        super().__init__(affilie, accident, data, is_manual_entry)
        self.statut_chomage = data.get('statut_chomage', 'NON')

    def calculer_montant_journalier(self):
        # Calcul spécifique pour DC avec Assuralia
        # Le calcul dépend du statut de chômage
        if self.statut_chomage == 'OCCASIONNEL':
            facteur_chomage = Decimal('0.8')
        elif self.statut_chomage == 'LONGUE_DUREE':
            facteur_chomage = Decimal('0.6')
        else:
            facteur_chomage = Decimal('1')

        montant_journalier = (self.salaire_base * self.taux_ipp * facteur_chomage) / 365
        return montant_journalier

    def preparer_periodes(self):
        # Pour simplifier, nous supposons une période unique
        date_debut_str = self.data.get('date_debut')
        date_fin_str = self.data.get('date_fin')

        if not date_debut_str or not date_fin_str:
            raise ValueError('Les dates de début et de fin sont requises.')

        self.date_debut = self.parse_date(date_debut_str)
        self.date_fin = self.parse_date(date_fin_str)

        if self.date_debut is None or self.date_fin is None:
            raise ValueError('Format de date invalide pour les dates de début ou de fin.')

        if self.date_debut > self.date_fin:
            raise ValueError('La date de début ne peut pas être postérieure à la date de fin.')

        nombre_jours = (self.date_fin - self.date_debut).days + 1

        self.periodes.append({
            'debut': self.formater_date(self.date_debut),
            'fin': self.formater_date(self.date_fin),
            'nombre_jours': nombre_jours,
            'debut_date': self.date_debut,
            'fin_date': self.date_fin
        })

    def calculer_total(self):
        montant_journalier = self.calculer_montant_journalier()
        for periode in self.periodes:
            nombre_jours = periode['nombre_jours']
            total = montant_journalier * nombre_jours
            self.total_general += total
            periode['montant_journalier_rente'] = float(montant_journalier)
            periode['total'] = float(total)

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



# # calculs/calcul_dc_avec_assuralia.py

# from .calculateur_rente import CalculateurRente
# from decimal import Decimal
# from ..models import PeriodeIndemnisation

# class CalculDCAvecAssuralia(CalculateurRente):
#     def calculer_montant_journalier(self):
#         # Calcul spécifique pour DC avec Assuralia
#         statut_chomage = self.accident.statut_chomage
#         taux_ipp = self.taux_ipp

#         if statut_chomage == 'OCCASIONNEL':
#             # Calcul pour chômeur occasionnel
#             if taux_ipp < Decimal('0.15'):
#                 # Calcul pour IPP < 15%
#                 montant_journalier = (self.salaire_base * Decimal('0.80') * taux_ipp) / 365
#             else:
#                 # Calcul pour IPP >= 15%
#                 montant_journalier = (self.salaire_base * Decimal('0.90') * taux_ipp) / 365
#         elif statut_chomage == 'LONGUE_DUREE':
#             # Calcul pour chômeur de longue durée
#             if taux_ipp < Decimal('0.15'):
#                 montant_journalier = (self.salaire_base * Decimal('0.70') * taux_ipp) / 365
#             else:
#                 montant_journalier = (self.salaire_base * Decimal('0.80') * taux_ipp) / 365
#         else:
#             # Autres cas si nécessaire
#             montant_journalier = (self.salaire_base * taux_ipp) / 365

#         return montant_journalier

#     def preparer_periodes(self):
#         # La même logique que dans CalculAT
#         if self.is_manual_entry:
#             # ... (Copier la logique de CalculAT)
#             pass
#         else:
#             # ... (Copier la logique de CalculAT)
#             pass

#     def generer_commentaire(self):
#         # Personnaliser le commentaire si nécessaire
#         return super().generer_commentaire()

#     def generer_resultat(self):
#         self.calculer_total()
#         self.resultat = {
#             'affilie': {
#                 'nom': self.affilie.nom,
#                 'prenom': self.affilie.prenom,
#                 'niss': self.affilie.numero_registre_national,
#             },
#             'accident': {
#                 'date': self.formater_date(self.accident.date_accident),
#                 'taux_ipp': float(self.taux_ipp * 100),
#             },
#             'periodes': self.periodes,
#             'total_general': float(self.total_general),
#             'commentaire': self.generer_commentaire(),
#         }
#         return self.resultat

#     def calculer_total(self):
#         montant_journalier_rente = self.calculer_montant_journalier()
#         for periode in self.periodes:
#             nombre_jours = periode['nombre_jours']
#             total = montant_journalier_rente * nombre_jours
#             self.total_general += total
#             periode['montant_journalier_rente'] = float(montant_journalier_rente)
#             periode['total'] = float(total)
