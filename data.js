// Sample quiz data for multiple quizzes
const quizData = [
    {
        id: "science-quiz",
        title: "Fun Science Trivia",
        description: "Test your knowledge of basic science facts with this fun quiz!",
        category: "Science",
        author: "ScienceGuru",
        imageUrl: "/api/placeholder/400/200",
        questions: [
            {
                text: "What is the largest planet in our solar system?",
                options: ["Mars", "Jupiter", "Saturn", "Venus"],
                correctOption: 1,
                timeLimit: 20
            },
            {
                text: "What is the chemical symbol for gold?",
                options: ["Go", "Gl", "Au", "Ag"],
                correctOption: 2,
                timeLimit: 15
            },
            {
                text: "Which of these animals is a mammal?",
                options: ["Shark", "Dolphin", "Snake", "Crocodile"],
                correctOption: 1,
                timeLimit: 20
            },
            {
                text: "How many elements are in the periodic table (as of 2024)?",
                options: ["92", "103", "118", "120"],
                correctOption: 2,
                timeLimit: 20
            },
            {
                text: "What is the closest star to Earth?",
                options: ["Proxima Centauri", "Alpha Centauri", "The Sun", "Sirius"],
                correctOption: 2,
                timeLimit: 15
            }
        ]
    },
    {
        id: "history-quiz",
        title: "World History Challenge",
        description: "Journey through time with challenging questions about world history!",
        category: "History",
        author: "HistoryBuff",
        imageUrl: "/api/placeholder/400/200",
        questions: [
            {
                text: "In which year did World War II end?",
                options: ["1943", "1945", "1947", "1950"],
                correctOption: 1,
                timeLimit: 15
            },
            {
                text: "Who was the first Emperor of Rome?",
                options: ["Julius Caesar", "Augustus", "Nero", "Constantine"],
                correctOption: 1,
                timeLimit: 20
            },
            {
                text: "Which civilization built Machu Picchu?",
                options: ["Maya", "Aztec", "Inca", "Olmec"],
                correctOption: 2,
                timeLimit: 20
            },
            {
                text: "Which country was NOT part of the Allied Powers during World War II?",
                options: ["United States", "Soviet Union", "Italy", "United Kingdom"],
                correctOption: 2,
                timeLimit: 25
            },
            {
                text: "Who wrote 'The Communist Manifesto'?",
                options: ["Vladimir Lenin", "Joseph Stalin", "Karl Marx", "Friedrich Engels"],
                correctOption: 2,
                timeLimit: 20
            }
        ]
    },
    {
        id: "pop-culture-quiz",
        title: "Pop Culture Mania",
        description: "How well do you know modern entertainment and pop culture?",
        category: "Entertainment",
        author: "PopCultureFan",
        imageUrl: "/api/placeholder/400/200",
        questions: [
            {
                text: "Which artist has won the most Grammy Awards?",
                options: ["Beyoncé", "Adele", "Taylor Swift", "Billie Eilish"],
                correctOption: 0,
                timeLimit: 20
            },
            {
                text: "Which movie won the Oscar for Best Picture in 2020?",
                options: ["1917", "Joker", "Parasite", "Once Upon a Time in Hollywood"],
                correctOption: 2,
                timeLimit: 20
            },
            {
                text: "Which video game franchise features characters named Mario and Luigi?",
                options: ["The Legend of Zelda", "Super Mario", "Pokémon", "Sonic the Hedgehog"],
                correctOption: 1,
                timeLimit: 15
            },
            {
                text: "Who played Iron Man in the Marvel Cinematic Universe?",
                options: ["Chris Evans", "Chris Hemsworth", "Robert Downey Jr.", "Mark Ruffalo"],
                correctOption: 2,
                timeLimit: 15
            },
            {
                text: "Which of these is NOT a social media platform?",
                options: ["Instagram", "Snapchat", "MyWeb", "TikTok"],
                correctOption: 2,
                timeLimit: 15
            }
        ]
    }
];