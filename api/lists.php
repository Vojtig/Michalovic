<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Token');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$token = $_SERVER['HTTP_X_TOKEN'] ?? '';
if ($token !== 'mic-9kX4mW2pR7vL8j') {
    http_response_code(403);
    echo json_encode(['error' => 'Forbidden']);
    exit;
}

try {
    $pdo = new PDO(
        'mysql:host=db.db055.endora.cz;dbname=michalovic_list;charset=utf8mb4',
        'list_user',
        'VnexyHfnOH4',
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );

    $pdo->exec("CREATE TABLE IF NOT EXISTS lists_data (
        id INT PRIMARY KEY DEFAULT 1,
        data LONGTEXT NOT NULL
    )");

    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $stmt = $pdo->query("SELECT data FROM lists_data WHERE id = 1");
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        echo $row ? $row['data'] : '[]';

    } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $data = file_get_contents('php://input');
        json_decode($data);
        if (json_last_error() !== JSON_ERROR_NONE) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid JSON']);
            exit;
        }
        $stmt = $pdo->prepare(
            "INSERT INTO lists_data (id, data) VALUES (1, ?)
             ON DUPLICATE KEY UPDATE data = VALUES(data)"
        );
        $stmt->execute([$data]);
        echo json_encode(['ok' => true]);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'DB error']);
}
