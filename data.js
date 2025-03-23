const quizData = [
    {
        id: "science-quiz",
        title: "Quiz de Sciences Amusant",
        description: "Testez vos connaissances sur les faits scientifiques de base avec ce quiz amusant!",
        category: "Science",
        author: "ScienceGuru",
        imageUrl: "/api/placeholder/400/200",
        questions: [
            {
                text: "Quelle est la plus grande planète de notre système solaire?",
                options: ["Mars", "Jupiter", "Saturne", "Vénus"],
                correctOption: 1,
                timeLimit: 20
            },
            {
                text: "Quel est le symbole chimique de l'or?",
                options: ["Go", "Gl", "Au", "Ag"],
                correctOption: 2,
                timeLimit: 15
            },
            {
                text: "Lequel de ces animaux est un mammifère?",
                options: ["Requin", "Dauphin", "Serpent", "Crocodile"],
                correctOption: 1,
                timeLimit: 20
            },
            {
                text: "Combien d'éléments y a-t-il dans le tableau périodique (en 2024)?",
                options: ["92", "103", "118", "120"],
                correctOption: 2,
                timeLimit: 20
            },
            {
                text: "Quelle est l'étoile la plus proche de la Terre?",
                options: ["Proxima Centauri", "Alpha Centauri", "Le Soleil", "Sirius"],
                correctOption: 2,
                timeLimit: 15
            }
        ]
    },
    {
        id: "history-quiz",
        title: "Défi d'Histoire Mondiale",
        description: "Voyagez à travers le temps avec des questions stimulantes sur l'histoire mondiale!",
        category: "Histoire",
        author: "HistoryBuff",
        imageUrl: "/api/placeholder/400/200",
        questions: [
            {
                text: "En quelle année la Seconde Guerre mondiale s'est-elle terminée?",
                options: ["1943", "1945", "1947", "1950"],
                correctOption: 1,
                timeLimit: 15
            },
            {
                text: "Qui était le premier Empereur de Rome?",
                options: ["Jules César", "Auguste", "Néron", "Constantin"],
                correctOption: 1,
                timeLimit: 20
            },
            {
                text: "Quelle civilisation a construit le Machu Picchu?",
                options: ["Maya", "Aztèque", "Inca", "Olmèque"],
                correctOption: 2,
                timeLimit: 20
            },
            {
                text: "Quel pays NE faisait PAS partie des Alliés pendant la Seconde Guerre mondiale?",
                options: ["États-Unis", "Union Soviétique", "Italie", "Royaume-Uni"],
                correctOption: 2,
                timeLimit: 25
            },
            {
                text: "Qui a écrit 'Le Manifeste communiste'?",
                options: ["Vladimir Lénine", "Joseph Staline", "Karl Marx", "Friedrich Engels"],
                correctOption: 2,
                timeLimit: 20
            }
        ]
    },
    {
        id: "pop-culture-quiz",
        title: "Quiz Culture Pop",
        description: "À quel point connaissez-vous la culture et le divertissement modernes?",
        category: "Divertissement",
        author: "PopCultureFan",
        imageUrl: "/api/placeholder/400/200",
        questions: [
            {
                text: "Quel artiste a remporté le plus de Grammy Awards?",
                options: ["Beyoncé", "Adele", "Taylor Swift", "Billie Eilish"],
                correctOption: 0,
                timeLimit: 20
            },
            {
                text: "Quel film a remporté l'Oscar du meilleur film en 2020?",
                options: ["1917", "Joker", "Parasite", "Once Upon a Time in Hollywood"],
                correctOption: 2,
                timeLimit: 20
            },
            {
                text: "Quelle franchise de jeux vidéo présente des personnages nommés Mario et Luigi?",
                options: ["The Legend of Zelda", "Super Mario", "Pokémon", "Sonic the Hedgehog"],
                correctOption: 1,
                timeLimit: 15
            },
            {
                text: "Qui a joué Iron Man dans l'Univers Cinématographique Marvel?",
                options: ["Chris Evans", "Chris Hemsworth", "Robert Downey Jr.", "Mark Ruffalo"],
                correctOption: 2,
                timeLimit: 15
            },
            {
                text: "Laquelle de ces options N'EST PAS une plateforme de médias sociaux?",
                options: ["Instagram", "Snapchat", "MyWeb", "TikTok"],
                correctOption: 2,
                timeLimit: 15
            }
        ]
    }
];