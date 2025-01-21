const apiUrl = 'https://api.binance.com/api/v3/ticker/24hr';
const cryptos = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'ADAUSDT', "TAOUSDT", "LINKUSDT", "XRPUSDT"];

async function fetchCryptoPrices() {
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();

        // Filtrer les cryptos principales
        const filteredData = data.filter((crypto) => cryptos.includes(crypto.symbol));

        // Générer le contenu HTML pour les prix
        const tickerContent = filteredData.map((crypto) => {
            const symbol = crypto.symbol.replace('USDT', '');
            const currentPrice = parseFloat(crypto.lastPrice).toFixed(2);
            const priceChangePercent = parseFloat(crypto.priceChangePercent).toFixed(2);

            let arrow = '';
            let color = 'white';
            if (priceChangePercent > 0) {
                arrow = '↑';
                color = ' rgb(16, 192, 16)';
            } else if (priceChangePercent < 0) {
                arrow = '↓';
                color = 'rgb(238, 39, 39)';
            }

            return `<span style="color: ${color}">${symbol}: $${currentPrice} ${arrow} (${priceChangePercent}%)</span>`;
        }).join('');

        const ticker = document.querySelector('.ticker');
        ticker.innerHTML = tickerContent; // Ajouter les données initiales
        duplicateContent(); // Créer la boucle infinie
    } catch (error) {
        console.error('Erreur lors de la récupération des prix :', error);
    }
}

function duplicateContent() {
    const ticker = document.querySelector('.ticker');
    
    // S'assurer que le contenu de la barre existe
    if (!ticker || ticker.innerHTML.trim() === '') {
        console.error('La barre des prix est vide.');
        return;
    }
    
    const tickerWidth = ticker.scrollWidth; // Largeur totale du contenu

    // Dupliquer le contenu pour créer l'effet de boucle
    ticker.innerHTML += ticker.innerHTML;

    // Ajuster la vitesse de l'animation en fonction de la largeur totale
    adjustAnimationSpeed(tickerWidth * 2); // Multiplie par 2 pour inclure le contenu dupliqué
}

function adjustAnimationSpeed(width) {
    const ticker = document.querySelector('.ticker');
    const animationDuration = width / 50; // Ajuste la durée selon la largeur et vitesse
    ticker.style.animation = `scroll ${animationDuration}s linear infinite`; // Définit une animation infinie
}


// Initialisation
fetchCryptoPrices();
