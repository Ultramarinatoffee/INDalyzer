export const formaterDate = (dateString) => {
    if (!dateString) return 'Date non définie';

    // Vérifier si la date est au format 'YYYY-MM-DD'
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
    }

    // Vérifier si la date est au format 'DD/MM/YYYY'
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
        // La date est déjà au bon format
        return dateString;
    }

    // Tenter de créer un objet Date
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Date non valide';

    const day = (`0${date.getDate()}`).slice(-2);
    const month = (`0${date.getMonth() + 1}`).slice(-2); // Les mois commencent à 0 en JavaScript
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
};

export const formaterDatePourBackend = (dateString) => {
    if (!dateString) {
        console.error('Date invalide ou vide:', dateString);
        return null; // Utilisez null au lieu de ''
    }

    // Vérifier si la date est au format 'DD/MM/YYYY'
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
        const [day, month, year] = dateString.split('/');
        return `${year}-${month}-${day}`;
    }
    // Vérifier si la date est au format 'YYYY-MM-DD'
    else if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        return dateString;
    } else {
        console.error('Format de date inconnu:', dateString);
        return null; // Utilisez null au lieu de ''
    }
};

