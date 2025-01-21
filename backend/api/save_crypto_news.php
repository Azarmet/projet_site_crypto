<?php
// Connexion à la base de données
$host = 'localhost';
$db = 'crypto_invest';
$user = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db", $user, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Récupérer les données JSON
    $input = file_get_contents('php://input');
    $articles = json_decode($input, true)['articles'] ?? [];

    foreach ($articles as $article) {
        $title = $article['title'];
        $description = $article['description'];
        $image_url = $article['image_url'];
        $pub_date = $article['published_at']; // Notez que `published_at` correspond à `pub_date`
        $url = $article['url'];
        $source = $article['source'];

        // Vérifiez si l'article existe déjà
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM crypto_news WHERE title = :title");
        $stmt->execute(['title' => $title]);
        if ($stmt->fetchColumn() == 0) {
            // Insérez l'article dans la base
            $stmt = $pdo->prepare("INSERT INTO crypto_news (title, description, image_url, pub_date, url, source)
                                   VALUES (:title, :description, :image_url, :pub_date, :url, :source)");
            $stmt->execute([
                'title' => $title,
                'description' => $description,
                'image_url' => $image_url,
                'pub_date' => $pub_date,
                'url' => $url,
                'source' => $source
            ]);
        }
    }
    file_put_contents('debug_log.txt', "Nombre d'articles reçus : " . count($articles) . "\n", FILE_APPEND);

    echo json_encode(['success' => true]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>
