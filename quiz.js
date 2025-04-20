let quizId = null;

document.addEventListener('DOMContentLoaded', function() {
    
    if (document.querySelector('.quiz-container')) {
        let currentQuestionIndex = 0;
        let score = 0;
        let timeLeft = 0;
        let timer;
        let isAnswered = false;
        
        const questionText = document.getElementById('question-text');
        const currentQuestionSpan = document.getElementById('current-question');
        const totalQuestionsSpan = document.getElementById('total-questions');
        const answerCards = document.querySelectorAll('.answer-card');
        const timerSeconds = document.getElementById('timer-seconds');
        const timerBar = document.getElementById('timer-bar');
        const feedbackOverlay = document.getElementById('feedback-overlay');
        const feedbackModal = document.getElementById('feedback-modal');

        const initQuiz = () => {
            const urlParams = new URLSearchParams(window.location.search);
            quizId = urlParams.get('id');

            fetch(`http://localhost:8000/api/quizzes/${quizId}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Quiz non trouvé');
                    }
                    return response.json();
                })
                .then(data => {
                    const currentQuizData = transformFetchedQuiz(data);
                    startQuiz(currentQuizData);
                })
                .catch(error => {
                    console.error(error);
                });
        };

        function transformFetchedQuiz(data) {
            return {
                id: data.id_quiz,
                title: data.nom_quiz,
                questions: data.questions.map(q => ({
                    id_question: q.id_question,
                    text: q.texte_question,
                    options: q.reponses.map(r => ({
                        id_reponse: r.id_reponse,
                        texte: r.texte_reponse
                    })),
                    correctOption: q.reponses.findIndex(r => r.bonne_reponse === 1),
                    timeLimit: 15
                }))
            };
        }

        function startQuiz(currentQuizData) {
            document.title = `${currentQuizData.title} - ThinkUp`;
            document.getElementById('quiz-title').textContent = currentQuizData.title;
            totalQuestionsSpan.textContent = currentQuizData.questions.length;
            loadQuestion(currentQuizData, 0);
            
            answerCards.forEach(card => {
                card.addEventListener('click', function() {
                    handleAnswerClick(
                        currentQuizData,
                        parseInt(this.dataset.option),
                        parseInt(this.dataset.idReponse)
                    );
                });
            });
                                }

        function loadQuestion(quizData, index) {
            if (index >= quizData.questions.length) {
                endQuiz();
                return;
            }

            isAnswered = false;
            currentQuestionIndex = index;
            const question = quizData.questions[index];

            questionText.textContent = question.text;
            currentQuestionSpan.textContent = index + 1;

            answerCards.forEach((card, i) => {
                const option = question.options[i];
            
                card.querySelector('.answer-text').textContent = option.texte;
                card.dataset.option = i;
                card.dataset.idReponse = option.id_reponse;
            
                card.classList.remove('disabled', 'correct', 'incorrect');
            });
            startTimer(question.timeLimit, quizData);
        }

        function startTimer(seconds, quizData) {
            clearInterval(timer);
            timeLeft = seconds;
            timerSeconds.textContent = timeLeft;
            timerBar.style.transition = 'none';
            timerBar.style.width = '100%';
            timerBar.style.backgroundColor = '#4CAF50';

            void timerBar.offsetWidth;

            timerBar.style.transition = `width ${seconds}s linear`;
            timerBar.style.width = '0%';

            const warningThreshold = Math.ceil(seconds * 0.2);

            timer = setInterval(() => {
                timeLeft--;
                timerSeconds.textContent = timeLeft;

                if (timeLeft <= warningThreshold && timerBar.style.backgroundColor !== 'red') {
                    timerBar.style.backgroundColor = 'red';
                }

                if (timeLeft <= 0) {
                    clearInterval(timer);
                    if (!isAnswered) {
                        handleTimeout(quizData);
                    }
                }
            }, 1000);
        }

        function handleAnswerClick(quizData, selectedOption, selectedAnswerId) {
            if (isAnswered) return;

            isAnswered = true;
            clearInterval(timer);

            fetch('http://localhost:8000/api/choix-reponse', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('jwt')
                },
                body: JSON.stringify({
                    id_reponse: selectedAnswerId,
                    id_question: quizData.questions[currentQuestionIndex].id_question 
                })
            });
            

            const correctOption = quizData.questions[currentQuestionIndex].correctOption;
            const totalTime = quizData.questions[currentQuestionIndex].timeLimit;

            answerCards.forEach(card => {
                card.classList.add('disabled');
                const option = parseInt(card.dataset.option);
                if (option === correctOption) {
                    card.classList.add('correct');
                } else if (option === selectedOption) {
                    card.classList.add('incorrect');
                }
            });

            if (selectedOption === correctOption) {
                const pointsEarned = 100 + Math.round(100 * (timeLeft / totalTime));
                showFeedback('correct', '✓', 'Correct!', pointsEarned, timeLeft, totalTime);
                score += pointsEarned;
            } else {
                showFeedback('incorrect', '✗', 'Incorrect!', 0, 0, 0, quizData.questions[currentQuestionIndex].options[correctOption]);
            }

            setTimeout(() => {
                feedbackOverlay.classList.remove('active');
                loadQuestion(quizData, currentQuestionIndex + 1);
            }, 3000);
        }

        function showFeedback(type, icon, text, points, timeLeft = 0, totalTime = 0, correctAnswer = '') {
            feedbackModal.className = `feedback-modal ${type}`;
            feedbackModal.querySelector('.feedback-icon').textContent = icon;
            feedbackModal.querySelector('.feedback-text').textContent = text;
            feedbackModal.querySelector('.points').textContent = `+${points} points`;

            // Clear previous dynamic elements
            const existingElements = feedbackModal.querySelectorAll('.time-bonus, .correct-answer');
            existingElements.forEach(el => el.remove());

            if (timeLeft > 0 && totalTime > 0) {
                const timeBonus = document.createElement('div');
                timeBonus.className = 'time-bonus';
                timeBonus.textContent = `Bonus de rapidité: ${Math.round((timeLeft/totalTime) * 100)}%`;
                feedbackModal.insertBefore(timeBonus, feedbackModal.querySelector('.waiting-text'));
            }

            if (correctAnswer) {
                const correctAnswerElement = document.createElement('div');
                correctAnswerElement.className = 'correct-answer';
                correctAnswerElement.textContent = `Réponse correcte: ${correctAnswer}`;
                feedbackModal.insertBefore(correctAnswerElement, feedbackModal.querySelector('.waiting-text'));
            }

            feedbackOverlay.classList.add('active');
        }

        function handleTimeout(quizData) {
            isAnswered = true;
            answerCards.forEach(card => card.classList.add('disabled'));

            const correctOption = quizData.questions[currentQuestionIndex].correctOption;
            const correctAnswerText = quizData.questions[currentQuestionIndex].options[correctOption];
            
            showFeedback('timeout', '⏱', 'Temps écoulé!', 0, 0, 0, correctAnswerText);
            setTimeout(() => {
                feedbackOverlay.classList.remove('active');
                loadQuestion(quizData, currentQuestionIndex + 1);
            }, 3000);

        }

        function endQuiz() {

        
            const token = localStorage.getItem('jwt');

            fetch('http://localhost:8000/api/participation', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify({
                    id_quiz: quizId,
                    score: score
                })
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error("Erreur lors de l'enregistrement du score");
                }
                return response.json();
            })
            .then(data => {
                console.log('Participation enregistrée :', data);
            })
            .catch(error => {
                console.error('Erreur participation :', error);
            });


            document.querySelector('.timer-container').style.display = 'none';
            document.querySelector('.question-container').style.display = 'none';

            const answersGrid = document.querySelector('.answers-grid');
            answersGrid.innerHTML = `
                <div class="results-container">
                    <h2>Quiz Terminé!</h2>
                    <p class="final-score">Votre score: ${score}</p>
                    <button class="btn" onclick="window.location.href='main.html'">Retour à l'Accueil</button>
                </div>
            `;

            
        }

        // Initialisation de la page quiz si nous sommes sur cette page        
        initQuiz();
    }
}); 