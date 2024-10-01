# calculs/calculateur_rente.py

from abc import ABC, abstractmethod
from decimal import Decimal
from datetime import datetime, date
import json

class CalculateurRente(ABC):
    def __init__(self, affilie, accident, data, is_manual_entry):
        self.affilie = affilie
        self.accident = accident
        self.data = data
        self.is_manual_entry = is_manual_entry



        #  Modifications après avoir modifier commentaire à type de calcul:    
         # """"""""""""""""""""""""""""""""""""""""""""""""""""

        # self.taux_ipp = Decimal(accident.taux_IPP) / 100
        # self.salaire_base = Decimal(accident.salaire_base)

        # Récupérer 'type_calcul' et 'commentaire_texte' depuis 'data'
        self.type_calcul = data.get('type_calcul', 'AUTRE')
        self.commentaire_texte = data.get('commentaire_texte', '')

        self.type_accident = self.accident.type_accident  # 'AT' ou 'DC'

        # Initialiser 'taux_ipp' en fonction de 'type_calcul'
        if self.type_calcul == 'ITT':
            self.taux_ipp = Decimal('1')  # 100% pour ITT
        else:
            if accident.taux_IPP is not None:
                self.taux_ipp = Decimal(accident.taux_IPP) / 100
            else:
                self.taux_ipp = None  # Ou lever une exception si nécessaire

        # Initialiser 'salaire_base'
        if accident.salaire_base is not None:
            self.salaire_base = Decimal(accident.salaire_base)
        else:
            self.salaire_base = None  # Ou lever une exception si nécessaire

        # """"""""""""""""""""""""""""""""""""""""""""""""""""
        #  Modifications après modifier commentaire à type de calcul:    




        self.resultat = {}
        self.periodes = []
        self.total_general = Decimal('0')
        self.date_debut = None
        self.date_fin = None


    def generer_commentaire(self):
        if self.type_calcul == 'IPP':
            return f"{self.type_accident} - Reconnaissance d'une IPP de {self.accident.taux_IPP}% à partir du {self.formater_date(self.accident.date_consolidation)}"
        elif self.type_calcul == 'AGGRAVATION':
            return f"{self.type_accident} - Aggravation d'une IPP à {self.accident.taux_IPP}% à partir du {self.formater_date(self.accident.date_consolidation)}"
        elif self.type_calcul == 'ITT':
            return f"{self.type_accident} - Reconnaissance d'une ITT à 100% pour la période du {self.formater_date(self.date_debut)} au {self.formater_date(self.date_fin)}"
        elif self.type_calcul == 'SALAIRE':
            return f"{self.type_accident} - Modification du salaire de base à {self.salaire_base}€ à partir du {self.formater_date(self.accident.date_consolidation)}"
        elif self.commentaire_texte:
            return self.commentaire_texte
        else:
            return "Aucun commentaire spécifié"

    def parse_date(self, date_str):
        for fmt in ('%Y-%m-%d', '%d/%m/%Y'):
            try:
                return datetime.strptime(date_str, fmt).date()
            except ValueError:
                continue
        return None

    def formater_date(self, date_input):
        if not date_input:
            return 'date non définie'
        if isinstance(date_input, str):
            try:
                date_input = datetime.strptime(date_input, '%Y-%m-%d').date()
            except ValueError:
                return 'date non valide'
        elif isinstance(date_input, datetime):
            date_input = date_input.date()
        elif not isinstance(date_input, date):
            return 'date non valide'

        return date_input.strftime('%d/%m/%Y')
    

    @abstractmethod
    def calculer_montant_journalier(self):
        pass

    @abstractmethod
    def preparer_periodes(self):
        pass

    @abstractmethod
    def generer_resultat(self):
        pass

    # @abstractmethod
    # def generer_commentaire(self):
    #     pass
