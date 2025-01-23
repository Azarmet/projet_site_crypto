<?php
header('Content-Type: application/json');

// Connexion à la base de données
$dsn = 'mysql:host=localhost;dbname=crypto_invest';
$username = 'root';
$password = '';

try {
    $pdo = new PDO($dsn, $username, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    ]);

    // Récupérer les données du portefeuille (exemple utilisateur ID 1)
    $stmt = $pdo->prepare("
    SELECT 
        p.symbol, 
        p.quantity, 
        p.purchase_price, 
        c.price, 
        (p.quantity * c.price) AS total_value
    FROM user_portfolios p
    JOIN (
        SELECT symbol, price 
        FROM crypto_prices
        WHERE timestamp = (
            SELECT MAX(timestamp) 
            FROM crypto_prices AS cp 
            WHERE cp.symbol = crypto_prices.symbol
        )
    ) c ON p.symbol = c.symbol
    WHERE p.user_id = :user_id
");
$stmt->execute([':user_id' => 1]);
$portfolioData = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($portfolioData);
} catch (PDOException $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>
