# calculs/calcul_dc_sans_assuralia.py

from .calculateur_rente import CalculateurRente
from decimal import Decimal
from datetime import timedelta
from indalyzer_core.models import PeriodeIndemnisation # type: ignore


class CalculDCSansAssuralia(CalculateurRente):
    def calculer_montant_journalier(self):
        # # Calcul spécifique pour DC sans Assuralia
        # montant_journalier = (self.salaire_base * self.taux_ipp) / 365
        # return montant_journalier
        # Cette méthode n'est plus nécessaire dans sa forme actuelle
        # Nous allons utiliser le montant journalier provenant de la base de données
        pass

    def preparer_periodes(self):
        # Vérifier que des dates de début et de fin ont été fournies par l'utilisateur
        if not self.data.get('periodes'):
            raise ValueError("Aucune période fournie pour le calcul.")

        self.periodes_calcul = []

        for idx, p in enumerate(self.data.get('periodes')):
            debut_str = p.get('dateDebut') or p.get('debut')
            fin_str = p.get('dateFin') or p.get('fin')
            taux_applicable = Decimal(p.get('taux', '100')) / 100  # Par défaut 100%
            taux_pourcent = int(taux_applicable * 100)

            if not debut_str or not fin_str:
                raise ValueError(f"Les dates de début et de fin sont requises pour la période {idx + 1}.")

            debut = self.parse_date(debut_str)
            fin = self.parse_date(fin_str)

            if debut is None or fin is None:
                raise ValueError(f"Format de date invalide pour la période {idx + 1}.")

            nombre_jours = (fin - debut).days + 1

            # Récupérer le montant journalier depuis la base de données pour cette période
            periodes_indemnisation = PeriodeIndemnisation.objects.filter(
                affilie=self.affilie,
                date_debut__lte=fin,
                date_fin__gte=debut
            ).order_by('date_debut')

            if not periodes_indemnisation.exists():
                raise ValueError(f"Aucune période d'indemnisation trouvée pour la période {idx + 1}.")

            # Gérer les cas où plusieurs périodes d'indemnisation couvrent la période saisie
            for periode_indemnisation in periodes_indemnisation:
                date_debut_periode = max(debut, periode_indemnisation.date_debut)
                date_fin_periode = min(fin, periode_indemnisation.date_fin)
                # nombre_jours_periode = (date_fin_periode - date_debut_periode).days + 1


                # Calculer le nombre total de jours de la période d'indemnisation en base de données
                total_jours_periode_indem = (periode_indemnisation.date_fin - periode_indemnisation.date_debut).days + 1

                # Récupérer le nombre de jours depuis la base de données pour cette période
                total_nombre_jours = periode_indemnisation.nombre_jours

                # Calculer le nombre de jours dans la sous-période
                jours_sous_periode = (date_fin_periode - date_debut_periode).days + 1

                # Calculer la proportion de la sous-période par rapport à la période totale
                proportion = jours_sous_periode / total_jours_periode_indem

                # Calculer le nombre de jours pour la sous-période en utilisant le nombre de jours depuis la base de données
                nombre_jours_periode = int(round(total_nombre_jours * proportion))

                taux_journalier = Decimal(periode_indemnisation.taux_journalier)

                montant_journalier = taux_journalier * taux_applicable

                self.periodes_calcul.append({
                    'debut': self.formater_date(date_debut_periode),
                    'fin': self.formater_date(date_fin_periode),
                    'nombre_jours': nombre_jours_periode,
                    'taux_journalier': taux_journalier,

                    # modification du 17/12/2024
                    # 'taux_applicable': taux_applicable,
                    'taux_applicable': taux_pourcent,
                    'montant_journalier_rente': montant_journalier,
                    'debut_date': date_debut_periode,
                    'fin_date': date_fin_periode
                })

        # Mettre à jour les dates de début et fin globales
        dates = [p['debut_date'] for p in self.periodes_calcul] + [p['fin_date'] for p in self.periodes_calcul]
        self.date_debut = min(dates)
        self.date_fin = max(dates)

    def calculer_total(self):
        for periode in self.periodes_calcul:
            montant_journalier = periode['montant_journalier_rente']
            nombre_jours = periode['nombre_jours']
            total = montant_journalier * nombre_jours
            self.total_general += total
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
            'periodes': self.periodes_calcul,
            'total_general': float(self.total_general),
            'commentaire': self.generer_commentaire(),
            'dc_sans_assuralia': True
        }
        return self.resultat


