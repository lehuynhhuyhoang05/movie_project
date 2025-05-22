<?php
  require_once __DIR__ . '/utils/Auth.php';

  $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowed_origins = ['http://127.0.0.1:5500'];

if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
    header("Access-Control-Allow-Credentials: true");
}
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
  // ✅ Xử lý preflight CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
  // Danh sách controller
  $controllers = [
      'movie' => 'MovieController',
      'genre' => 'GenreController',
      'user' => 'UserController',
      'review' => 'ReviewController'
  ];

  // Lấy tham số controller và method từ query string
  $controllerName = isset($_GET['controller']) ? strtolower($_GET['controller']) : null;
  $method = isset($_GET['method']) ? $_GET['method'] : null;
  $id = isset($_GET['id']) ? (int)$_GET['id'] : null;
  $movie_id = isset($_GET['movie_id']) ? (int)$_GET['movie_id'] : null;
  $genre_name = isset($_GET['genre_name']) ? $_GET['genre_name'] : null;
  $keyword = isset($_GET['keyword']) ? $_GET['keyword'] : null;
  $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
  $perPage = isset($_GET['perPage']) ? (int)$_GET['perPage'] : 0;

  // Kiểm tra controller có tồn tại không
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

  // Load controller
  require_once __DIR__ . '/controllers/' . $controllers[$controllerName] . '.php';
  $controllerClass = $controllers[$controllerName];
  $controller = new $controllerClass();

  // Định tuyến đến method tương ứng
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
                  default:
                      throw new Exception("Method not found");
              }
              break;

          case 'genre':
              switch ($method) {
                  case 'index':
                      $controller->index();
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
                  default:
                      throw new Exception("Method not found");
              }
              break;

          case 'review':
              switch ($method) {
                  case 'getByMovie':
                      if (!$movie_id) throw new Exception("movie_id is required");
                      $controller->getByMovie($movie_id);
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