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

export const formaterDate = (dateString) => {
    if (!dateString) return 'date non définie';
  
    // Vérifier si le format est DD/MM/YYYY
    const dateParts = dateString.split('/');
    if (dateParts.length === 3) {
      // Convertir en format YYYY-MM-DD pour une meilleure compatibilité avec le constructeur Date
      const formattedDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
      const date = new Date(formattedDate);
      return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }
  
    // Sinon, tenter de créer la date directement
    const date = new Date(dateString);
    if (isNaN(date)) return 'date non valide'; // Gérer les cas où la date n'est pas valide
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };
  