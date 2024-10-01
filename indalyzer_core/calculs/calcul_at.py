# calculs/calcul_at.py

from indalyzer_core.calculs.calculateur_rente import CalculateurRente
from decimal import Decimal
from indalyzer_core.models import PeriodeIndemnisation

class CalculAT(CalculateurRente):
    def calculer_montant_journalier(self):
        montant_journalier = (self.salaire_base * Decimal('0.8693') * self.taux_ipp) / 312

        if self.taux_ipp < Decimal('0.05'):
            montant_journalier *= Decimal('0.5')
        elif self.taux_ipp < Decimal('0.10'):
            montant_journalier *= Decimal('0.75')

        return montant_journalier

    def preparer_periodes(self):
        if self.is_manual_entry:
            periodes_data = self.data.get('periodes', [])
            if not periodes_data:
                raise ValueError("Aucune période fournie pour l'encodage manuel")

            dates = []
            for idx, p in enumerate(periodes_data):
                debut_str = p.get('dateDebut') or p.get('debut')
                fin_str = p.get('dateFin') or p.get('fin')

                debut = self.parse_date(debut_str)
                fin = self.parse_date(fin_str)

                if debut is None or fin is None:
                    raise ValueError(f"Format de date invalide pour la période {idx}")

                nombre_jours = int(p.get('nombreJours') or p.get('nombre_jours') or (fin - debut).days + 1)

                self.periodes.append({
                    'debut': self.formater_date(debut),
                    'fin': self.formater_date(fin),
                    'nombre_jours': nombre_jours,
                    'debut_date': debut,
                    'fin_date': fin
                })

                dates.extend([debut, fin])

            if not dates:
                raise ValueError("Aucune date valide trouvée dans les périodes")

            self.date_debut = min(dates)
            self.date_fin = max(dates)
        else:
            date_debut_str = self.data.get('date_debut')
            date_fin_str = self.data.get('date_fin')

            if not date_debut_str or not date_fin_str:
                raise ValueError('Les dates de début et de fin sont requises pour le calcul non manuel.')

            self.date_debut = self.parse_date(date_debut_str)
            self.date_fin = self.parse_date(date_fin_str)

            if self.date_debut is None or self.date_fin is None:
                raise ValueError('Format de date invalide pour les dates de début ou de fin.')

            if self.date_debut > self.date_fin:
                raise ValueError('La date de début ne peut pas être postérieure à la date de fin.')

            periodes_db = PeriodeIndemnisation.objects.filter(
                affilie=self.affilie,
                date_debut__lte=self.date_fin,
                date_fin__gte=self.date_debut
            ).order_by('date_debut')

            if not periodes_db.exists():
                raise ValueError('Aucune période d\'indemnisation trouvée pour les dates fournies.')

            for periode in periodes_db:
                debut_calcul = max(periode.date_debut, self.date_debut)
                fin_calcul = min(periode.date_fin, self.date_fin)
                nombre_jours = (fin_calcul - debut_calcul).days + 1

                self.periodes.append({
                    'debut': self.formater_date(debut_calcul),
                    'fin': self.formater_date(fin_calcul),
                    'nombre_jours': nombre_jours,
                    'debut_date': debut_calcul,
                    'fin_date': fin_calcul
                })

    # def generer_commentaire(self):


 # Modification après avoir modifié le mot commentaire à type de calcul: debut

        # type_commentaire = self.data.get('type_commentaire', 'AUTRE')      
        # commentaire_texte = self.data.get('commentaire_texte', '')

        # if type_commentaire == 'IPP':
        #     return f"Reconnaissance d'une IPP de {self.accident.taux_IPP}% à partir du {self.formater_date(self.accident.date_consolidation)}"
        # elif type_commentaire == 'AGGRAVATION':
        #     return f"Aggravation d'une IPP passée à {self.accident.taux_IPP}% à partir du {self.formater_date(self.accident.date_consolidation)}"
        # elif type_commentaire == 'ITT':
        #     return f"Reconnaissance d'une ITT à 100% pour la période du {self.formater_date(self.date_debut)} au {self.formater_date(self.date_fin)}"
        # elif type_commentaire == 'SALAIRE':
        #     return f"Modification du salaire de base à {self.accident.salaire_base}€ à partir du {self.formater_date(self.accident.date_consolidation)}"
        # elif commentaire_texte:
        #     return commentaire_texte
        # else:
        #     return "Aucun commentaire spécifié"
        
        # type_calcul = self.data.get('type_calcul', 'AUTRE')  
        # commentaire_texte = self.data.get('commentaire_texte', '')

        # if type_calcul == 'IPP':
        #     return f"Reconnaissance d'une IPP de {self.accident.taux_IPP}% à partir du {self.formater_date(self.accident.date_consolidation)}"
        # elif type_calcul == 'AGGRAVATION':
        #     return f"Aggravation d'une IPP passée à {self.accident.taux_IPP}% à partir du {self.formater_date(self.accident.date_consolidation)}"
        # elif type_calcul == 'ITT':
        #     return f"Reconnaissance d'une ITT à 100% pour la période du {self.formater_date(self.date_debut)} au {self.formater_date(self.date_fin)}"
        # elif type_calcul == 'SALAIRE':
        #     return f"Modification du salaire de base à {self.accident.salaire_base}€ à partir du {self.formater_date(self.accident.date_consolidation)}"
        # elif commentaire_texte:
        #     return commentaire_texte
        # else:
        #     return "Aucun commentaire spécifié"
        

        # Modification après avoir modifié le mot commentaire à type de calcul: fin

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
                'taux_ipp': float(self.taux_ipp * 100),  # Convertir en pourcentage
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
