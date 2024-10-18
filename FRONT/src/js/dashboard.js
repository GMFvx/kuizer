window.onload = async function() {
    const token = sessionStorage.getItem('token'); // Pega o token do sessionStorage

    if (!token) {
        alert('Você não está autenticado');
        window.location.href = 'login.html'; // Redireciona para o login se não estiver autenticado
        return;
    }

    // Faz a requisição para o dashboard enviando o token no cabeçalho
    const response = await fetch('http://localhost:3001/dashboard', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`, // Adiciona o token no cabeçalho
            'Content-Type': 'application/json'
        }
    });

    const data = await response.json();

    if (response.ok) {
        document.getElementById('dashboardContent').innerText = data.message;
    } else {
        alert('Erro ao carregar o dashboard');
        window.location.href = 'login.html';
    }
};
