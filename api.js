// api.js
const API_BASE_URL = 'http://localhost:8000';

// Fonction pour récupérer tous les quiz
async function getAllQuizzes() {
  try {
    const response = await fetch(`${API_BASE_URL}/quizzes`);
    
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erreur lors de la récupération des quiz:', error);
    return []; // Retourner un tableau vide en cas d'erreur
  }
}

// Fonction pour récupérer un quiz spécifique
async function getQuiz(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/quizzes/${id}`);
    
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Erreur lors de la récupération du quiz ${id}:`, error);
    throw error;
  }
}

// Exporter les fonctions pour les utiliser dans d'autres fichiers
export { getAllQuizzes, getQuiz };