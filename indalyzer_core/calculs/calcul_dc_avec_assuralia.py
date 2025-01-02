# calculs/calcul_dc_avec_assuralia.py

from .calculateur_rente import CalculateurRente
from decimal import Decimal
from indalyzer_core.models import PeriodeIndemnisation # type: ignore

class CalculDCAvecAssuralia(CalculateurRente):

    """
    Classe permettant de calculer les rentes pour un accident de Droit Commun AVEC la convention Assuralia.
    On y applique un facteur de chômage (OCCASIONNEL, LONGUE_DUREE)
    AUCUNE dégressivité dans ce scénario (à la différence de DC sans Assuralia).
    """

    def __init__(self, affilie, accident, data, is_manual_entry):
        super().__init__(affilie, accident, data, is_manual_entry)
        self.statut_chomage = data.get('statut_chomage', 'NON')
        
    
    def preparer_periodes(self):

            periodes_data = self.data.get('periodes', [])
            if not periodes_data:
                # Si vous souhaitez supporter un UNIQUE intervalle via date_debut/date_fin,
                # faites Option A : regarder data['date_debut'] / data['date_fin'] directement
                raise ValueError("Aucune période fournie pour DC avec Assuralia.")

            self.periodes_calcul = []

            for idx, periode_input in enumerate(periodes_data):
                debut_str = periode_input.get('dateDebut') or periode_input.get('debut')
                fin_str = periode_input.get('dateFin') or periode_input.get('fin')

                if not debut_str or not fin_str:
                    raise ValueError(f"Les dates de début et fin sont requises pour la période #{idx+1}.")

                debut = self.parse_date(debut_str)
                fin = self.parse_date(fin_str)

                if not debut or not fin:
                    raise ValueError(
                        f"Format de date invalide pour la période #{idx+1} "
                        f"(début={debut_str}, fin={fin_str})."
                    )

                # On récupère en base toutes les periodes d'indemnisation qui se chevauchent
                periodes_db = PeriodeIndemnisation.objects.filter(
                    affilie=self.affilie,
                    date_debut__lte=fin,
                    date_fin__gte=debut
                ).order_by('date_debut')

                if not periodes_db.exists():
                    raise ValueError(
                        f"Aucune période d'indemnisation trouvée pour la période #{idx+1} "
                        f"(du {debut_str} au {fin_str})."
                    )

                # Pour chaque enregistrement, calculer la sous-période chevauchée
                for periode_db in periodes_db:
                    date_debut_bd = max(debut, periode_db.date_debut)
                    date_fin_bd   = min(fin, periode_db.date_fin)

                    nb_jours_sous = (date_fin_bd - date_debut_bd).days + 1
                    if nb_jours_sous < 1:
                        # Pas de chevauchement réel
                        continue

                    # Nombre total de jours BD (par ex. 31 si c'était 1er-31 mai),
                    # ainsi que le nombre_jours "payables" (excluant dimanches, etc.)
                    total_jours_bd = (periode_db.date_fin - periode_db.date_debut).days + 1
                    total_nombre_jours = periode_db.nombre_jours  # déjà sans dimanches ?

                    proportion = 0
                    if total_jours_bd > 0:
                        proportion = nb_jours_sous / total_jours_bd
                    nb_jours_payables = int(round(total_nombre_jours * proportion))

                    # Récupère le taux_journalier depuis la BD
                    taux_journalier_bd = Decimal(periode_db.taux_journalier)

                    # Applique la logique "chômage + IPP"
                    montant_journalier_final = self.calculer_montant_journalier(taux_journalier_bd)

                    self.periodes_calcul.append({
                        'debut': self.formater_date(date_debut_bd),
                        'fin':   self.formater_date(date_fin_bd),
                        'nombre_jours': nb_jours_payables,
                        'taux_journalier': float(taux_journalier_bd),
                        'montant_journalier_rente': float(montant_journalier_final),
                        'debut_date': date_debut_bd,
                        'fin_date':   date_fin_bd
                    })

            # Déterminer la date_debut/date_fin globales
            if self.periodes_calcul:
                all_starts = [p['debut_date'] for p in self.periodes_calcul]
                all_ends   = [p['fin_date']   for p in self.periodes_calcul]
                self.date_debut = min(all_starts)
                self.date_fin   = max(all_ends)
            else:
                raise ValueError("Aucune sous-période calculée pour DC avec Assuralia.")


    def calculer_montant_journalier(self, montant_journalier_bd):

        if self.statut_chomage == 'OCCASIONNEL':
            facteur_chomage = Decimal('0.8')
        elif self.statut_chomage == 'LONGUE_DUREE':
            facteur_chomage = Decimal('1.0')           
        else:           
            facteur_chomage = Decimal('1.0')
  

        # 2) Appliquer le taux d'IPP (pour ITT, c'est 1.0)
        #    self.taux_ipp peut être None => dans ce cas, on considère 0.0 ou 1.0
        taux_ipp = self.taux_ipp if self.taux_ipp is not None else Decimal('0.0')

        # Exemples de formules possibles :
        # a) (montant_journalier_bd * taux_ipp * facteur_chomage)
        #    si IPP<1 => c'est un partiel
        # b) si c'est ITT, self.taux_ipp == 1 => on n’a pas besoin de multiplier par 312, etc.
        #    dépend des règles réelles de calcul.

        # Pour l’exemple, on multiplie par (taux_ipp * facteur_chomage) si c’est IPP,
        # ou par facteur_chomage seul si c’est ITT = 1.0
        # 
        # => Adaptez à votre métier
        montant_final = montant_journalier_bd * taux_ipp * facteur_chomage

        return montant_final


    def calculer_total(self):

        for periode in self.periodes_calcul:
            montant_journalier = Decimal(str(periode['montant_journalier_rente']))
            nb_jours = periode['nombre_jours']
            total = montant_journalier * nb_jours
            self.total_general += total
            # Convertir en float pour le JSON final
            periode['montant_journalier_rente'] = float(montant_journalier)
            periode['total'] = float(total)

    def generer_resultat(self):

        self.calculer_total()
        self.resultat = {
            'affilie': {
                'nom':   self.affilie.nom,
                'prenom': self.affilie.prenom,
                'niss':   self.affilie.numero_registre_national,
            },
            'accident': {
                'date': self.formater_date(self.accident.date_accident),
                'taux_ipp': float(self.taux_ipp * 100) if self.taux_ipp else 0.0,
            },
            'periodes': self.periodes_calcul,
            'total_general': float(self.total_general),
            'commentaire': self.generer_commentaire(),
            'dc_avec_assuralia': True
        }
        return self.resultat



