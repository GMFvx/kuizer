document.addEventListener('DOMContentLoaded', async () => {
    const quizList = document.getElementById('quizList');
    const userNameElement = document.querySelector('.profile-container h2');

    const token = localStorage.getItem('token'); // Supondo que o token esteja armazenado no localStorage

    try {
        const response = await fetch('http://localhost:3000/user-results', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Erro ao carregar resultados do usuário');
        }

        const data = await response.json();
        const { userName, quizzes } = data;

        // Exibir o nome do usuário
        userNameElement.textContent = `Bem-vindo, ${userName}`;

        // Exibir os quizzes jogados
        if (quizzes.length === 0) {
            quizList.innerHTML = '<p>Você ainda não jogou nenhum quiz.</p>';
            return;
        }

        quizzes.forEach(result => {
            const quizItem = document.createElement('div');
            quizItem.classList.add('quiz-item');
            quizItem.innerHTML = `
                <h4>Quiz: ${result.quiz_title}</h4>
                <p>Pontuação: ${result.score}</p>
                <p>Data: ${new Date(result.quiz_date).toLocaleDateString()}</p>
            `;
            quizList.appendChild(quizItem);
        });
    } catch (error) {
        console.error(error);
        quizList.innerHTML = '<p>Erro ao carregar resultados. Tente novamente mais tarde.</p>';
    }
});
