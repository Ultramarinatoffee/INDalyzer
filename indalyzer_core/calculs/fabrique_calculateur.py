# calculs/fabrique_calculateur.py

from .calcul_at import CalculAT
from .calcul_dc_sans_assuralia import CalculDCSansAssuralia
from .calcul_dc_avec_assuralia import CalculDCAvecAssuralia

def obtenir_calculateur(affilie, accident, data, is_manual_entry):
    is_assuralia = accident.convention_assuralia
    is_dc = accident.type_accident == 'DC'

    if is_dc and not is_assuralia:
        return CalculDCSansAssuralia(affilie, accident, data, is_manual_entry)
    elif is_dc and is_assuralia:
        return CalculDCAvecAssuralia(affilie, accident, data, is_manual_entry)
    elif accident.type_accident == 'AT':
        return CalculAT(affilie, accident, data, is_manual_entry)
    else:
        raise ValueError("Type d'accident ou configuration non prise en charge")
