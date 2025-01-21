// Clés API
const cryptoApiKey = 'pub_66104698a760d88fc17cef70f7813160d6d28';
const marketauxApiKey = '8qPhFPdftpJYk2chG4TJv4r7oDrCGn8PDxYpp20C';

// URLs API
const cryptoApiUrl = `https://newsdata.io/api/1/news?apikey=${cryptoApiKey}&q=cryptocurrency&language=EN`;
const financeApiUrl = `https://api.marketaux.com/v1/news/all?api_token=${marketauxApiKey}&language=en&filter_entities=true&keywords=finance,stocks,investing,markets`;

// Variables pour stocker les articles
let cryptoArticles = [];
let financeArticles = [];

// Pagination
let currentPage = 1;
const articlesPerPage = 6;

// Conteneur d'articles
const newsContainer = document.getElementById('news-container');

// Fonction pour afficher les articles avec pagination
function displayArticles(articles, page = 1) {
    newsContainer.innerHTML = ''; // Vide le conteneur

    // Déterminer les indices des articles à afficher
    const startIndex = (page - 1) * articlesPerPage;
    const endIndex = startIndex + articlesPerPage;
    const articlesToDisplay = articles.slice(startIndex, endIndex);

    articlesToDisplay.forEach(article => {
        const newsItem = document.createElement('div');
        newsItem.className = 'news-item';

        newsItem.innerHTML = `
            <img src="${article.image_url}" alt="${article.title}">
            <div class="news-content">
                <h2>${article.title}</h2>
                <p>${article.description || 'Description non disponible.'}</p>
                <a href="${article.url}" target="_blank">Lire la suite</a>
            </div>
        `;

        newsContainer.appendChild(newsItem);
    });

    // Ajouter les contrôles de pagination
    addPaginationControls(articles, page);
}

// Fonction pour ajouter des contrôles de pagination
function addPaginationControls(articles, page) {
    const paginationContainer = document.createElement('div');
    paginationContainer.className = 'pagination';

    // Bouton "Précédent"
    if (page > 1) {
        const prevButton = document.createElement('button');
        prevButton.textContent = 'Précédent';
        prevButton.onclick = () => displayArticles(articles, page - 1);
        paginationContainer.appendChild(prevButton);
    }

    // Bouton "Suivant"
    if (page * articlesPerPage < articles.length) {
        const nextButton = document.createElement('button');
        nextButton.textContent = 'Suivant';
        nextButton.onclick = () => displayArticles(articles, page + 1);
        paginationContainer.appendChild(nextButton);
    }

    newsContainer.appendChild(paginationContainer);
}

// Fonction pour récupérer les articles depuis la base de données
function fetchArticlesFromDatabase() {
    fetch('http://localhost/php_project/Projet_Fin/projet/backend/api/get_crypto_news.php')
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                console.error('Erreur :', data.error);
                document.getElementById('news-container').innerHTML = '<p>Erreur lors du chargement des articles.</p>';
                return;
            }
            displayArticles(data); // Afficher les articles avec la fonction existante
        })
        .catch(error => {
            console.error('Erreur lors de la récupération des articles depuis la base de données :', error);
            document.getElementById('news-container').innerHTML = '<p>Impossible de charger les articles depuis la base de données.</p>';
        });
}

// Enregistrer les articles dans la base de données
function saveArticlesToDatabase(articles) {
    fetch('http://localhost/php_project/Projet_Fin/projet/backend/api/save_crypto_news.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articles }) // Envoyer les articles au backend
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            console.log('Articles enregistrés avec succès dans la base de données.');
            fetchArticlesFromDatabase(); // Rafraîchir les articles affichés
        } else {
            console.error('Erreur lors de l’enregistrement :', data.error);
        }
    })
    .catch(error => console.error('Erreur réseau lors de lenregistrement :', error));
}

// Modifier la récupération des actualités Crypto
function fetchCryptoNews() {
    fetch(cryptoApiUrl)
        .then(response => response.json())
        .then(data => {
            console.log('Articles récupérés depuis l’API Crypto :', data.results); // Log pour vérifier les articles
            const newArticles = data.results.filter(article =>
                article.image_url && // Vérifie que l'image existe
                article.title && // Vérifie que le titre existe
                !cryptoArticles.some(existing => existing.title === article.title) // Filtre les doublons
            );

            console.log('Articles filtrés pour enregistrement :', newArticles); // Log pour vérifier les articles après filtrage
            saveArticlesToDatabase(newArticles); // Enregistrer les nouveaux articles
        })
        .catch(error => {
            console.error('Erreur lors de la récupération des actualités cryptographiques :', error);
        });
}

// Fonction pour récupérer les actualités financières
function fetchFinanceNews() {
    fetch(financeApiUrl)
        .then(response => response.json())
        .then(data => {
            const keywords = [
                "finance", "financial", "investment", "investing", "stocks", "stock market",
                "equity", "trading", "bonds", "dividends", "portfolio", "wealth management"
            ];

            const newArticles = data.data.filter(article => {
                const content = `${article.title} ${article.description}`.toLowerCase();
                return (
                    article.image_url &&
                    article.title &&
                    keywords.some(keyword => content.includes(keyword)) &&
                    !financeArticles.some(existing => existing.title === article.title)
                );
            });

            saveArticlesToDatabase(newArticles); // Enregistrer les nouveaux articles
        })
        .catch(error => {
            console.error('Erreur lors de la récupération des actualités financières :', error);
        });
}

// Gestion des onglets
document.getElementById('crypto-news-btn').addEventListener('click', () => {
    fetchArticlesFromDatabase(); // Charger depuis la base de données
    setActiveTab('crypto-news-btn');
});

document.getElementById('finance-news-btn').addEventListener('click', () => {
    fetchFinanceNews(); // Charger directement depuis l'API
    setActiveTab('finance-news-btn');
});

// Fonction pour activer l'onglet sélectionné
function setActiveTab(tabId) {
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
}

// Chargement par défaut : Articles depuis la base
document.addEventListener('DOMContentLoaded', () => {
    fetchArticlesFromDatabase(); // Récupère les articles depuis la base
    fetchCryptoNews();           // Récupère les articles Crypto depuis l'API
    fetchFinanceNews();          // Récupère les articles Finance depuis l'API
});