# # calculs/calcul_dc_sans_assuralia.py

# from .calculateur_rente import CalculateurRente
# from decimal import Decimal
# from ..models import PeriodeIndemnisation

# class CalculDCSansAssuralia(CalculateurRente):
#     def calculer_montant_journalier(self):
#         # Calcul spécifique pour DC sans Assuralia
#         montant_journalier = (self.salaire_base * self.taux_ipp) / 365
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
#         # Vous pouvez personnaliser les commentaires si nécessaire
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



# calculs/calcul_dc_sans_assuralia.py

# from .calculateur_rente import CalculateurRente
# from decimal import Decimal
# from datetime import timedelta
# from indalyzer_core.models import PeriodeIndemnisation # type: ignore


# class CalculDCSansAssuralia(CalculateurRente):
#     def calculer_montant_journalier(self):
#         # Calcul spécifique pour DC sans Assuralia
#         montant_journalier = (self.salaire_base * self.taux_ipp) / 365
#         return montant_journalier

#     def preparer_periodes(self):
#         # Gestion des périodes avec dégressivité
#         periodes_data = self.data.get('periodes', [])
#         if not periodes_data:
#             raise ValueError("Aucune période fournie pour le calcul")

#         dates = []
#         for idx, p in enumerate(periodes_data):
#             debut_str = p.get('dateDebut') or p.get('debut')
#             fin_str = p.get('dateFin') or p.get('fin')
#             taux_applicable = Decimal(p.get('taux', '100')) / 100  # Par défaut 100%

#             debut = self.parse_date(debut_str)
#             fin = self.parse_date(fin_str)

#             if debut is None or fin is None:
#                 raise ValueError(f"Format de date invalide pour la période {idx}")

#             nombre_jours = (fin - debut).days + 1

#             self.periodes.append({
#                 'debut': self.formater_date(debut),
#                 'fin': self.formater_date(fin),
#                 'nombre_jours': nombre_jours,
#                 'taux_applicable': taux_applicable,
#                 'debut_date': debut,
#                 'fin_date': fin
#             })

#             dates.extend([debut, fin])

#         if not dates:
#             raise ValueError("Aucune date valide trouvée dans les périodes")

#         self.date_debut = min(dates)
#         self.date_fin = max(dates)

#     def calculer_total(self):
#         for periode in self.periodes:
#             taux_applicable = periode['taux_applicable']
#             montant_journalier = self.calculer_montant_journalier() * taux_applicable
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



#  def preparer_periodes(self):
#         # Vérifier que des périodes ont été fournies
#         if not self.periodes:
#             raise ValueError("Aucune période fournie pour le calcul.")

#         dates = []
#         for idx, p in enumerate(self.periodes):
#             debut_str = p.get('dateDebut') or p.get('debut')
#             fin_str = p.get('dateFin') or p.get('fin')
#             taux_applicable = Decimal(p.get('taux', '100')) / 100  # Par défaut 100%

#             if not debut_str or not fin_str:
#                 raise ValueError(f"Les dates de début et de fin sont requises pour la période {idx + 1}.")

#             debut = self.parse_date(debut_str)
#             fin = self.parse_date(fin_str)

#             if debut is None or fin is None:
#                 raise ValueError(f"Format de date invalide pour la période {idx + 1}.")

#             nombre_jours = (fin - debut).days + 1

#             self.periodes_calcul.append({
#                 'debut': self.formater_date(debut),
#                 'fin': self.formater_date(fin),
#                 'nombre_jours': nombre_jours,
#                 'taux_applicable': taux_applicable,
#                 'debut_date': debut,
#                 'fin_date': fin
#             })

#             dates.extend([debut, fin])

#         if not dates:
#             raise ValueError("Aucune date valide trouvée dans les périodes.")

#         self.date_debut = min(dates)
#         self.date_fin = max(dates)