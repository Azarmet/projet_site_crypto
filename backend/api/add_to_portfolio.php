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

    // Récupérer les données envoyées via POST
    $data = json_decode(file_get_contents('php://input'), true);
    $userId = 1; // Remplace avec l'ID utilisateur dynamique si disponible
    $symbol = strtoupper($data['symbol']);
    $quantity = $data['quantity'];
    $purchasePrice = $data['purchase_price'];

    // Insérer l'actif dans le portefeuille
    $stmt = $pdo->prepare("
        INSERT INTO user_portfolios (user_id, symbol, quantity, purchase_price)
        VALUES (:user_id, :symbol, :quantity, :purchase_price)
        ON DUPLICATE KEY UPDATE
            quantity = quantity + :quantity,
            purchase_price = (purchase_price + :purchase_price) / 2
    ");
    $stmt->execute([
        ':user_id' => $userId,
        ':symbol' => $symbol,
        ':quantity' => $quantity,
        ':purchase_price' => $purchasePrice,
    ]);

    echo json_encode(['success' => true]);
} catch (PDOException $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>