# avant modif du 02/01/2025:

# # calculs/calcul_dc_avec_assuralia.py

# from .calculateur_rente import CalculateurRente
# from decimal import Decimal

# class CalculDCAvecAssuralia(CalculateurRente):
#     def __init__(self, affilie, accident, data, is_manual_entry):
#         super().__init__(affilie, accident, data, is_manual_entry)
#         self.statut_chomage = data.get('statut_chomage', 'NON')

#     def calculer_montant_journalier(self):
#         # Calcul spécifique pour DC avec Assuralia
#         # Le calcul dépend du statut de chômage
#         if self.statut_chomage == 'OCCASIONNEL':
#             facteur_chomage = Decimal('0.8')
#         elif self.statut_chomage == 'LONGUE_DUREE':
#             facteur_chomage = Decimal('0.6')
#         else:
#             facteur_chomage = Decimal('1')

#         montant_journalier = (self.salaire_base * self.taux_ipp * facteur_chomage) / 365
#         return montant_journalier

#     def preparer_periodes(self):
#         # Pour simplifier, nous supposons une période unique
#         date_debut_str = self.data.get('date_debut')
#         date_fin_str = self.data.get('date_fin')

#         if not date_debut_str or not date_fin_str:
#             raise ValueError('Les dates de début et de fin sont requises.')

#         self.date_debut = self.parse_date(date_debut_str)
#         self.date_fin = self.parse_date(date_fin_str)

#         if self.date_debut is None or self.date_fin is None:
#             raise ValueError('Format de date invalide pour les dates de début ou de fin.')

#         if self.date_debut > self.date_fin:
#             raise ValueError('La date de début ne peut pas être postérieure à la date de fin.')

#         nombre_jours = (self.date_fin - self.date_debut).days + 1

#         self.periodes.append({
#             'debut': self.formater_date(self.date_debut),
#             'fin': self.formater_date(self.date_fin),
#             'nombre_jours': nombre_jours,
#             'debut_date': self.date_debut,
#             'fin_date': self.date_fin
#         })

#     def calculer_total(self):
#         montant_journalier = self.calculer_montant_journalier()
#         for periode in self.periodes:
#             nombre_jours = periode['nombre_jours']
#             total = montant_journalier * nombre_jours
#             self.total_general += total
#             periode['montant_journalier_rente'] = float(montant_journalier)
#             periode['total'] = float(total)

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






