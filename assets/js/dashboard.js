document.addEventListener('DOMContentLoaded', () => {
    const userName = "John Doe"; // Replace with dynamic user data
    const portfolioValue = 10000; // Example data
    const portfolioChange = 5; // Example data in percentage
    const bestAsset = "Bitcoin (BTC) +8%";
    const worstAsset = "Ethereum (ETH) -2%";

    document.getElementById('user-name').textContent = userName;
    document.getElementById('portfolio-value').textContent = `$${portfolioValue}`;
    document.getElementById('portfolio-change').textContent = `${portfolioChange > 0 ? "+" : ""}${portfolioChange}%`;
    document.getElementById('portfolio-change').classList.toggle('negative', portfolioChange < 0);
    document.getElementById('best-asset').textContent = bestAsset;
    document.getElementById('worst-asset').textContent = worstAsset;
});

let portfolioChartInstance; // Variable globale pour stocker l'instance du graphique

// Fonction pour récupérer les données du portefeuille
async function updatePortfolio() {
    try {
        const response = await fetch('http://localhost/php_project/Projet_Fin/projet/backend/api/get_portfolio_data.php'); // Remplace par le chemin réel
        const portfolioData = await response.json();

        const cryptoList = document.getElementById('crypto-list');
        cryptoList.innerHTML = ''; // Réinitialiser le tableau

        if (portfolioData.length === 0) {
            // Si aucune donnée, afficher un message
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = `<td colspan="5" style="text-align: center;">No portfolio created yet. Add assets to your portfolio.</td>`;
            cryptoList.appendChild(emptyRow);
            return; // Stopper l'exécution
        }

        // Ajouter les données au tableau si présentes
        portfolioData.forEach((crypto) => {
            const change = ((crypto.price - crypto.purchase_price) / crypto.purchase_price * 100).toFixed(2); // Calcul du changement
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${crypto.symbol}</td>
                <td>$${parseFloat(crypto.price).toFixed(2)}</td>
                <td>${crypto.quantity}</td>
                <td>$${parseFloat(crypto.total_value).toFixed(2)}</td>
                <td class="${change >= 0 ? 'positive' : 'negative'}">${change}%</td>

            `;
            cryptoList.appendChild(row);
        });

        // Mettre à jour le graphique en camembert
        const ctx = document.getElementById('portfolioChart').getContext('2d');
        // Détruire l'ancien graphique s'il existe
        if (portfolioChartInstance) {
            portfolioChartInstance.destroy();
        }
        
        portfolioChartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: portfolioData.map(crypto => crypto.symbol),
                datasets: [{
                    data: portfolioData.map(crypto => parseFloat(crypto.total_value)),
                    backgroundColor: ['#f7931a', '#627eea', '#3cc8c8'],
                }],
            },
        });
    } catch (error) {
        console.error('Erreur lors de la mise à jour du portefeuille :', error);
    }
}

document.querySelectorAll('.tab-link').forEach(tab => {
    tab.addEventListener('click', () => {
        // Activer l'onglet cliqué
        document.querySelectorAll('.tab-link').forEach(link => link.classList.remove('active'));
        tab.classList.add('active');

        // Afficher le contenu correspondant
        const tabId = tab.getAttribute('data-tab');
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        document.getElementById(tabId).classList.add('active');
    });
});

document.addEventListener('DOMContentLoaded', () => {
    // Exemple de données pour les périodes
    const performanceData = {
        '1D': [10000, 10100, 10200, 10300],
        '1W': [10000, 10500, 10800, 11000],
        '1M': [9500, 10000, 10200, 11000],
        '1Y': [8000, 9000, 10000, 11000],
        '5Y': [5000, 7000, 9000, 101000],
    };

    const ctxPerformance = document.getElementById('globalPerformanceChart').getContext('2d');
    const globalPerformanceChart = new Chart(ctxPerformance, {
        type: 'line',
        data: {
            labels: ["Start", "Midpoint", "Near End", "End"], // Labels par défaut
            datasets: [{
                label: 'Portfolio Value',
                data: performanceData['1D'], // Valeurs initiales
                borderColor: '#4caf50',
                tension: 0.4,
                fill: false,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                x: { title: { display: true, text: 'Time Period', color: '#fff' } },
                y: { title: { display: true, text: 'Value ($)', color: '#fff' } },
            },
            plugins: {
                legend: { display: true, labels: { color: '#fff' } }
            }
        }
    });

    // Gérer le changement de période
    document.querySelectorAll('.chart-btn').forEach(button => {
        button.addEventListener('click', () => {
            // Activer le bouton cliqué
            document.querySelectorAll('.chart-btn').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            // Mettre à jour les données du graphique
            const period = button.getAttribute('data-period');
            globalPerformanceChart.data.datasets[0].data = performanceData[period];
            globalPerformanceChart.update();
        });
    });
});


document.getElementById('add-asset-form').addEventListener('submit', async (e) => {
    e.preventDefault(); // Empêcher le rechargement de la page

    const symbol = document.getElementById('symbol').value;
    const quantity = parseFloat(document.getElementById('quantity').value);
    const purchasePrice = parseFloat(document.getElementById('purchase-price').value);

    try {
        const response = await fetch('http://localhost/php_project/Projet_Fin/projet/backend/api/add_to_portfolio.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ symbol, quantity, purchase_price: purchasePrice }),
        });

        const result = await response.json();
        if (result.success) {
            alert('Asset added successfully!');
            updatePortfolio(); // Rafraîchir le tableau et le graphique
        } else {
            alert('Error adding asset: ' + result.error);
        }
    } catch (error) {
        console.error('Erreur lors de l’ajout de l’actif :', error);
    }
});

// Appeler la fonction de mise à jour du portefeuille
document.addEventListener('DOMContentLoaded', updatePortfolio);
