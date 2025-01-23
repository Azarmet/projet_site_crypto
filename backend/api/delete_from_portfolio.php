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

    // Supprimer l'actif du portefeuille
    $stmt = $pdo->prepare("DELETE FROM user_portfolios WHERE user_id = :user_id AND symbol = :symbol");
    $stmt->execute([
        ':user_id' => $userId,
        ':symbol' => $symbol,
    ]);

    echo json_encode(['success' => true]);
} catch (PDOException $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>
