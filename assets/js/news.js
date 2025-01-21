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
                <a href="${article.url}" target="_blank" rel="noopener noreferrer">Lire la suite</a>
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
    const prevButton = document.createElement('button');
    prevButton.textContent = 'Précédent';
    prevButton.disabled = page <= 1; // Désactive le bouton si c'est la première page
    prevButton.onclick = () => {
        displayArticles(articles, page - 1);
        scrollToTop(); // Remonte en haut des articles
    };
    paginationContainer.appendChild(prevButton);

    // Bouton "Suivant"
    const nextButton = document.createElement('button');
    nextButton.textContent = 'Suivant';
    nextButton.disabled = page * articlesPerPage >= articles.length; // Désactive le bouton si c'est la dernière page
    nextButton.onclick = () => {
        displayArticles(articles, page + 1);
        scrollToTop(); // Remonte en haut des articles
    };
    paginationContainer.appendChild(nextButton);

    newsContainer.appendChild(paginationContainer);
}

// Fonction pour remonter en haut des articles
function scrollToTop() {
    const offset = -80; // Décalage de 20 pixels au-dessus
    const topPosition = newsContainer.getBoundingClientRect().top + window.scrollY + offset;

    window.scrollTo({
        top: topPosition,
        behavior: 'smooth'
    });
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

    if (!articles || articles.length === 0) {
        console.warn('Aucun article à enregistrer.');
        return; // Arrête l'exécution si aucun article n'est présent
    }

    fetch('http://localhost/php_project/Projet_Fin/projet/backend/api/save_crypto_news.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articles }) // Transforme en JSON
    })
    .then(async (response) => {
        const rawText = await response.text();
            if (!response.ok) {
            throw new Error(`Erreur HTTP : ${response.status} ${response.statusText}`);
        }

        return JSON.parse(rawText); // Parse le JSON si la réponse est valide
    })
    .then(data => {
        if (data.success) {
            fetchArticlesFromDatabase(); // Rafraîchit les articles
        } else {
            console.error('Erreur renvoyée par le backend :', data.error);
        }
    })
    .catch(error => {
        console.error('Erreur réseau ou JSON lors de lenregistrement :', error);
    });
}

// Modifier la récupération des actualités Crypto
function fetchCryptoNews() {
    fetch(cryptoApiUrl)
        .then(response => response.json())
        .then(data => {
            // Filtrer et transformer les articles
            const newArticles = data.results.filter(article =>
                article.image_url && // Vérifie que l'image existe
                article.title && // Vérifie que le titre existe
                article.link && // Vérifie que le lien existe (champ "link" dans l'API)
                !cryptoArticles.some(existing => existing.title === article.title) // Évite les doublons
            ).map(article => ({
                title: article.title,
                description: article.description || 'Description non disponible.',
                image_url: article.image_url,
                published_at: article.pub_date || new Date().toISOString(), // Utilise la date actuelle si manquante
                url: article.link, // Utilise "link" comme URL
                source: article.source || 'Inconnu' // Définit "Inconnu" si la source est absente
            }));


            if (newArticles.length === 0) {
                console.warn('Aucun article à enregistrer.');
                return;
            }

            saveArticlesToDatabase(newArticles); // Enregistre les articles dans la base de données
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
    fetchArticlesFromDatabase(); // Charger les articles crypto depuis la base
    setActiveTab('crypto-news-btn');
});

document.getElementById('finance-news-btn').addEventListener('click', () => {
    displayArticles([]); // Laisser vide pour l'instant
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
});

