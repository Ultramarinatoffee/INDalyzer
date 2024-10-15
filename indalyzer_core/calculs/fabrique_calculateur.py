# calculs/fabrique_calculateur.py

from .calcul_at import CalculAT
from .calcul_dc_sans_assuralia import CalculDCSansAssuralia
from .calcul_dc_avec_assuralia import CalculDCAvecAssuralia

def obtenir_calculateur(affilie, accident, data, is_manual_entry):
    is_assuralia = data.get('convention_assuralia', False)


    if isinstance(is_assuralia, str):
        is_assuralia = is_assuralia.lower() == 'true'


    is_dc = accident.type_accident == 'DC'

    print(f"accident.convention_assuralia: {accident.convention_assuralia} (type: {type(accident.convention_assuralia)})")
    print(f"is_assuralia: {is_assuralia} (type: {type(is_assuralia)})")
    print(f"is_dc: {is_dc}")


    if is_dc and not is_assuralia:
        return CalculDCSansAssuralia(affilie, accident, data, is_manual_entry)
    elif is_dc and is_assuralia:
        return CalculDCAvecAssuralia(affilie, accident, data, is_manual_entry)
    elif accident.type_accident == 'AT':
        return CalculAT(affilie, accident, data, is_manual_entry)
    else:
        raise ValueError("Type d'accident ou configuration non prise en charge")
