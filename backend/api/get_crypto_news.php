<?php
// Configuration de la base de données
$host = 'localhost';
$dbname = 'crypto_invest';
$user = 'root'; // Remplacez par votre utilisateur MySQL si différent
$password = ''; // Remplacez par votre mot de passe MySQL si défini

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $user, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die(json_encode(['status' => 'error', 'message' => 'Erreur de connexion à la base de données : ' . $e->getMessage()]));
}

// Récupérer les articles depuis la base
$stmt = $pdo->query("SELECT * FROM crypto_news ORDER BY created_at DESC");
$articles = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Retourner les articles en JSON
echo json_encode($articles);
?>
