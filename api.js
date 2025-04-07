// api.js - Fonctions pour l'interaction avec l'API backend

/**
 * Récupère tous les quizzes depuis l'API
 * @returns {Promise} Promise contenant les données des quizzes
 */
export async function getAllQuizzes() {
  try {
      const response = await fetch('/api/quizzes');
      if (!response.ok) {
          throw new Error('Erreur lors de la récupération des quizzes');
      }
      return await response.json();
  } catch (error) {
      console.error('Erreur API:', error);
      throw error;
  }
}

/**
* Récupère un quiz spécifique par son ID
* @param {number} id ID du quiz à récupérer
* @returns {Promise} Promise contenant les données du quiz
*/
export async function getQuiz(id) {
  try {
      const response = await fetch(`/api/quizzes/${id}`);
      if (!response.ok) {
          throw new Error('Erreur lors de la récupération du quiz');
      }
      return await response.json();
  } catch (error) {
      console.error('Erreur API:', error);
      throw error;
  }
}

/**
* Crée un nouveau quiz complet avec questions et réponses
* @param {Object} quizData Données du quiz à créer
* @returns {Promise} Promise contenant la confirmation de création
*/
export async function createQuiz(quizData) {
  try {
      const response = await fetch('/api/quizzes/complete', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify(quizData)
      });
      
      if (!response.ok) {
          throw new Error('Erreur lors de la création du quiz');
      }
      
      return await response.json();
  } catch (error) {
      console.error('Erreur API:', error);
      throw error;
  }
}

/**
* Recherche des quizzes selon un terme
* @param {string} searchTerm Terme de recherche
* @returns {Promise} Promise contenant les résultats de recherche
*/
export async function searchQuizzes(searchTerm) {
  try {
      const response = await fetch(`/api/quizzes/find?search=${encodeURIComponent(searchTerm)}`);
      if (!response.ok) {
          throw new Error('Erreur lors de la recherche de quizzes');
      }
      return await response.json();
  } catch (error) {
      console.error('Erreur API:', error);
      throw error;
  }
}

/**
* Supprime un quiz par son ID
* @param {number} id ID du quiz à supprimer
* @returns {Promise} Promise contenant la confirmation de suppression
*/
export async function deleteQuiz(id) {
  try {
      const response = await fetch(`/api/quizzes/${id}`, {
          method: 'DELETE'
      });
      
      if (!response.ok) {
          throw new Error('Erreur lors de la suppression du quiz');
      }
      
      return await response.json();
  } catch (error) {
      console.error('Erreur API:', error);
      throw error;
  }
}

/**
* Publie un quiz (le rend public)
* @param {number} id ID du quiz à publier
* @returns {Promise} Promise contenant la confirmation de publication
*/
export async function publishQuiz(id) {
  try {
      const response = await fetch(`/api/quizzes/${id}/publish`, {
          method: 'POST'
      });
      
      if (!response.ok) {
          throw new Error('Erreur lors de la publication du quiz');
      }
      
      return await response.json();
  } catch (error) {
      console.error('Erreur API:', error);
      throw error;
  }
}