<?php
// Connexion à la base de données
$dsn = 'mysql:host=localhost;dbname=crypto_invest';
$username = 'root';
$password = '';

try {
    $pdo = new PDO($dsn, $username, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    ]);
} catch (PDOException $e) {
    die("Erreur de connexion à la base de données: " . $e->getMessage());
}

// Récupération des données depuis l'API Binance
$apiUrl = "https://api.binance.com/api/v3/ticker/24hr";
$response = file_get_contents($apiUrl);

if ($response === false) {
    die("Erreur lors de la récupération des données de l'API Binance.");
}

$data = json_decode($response, true);

if ($data) {
    // Préparation de la requête pour insérer ou mettre à jour les prix
    $stmt = $pdo->prepare("
        INSERT INTO crypto_prices (symbol, price) 
        VALUES (:symbol, :price)
        ON DUPLICATE KEY UPDATE price = :price, timestamp = CURRENT_TIMESTAMP
    ");

    foreach ($data as $crypto) {
        $symbol = $crypto['symbol'];
        $price = $crypto['lastPrice'];

        // Filtrer les cryptomonnaies en USD uniquement
        if (strpos($symbol, 'USDT') !== false) {
            $stmt->execute([
                ':symbol' => $symbol,
                ':price' => $price,
            ]);
        }
    }

    echo "Données mises à jour avec succès.";
} else {
    echo "Erreur lors de l'analyse des données JSON.";
}
?>
