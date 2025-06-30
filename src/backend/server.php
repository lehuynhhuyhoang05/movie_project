<?php

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
require_once __DIR__ . '/utils/Auth.php';

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowed_origins = [
    'http://192.168.102.58',
    'http://localhost',
    'http://192.168.102.x',
    'http://127.0.0.1:5500',
    'http://localhost:5500',
    'https://7976-2405-4802-919f-6d60-d8bd-70ce-830a-243c.ngrok-free.app',
    'http://movieonfe.atwebpages.com'
];

header('Content-Type: application/json; charset=UTF-8');
if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
    header("Access-Control-Allow-Credentials: true");
} else {
    header("Access-Control-Allow-Origin: http://movieon.atwebpages.com");
}
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

error_log("Before Auth::init()");
Auth::init();
error_log("After Auth::init()");

$controllers = [
    'movie' => 'MovieController',
    'genre' => 'GenreController',
    'user' => 'UserController',
    'review' => 'ReviewController',
    'actor' => 'ActorController'
];

$controllerName = isset($_GET['controller']) ? strtolower($_GET['controller']) : null;
$method = isset($_GET['method']) ? $_GET['method'] : null;
$id = isset($_GET['id']) ? (int)$_GET['id'] : null;
$movie_id = isset($_GET['movie_id']) ? (int)$_GET['movie_id'] : null;
$genre_name = isset($_GET['genre_name']) ? $_GET['genre_name'] : null;
$keyword = isset($_GET['keyword']) ? $_GET['keyword'] : null;
$page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
$perPage = isset($_GET['perPage']) ? (int)$_GET['perPage'] : 10;
$actor_id = isset($_GET['actor_id']) ? (int)$_GET['actor_id'] : null;

if (!$controllerName || !array_key_exists($controllerName, $controllers)) {
    http_response_code(404);
    echo json_encode(["status" => "error", "message" => "Controller not found"]);
    exit;
}

if (!$method) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Method is required"]);
    exit;
}

require_once __DIR__ . '/controllers/' . $controllers[$controllerName] . '.php';
$controllerClass = $controllers[$controllerName];
$controller = new $controllerClass();

try {
    switch ($controllerName) {
        case 'movie':
            switch ($method) {
                case 'index':
                    $controller->index();
                    break;
                case 'detail':
                    if (!$id) throw new Exception("ID is required");
                    $controller->detail($id);
                    break;
                case 'create':
                    $controller->create();
                    break;
                case 'update':
                    if (!$id) throw new Exception("ID is required");
                    $controller->update($id);
                    break;
                case 'delete':
                    if (!$id) throw new Exception("ID is required");
                    $controller->delete($id);
                    break;
                case 'search':
                    $controller->search();
                    break;
                case 'getByGenre':
                    if (!$genre_name) throw new Exception("genre_name is required");
                    $controller->getByGenre($genre_name);
                    break;
                case 'addFavorite':
                    if (!$movie_id) throw new Exception("movie_id is required");
                    $controller->addFavorite($movie_id);
                    break;
                case 'removeFavorite':
                    if (!$movie_id) throw new Exception("movie_id is required");
                    $controller->removeFavorite($movie_id);
                    break;
                case 'getFavorites':
                    $controller->getFavorites();
                    break;
                case 'addWatchHistory':
                    if (!$movie_id) throw new Exception("movie_id is required");
                    $controller->addWatchHistory();
                    break;
                case 'getWatchHistory':
                    $controller->getWatchHistory();
                    break;

                case 'addToWatchlist':
            $controller->addToWatchlist();
            break;
        case 'removeFromWatchlist':
            $controller->removeFromWatchlist();
            break;
        case 'getWatchlist':
            $controller->getWatchlist();
            break;
        case 'createWatchlist': // Thêm phương thức này
                    $controller->createWatchlist();
                    break;
                
        case'getWatchlistOptions':
            $controller->getWatchlistOptions();
            break;
        case 'getWatchlistMoviesByType': // Thêm endpoint mới
                $controller->getWatchlistMoviesByType();
                break;
        case 'removeWatchHistory':
            $controller->removeWatchHistory();
            break;
        case 'deleteWatchlist':
            $controller->deleteWatchlist();
            break;
                default:
                    throw new Exception("Method not found");
            }
            break;

        case 'genre':
            switch ($method) {
                case 'index':
                    $controller->index();
                    break;
                case 'create':
                    $controller->create();
                    break;
                case 'update':
                    if (!$id) throw new Exception("ID is required");
                    $controller->update($id);
                    break;
                case 'delete':
                    if (!$id) throw new Exception("ID is required");
                    $controller->delete($id);
                    break;
                case 'checkGenreMovies':
                    if (!$id) throw new Exception("ID is required");
                    $controller->checkGenreMovies($id);
                    break;
                default:
                    throw new Exception("Method not found");
            }
            break;

        case 'user':
            switch ($method) {
                case 'index':
                    $controller->index();
                    break;
                case 'register':
                    error_log("Calling UserController::register()");
                    $controller->register();
                    break;
                case 'login':
                    $controller->login();
                    break;
                case 'logout':
                    $controller->logout();
                    break;
                case 'delete':
                    if (!$id) throw new Exception("ID is required");
                    $controller->delete($id);
                    break;
                case 'updateProfile':
                    $controller->updateProfile();
                    break;
                case 'changePassword':
                    $controller->changePassword();
                    break;
                case 'update':
                    $controller->update();
                    break;
                case 'create':
                    $controller->create();
                    break;
                case 'verify':
                    $controller->verify();
                    break;
                case 'getProfile':
                    $controller->getProfile();
                    break;
                case 'forgotPassword':
                    $controller->forgotPassword();
                    break;
                case 'resetPassword':
                    $controller->resetPassword();
                    break;
                case 'getNotifications':
                    $controller->getNotifications();
                    break;
                default:
                    throw new Exception("Method not found");
            }
            break;

        case 'review':
            switch ($method) {
                case 'getByMovie':
                    $controller->getByMovie($id);
                    break;
                case 'create':
                    $controller->create();
                    break;
                case 'update':
                    $controller->update($id);
                    break;
                case 'delete':
                    $controller->delete($id);
                    break;
                case 'createComment':
                    $controller->createComment();
                    break;
                case 'getComments':
                    $controller->getComments($id);
                    break;
                case 'updateComment':
                    $controller->updateComment($id);
                    break;
                case 'deleteComment':
                    $controller->deleteComment($id);
                    break;
                default:
                    throw new Exception("Invalid method");
            }
            break;

        case 'actor':
            switch ($method) {
                case 'index':
                    $controller->index();
                    break;
                case 'show':
                    if (!$actor_id) throw new Exception("actor_id is required");
                    $controller->show($actor_id);
                    break;
                default:
                    throw new Exception("Method not found");
            }
            break;

        default:
            throw new Exception("Controller not found");
    }
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>