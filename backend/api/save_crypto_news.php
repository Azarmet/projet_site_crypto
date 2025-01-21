<?php
header('Content-Type: application/json');

try {
    // Connexion à la base de données
    $host = 'localhost';
    $db = 'crypto_invest';
    $user = 'root';
    $password = '';

    $pdo = new PDO("mysql:host=$host;dbname=$db", $user, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Récupérer les données envoyées par le frontend
    $input = file_get_contents('php://input');
    file_put_contents('debug_log.txt', "Requête reçue : $input\n", FILE_APPEND);

    $articles = json_decode($input, true)['articles'] ?? [];
    if (empty($articles)) {
        throw new Exception("Aucun article reçu.");
    }

    // Insérer les articles
    foreach ($articles as $article) {
        // Valider et définir des valeurs par défaut
        $title = $article['title'] ?? 'Titre inconnu';
        $description = $article['description'] ?? 'Description non disponible';
        $image_url = $article['image_url'] ?? '';
        $pub_date = $article['published_at'] ?? date('Y-m-d H:i:s'); // Date actuelle si non fournie
        $url = $article['url'] ?? '#';
        $source = $article['source'] ?? 'Source inconnue';
    
        // Vérifier les doublons
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM crypto_news WHERE title = :title");
        $stmt->execute([':title' => $title]);
        if ($stmt->fetchColumn() > 0) {
            continue; // Ignorer cet article s'il existe déjà
        }
    
        // Insérer les articles dans la base de données
        $stmt = $pdo->prepare("INSERT INTO crypto_news (title, description, image_url, pub_date, url, source) 
                               VALUES (:title, :description, :image_url, :pub_date, :url, :source)");
        $stmt->execute([
            ':title' => $title,
            ':description' => $description,
            ':image_url' => $image_url,
            ':pub_date' => $pub_date,
            ':url' => $url,
            ':source' => $source
        ]);
    }
    

    echo json_encode(['success' => true]);
} catch (Exception $e) {
    http_response_code(400); // Renvoyer un code d'erreur HTTP approprié
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    exit;
}
?>
