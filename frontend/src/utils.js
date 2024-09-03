export const formaterDate = (dateString) => {
    if (!dateString) return 'date non définie';

    // Vérifier si le format est DD/MM/YYYY
    const dateParts = dateString.split('/');
    if (dateParts.length === 3) {
        // Convertir en format YYYY-MM-DD pour une meilleure compatibilité avec le constructeur Date
        const formattedDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
        const date = new Date(formattedDate);

        // Vérifier si la date est valide
        if (isNaN(date.getTime())) {
            return 'Date non valide';
        }

        return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }

    // Sinon, tenter de créer la date directement
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Date non valide'; // Gérer les cas où la date n'est pas valide
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

export const formaterDatePourBackend = (dateString) => {
    if (!dateString) return '';

    // Si la date est déjà au format YYYY-MM-DD, la retourner telle quelle
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        return dateString;
    }

    // Vérifier si le format est DD/MM/YYYY
    const dateParts = dateString.split('/');
    if (dateParts.length === 3) {
        // Convertir en format YYYY-MM-DD
        return `${dateParts[2]}-${dateParts[1].padStart(2, '0')}-${dateParts[0].padStart(2, '0')}`;
    }

    // Tenter de créer la date directement
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return ''; // Retourner une chaîne vide si la date n'est pas valide

    // Formater la date en YYYY-MM-DD
    return date.toISOString().split('T')[0];
};


// export const formaterDate = (dateString) => {
//     if (!dateString) return 'date non définie';
//     const date = new Date(dateString);
//     return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
//   };

//   export const formaterDate = (dateString) => {
//     if (!dateString) return 'date non définie';

//     const date = new Date(dateString);

//     // Vérifier si la date est valide
//     if (isNaN(date.getTime())) {
//         return 'Date non valide';
//     }

//     return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
// };

// export const formaterDate = (dateString) => {
//     if (!dateString) return 'date non définie';
  
//     // Vérifier si le format est DD/MM/YYYY
//     const dateParts = dateString.split('/');
//     if (dateParts.length === 3) {
//       // Convertir en format YYYY-MM-DD pour une meilleure compatibilité avec le constructeur Date
//       const formattedDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
//       const date = new Date(formattedDate);
//       return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
//     }
  
//     // Sinon, tenter de créer la date directement
//     const date = new Date(dateString);
//     if (isNaN(date)) return 'date non valide'; // Gérer les cas où la date n'est pas valide
//     return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
//   };
  
