// api.js avec débogage amélioré pour la récupération de quiz

/**
 * Récupère tous les quizzes depuis l'API
 * @returns {Promise} Promise contenant les données des quizzes
 */
export async function getAllQuizzes() {
    try {
        console.log("Tentative de récupération de tous les quizzes...");
        // Utiliser l'URL complète pour le débogage
        const response = await fetch('http://localhost:8000/api/quizzes');
        console.log("Statut de la réponse:", response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Réponse d\'erreur:', errorText);
            throw new Error(`Erreur lors de la récupération des quizzes: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Données reçues:", data);
        return data;
    } catch (error) {
        console.error('Erreur API getAllQuizzes:', error);
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
        console.log(`Tentative de récupération du quiz ID ${id}...`);
        // Utiliser l'URL complète pour le débogage
        const url = `http://localhost:8000/api/quizzes/${id}`;
        console.log("URL complète:", url);
        
        const response = await fetch(url);
        console.log("Statut de la réponse:", response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Réponse d\'erreur:', errorText);
            throw new Error(`Erreur lors de la récupération du quiz: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Données du quiz reçues:", data);
        return data;
    } catch (error) {
        console.error('Erreur API getQuiz:', error);
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
        console.log("Tentative de création d'un quiz avec les données:", quizData);
        
        const response = await fetch('http://localhost:8000/api/quizzes/complete', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('jwt')
            },
            body: JSON.stringify(quizData)
        });
        
        console.log("Statut de la réponse:", response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Réponse d\'erreur:', errorText);
            throw new Error(`Erreur lors de la création du quiz: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Réponse de création:", data);
        return data;
    } catch (error) {
        console.error('Erreur API createQuiz:', error);
        throw error;
    }
}

/**
 * Met à jour un quiz existant par son ID
 * @param {number} id ID du quiz à mettre à jour
 * @param {Object} quizData Nouvelles données du quiz
 * @returns {Promise} Promise contenant la confirmation de mise à jour
 */
export async function updateQuiz(id, quizData) {
    try {
        console.log(`Tentative de mise à jour du quiz ID ${id} avec les données:`, quizData);
        
        const url = `http://localhost:8000/api/quizzes/${id}`;
        console.log("URL de mise à jour complète:", url);
        
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('jwt')
            },
            body: JSON.stringify(quizData)
        });
        
        console.log("Statut de la réponse:", response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Réponse d\'erreur:', errorText);
            throw new Error(`Erreur lors de la mise à jour du quiz: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Réponse de mise à jour:", data);
        return data;
    } catch (error) {
        console.error('Erreur API updateQuiz:', error);
        throw error;
    }
}