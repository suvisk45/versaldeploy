document.addEventListener('DOMContentLoaded', () => {
    const userBtn = document.getElementById('user-btn');
    const adminBtn = document.getElementById('admin-btn');
    const roleSelectionDiv = document.getElementById('role-selection');
    const userDetailsDiv = document.getElementById('user-details');
    const quizDiv = document.getElementById('quiz');
    const adminContainer = document.getElementById('admin-container');
    const startQuizBtn = document.getElementById('start-quiz');
    const questionEl = document.getElementById('question');
    const answerEls = document.querySelectorAll('.answer');
    const a_txt = document.getElementById('a_text');
    const b_txt = document.getElementById('b_text');
    const c_txt = document.getElementById('c_text');
    const d_txt = document.getElementById('d_text');
    const submitBtn = document.getElementById('submit-btn');
    const resultContainer = document.getElementById('result-container');
    const resultTableBody = document.querySelector('#result-table tbody');
    const finalScoreEl = document.getElementById('final-score');
    const addQuestionBtn = document.getElementById('add-question');
    let currentQuiz = 0;
    let score = 0;
    let username = '';
    let department = '';
    let quizData = [];
    let userAnswers = [];

    // Admin role selection
    adminBtn.addEventListener('click', () => {
        roleSelectionDiv.style.display = 'none';
        adminContainer.style.display = 'block';
    });

    // User role selection
    userBtn.addEventListener('click', () => {
        roleSelectionDiv.style.display = 'none';
        userDetailsDiv.style.display = 'block';
    });

    // Start Quiz
    startQuizBtn.addEventListener('click', async () => {
        username = document.getElementById('username').value;
        department = document.getElementById('department').value;
        userDetailsDiv.style.display = 'none';
        quizDiv.style.display = 'block';
        quizData = await fetchQuizData();
        displayQuiz();

        submitBtn.addEventListener('click', async () => {
            const answer = getSelected();
            if (answer) {
                userAnswers.push(answer);
                const currentQuizData = quizData[currentQuiz];
                if (answer === currentQuizData.correct) {
                    score++;
                }
                currentQuiz++;
                if (currentQuiz < quizData.length) {
                    displayQuiz();
                } else {
                    await submitScore();
                    displayResults();
                }
            } else {
                alert('Please select an answer!');
            }
        });
    });

    // Fetch quiz data
    async function fetchQuizData() {
        try {
            const response = await fetch('http://localhost:3000/api/quiz');
            if (!response.ok) throw new Error('Network response was not ok');
            const quizData = await response.json();
            return quizData;
        } catch (error) {
            console.error('Failed to fetch quiz data:', error);
        }
    }

    // Display quiz questions
    function displayQuiz() {
        deselectAnswers();
        const currentQuizData = quizData[currentQuiz];
        questionEl.innerText = currentQuizData.question;
        a_txt.innerText = currentQuizData.a;
        b_txt.innerText = currentQuizData.b;
        c_txt.innerText = currentQuizData.c;
        d_txt.innerText = currentQuizData.d;
    }

    // Get selected answer
    function getSelected() {
        let answer;
        answerEls.forEach((answerEl) => {
            if (answerEl.checked) {
                answer = answerEl.id;
            }
        });
        return answer;
    }

    // Deselect all answers
    function deselectAnswers() {
        answerEls.forEach((answerEl) => (answerEl.checked = false));
    }

    // Display results
    function displayResults() {
        quizDiv.style.display = 'none';
        resultContainer.style.display = 'block';
        quizData.forEach((quizItem, index) => {
            const userAnswer = userAnswers[index];
            const isCorrect = userAnswer === quizItem.correct;
            const resultRow = document.createElement('tr');
            resultRow.innerHTML = `
                <td>${quizItem.question}</td>
                <td>${quizItem[userAnswer]}</td>
                <td>${quizItem[quizItem.correct]}</td>
                <td>${isCorrect ? 'Correct' : 'Incorrect'}</td>
            `;
            resultTableBody.appendChild(resultRow);
        });
        finalScoreEl.innerText = `${username} from ${department}, your final score is ${score}/${quizData.length}.`;
    }

    // Add new question (Admin)
    addQuestionBtn.addEventListener('click', async () => {
        const question = document.getElementById('question-input').value.trim();
        const a = document.getElementById('option_a').value.trim();
        const b = document.getElementById('option_b').value.trim();
        const c = document.getElementById('option_c').value.trim();
        const d = document.getElementById('option_d').value.trim();
        const correct = document.getElementById('correct_answer').value.trim();

        if (!question || !a || !b || !c || !d || !correct) {
            alert('Please fill in all fields!');
            return;
        }

        const newQuestion = { question, a, b, c, d, correct };

        try {
            const response = await fetch('http://localhost:3000/api/quiz', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newQuestion),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Failed to add question: ${errorData.message}`);
            }

            alert('Question added successfully!');
            document.getElementById('question-input').value = '';
            document.getElementById('option_a').value = '';
            document.getElementById('option_b').value = '';
            document.getElementById('option_c').value = '';
            document.getElementById('option_d').value = '';
            document.getElementById('correct_answer').value = '';

        } catch (error) {
            console.error('Failed to add question:', error);
            alert(`An error occurred while adding the question: ${error.message}`);
        }
    });
});
