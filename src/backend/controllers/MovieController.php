<?php
require_once __DIR__ . '/../models/Movie.php';
require_once __DIR__ . '/../utils/Auth.php';

class MovieController {
    private $movieModel;

    public function __construct() {
        $this->movieModel = new Movie();
    }

    public function index() {
        $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
        $perPage = isset($_GET['perPage']) ? (int)$_GET['perPage'] : 0;
        $movies = $this->movieModel->getAll($page, $perPage);
        $data = [];
        while ($row = $movies->fetch_assoc()) {
            $data[] = $row;
        }
        header('Content-Type: application/json');
        echo json_encode(["status" => "success", "data" => $data, "total" => count($data)]);
    }

    public function detail($id) {
        $movie = $this->movieModel->getById($id);
        header('Content-Type: application/json');
        echo json_encode(["status" => "success", "data" => $movie ?: ["message" => "Movie not found"]]);
    }

    public function create() {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            echo json_encode(["status" => "error", "message" => "Method not allowed"]);
            return;
        }

        if (!Auth::isAdmin()) {
            echo json_encode(["status" => "error", "message" => "Admin access required"]);
            return;
        }

        $data = json_decode(file_get_contents('php://input'), true);
        $title = $data['title'] ?? '';
        $genre_id = $data['genre_id'] ?? 0;

        $description = !empty($data['description']) ? $data['description'] : null;
        $release_date = !empty($data['release_date']) ? $data['release_date'] : null;
        $poster_url = !empty($data['poster_url']) ? $data['poster_url'] : null;
        $trailer_url = !empty($data['trailer_url']) ? $data['trailer_url'] : null;
        $duration = isset($data['duration']) ? (int)$data['duration'] : null;
        $imdb_rating = isset($data['imdb_rating']) ? (float)$data['imdb_rating'] : null;
        $director = !empty($data['director']) ? $data['director'] : null;

        if (empty($title) || empty($genre_id)) {
            echo json_encode(["status" => "error", "message" => "Title and genre_id are required"]);
            return;
        }

        $movieId = $this->movieModel->create($title, $description, $release_date, $poster_url, $trailer_url, $duration, $imdb_rating, $director, $genre_id);
        if ($movieId) {
            echo json_encode(["status" => "success", "message" => "Movie created", "movie_id" => $movieId]);
        } else {
            echo json_encode(["status" => "error", "message" => "Failed to create movie"]);
        }
    }

    public function update($id) {
    if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
        echo json_encode(["status" => "error", "message" => "Method not allowed"]);
        return;
    }

    if (!Auth::isAdmin()) {
        echo json_encode(["status" => "error", "message" => "Admin access required"]);
        return;
    }

    $data = json_decode(file_get_contents('php://input'), true);

    // Lấy dữ liệu cũ
    $old = $this->movieModel->getById($id);
    if (!$old) {
        echo json_encode(["status" => "error", "message" => "Movie not found"]);
        return;
    }

    // Nếu không có trong payload thì dùng dữ liệu cũ
    $title = $data['title'] ?? $old['title'];
    $genre_id = $data['genre_id'] ?? $old['genre_id'];
    $description = $data['description'] ?? $old['description'];
    $release_date = $data['release_date'] ?? $old['release_date'];
    $poster_url = $data['poster_url'] ?? $old['poster_url'];
    $trailer_url = $data['trailer_url'] ?? $old['trailer_url'];
    $duration = $data['duration'] ?? $old['duration'];
    $imdb_rating = $data['imdb_rating'] ?? $old['imdb_rating'];
    $director = $data['director'] ?? $old['director'];

    if ($this->movieModel->update($id, $title, $description, $release_date, $poster_url, $trailer_url, $duration, $imdb_rating, $director, $genre_id)) {
        echo json_encode(["status" => "success", "message" => "Movie updated"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Failed to update movie"]);
    }
}

    public function delete($id) {
        if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
            echo json_encode(["status" => "error", "message" => "Method not allowed"]);
            return;
        }

        if (!Auth::isAdmin()) {
            echo json_encode(["status" => "error", "message" => "Admin access required"]);
            return;
        }

        if ($this->movieModel->delete($id)) {
            echo json_encode(["status" => "success", "message" => "Movie deleted"]);
        } else {
            echo json_encode(["status" => "error", "message" => "Failed to delete movie"]);
        }
    }

    public function search() {
        $keyword = isset($_GET['keyword']) ? $_GET['keyword'] : '';
        $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
        $perPage = isset($_GET['perPage']) ? (int)$_GET['perPage'] : 0;

        if (empty($keyword)) {
            echo json_encode(["status" => "error", "message" => "Keyword is required"]);
            return;
        }

        $movies = $this->movieModel->search($keyword, $page, $perPage);
        $data = [];
        while ($row = $movies->fetch_assoc()) {
            $data[] = $row;
        }
        header('Content-Type: application/json');
        echo json_encode(["status" => "success", "data" => $data, "total" => count($data)]);
    }

    public function getByGenre($genre_name) {
        $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
        $perPage = isset($_GET['perPage']) ? (int)$_GET['perPage'] : 0;

        if (empty($genre_name)) {
            echo json_encode(["status" => "error", "message" => "Genre name is required"]);
            return;
        }

        $movies = $this->movieModel->getByGenre($genre_name, $page, $perPage);
        $data = [];
        while ($row = $movies->fetch_assoc()) {
            $data[] = $row;
        }
        header('Content-Type: application/json');
        echo json_encode(["status" => "success", "data" => $data, "total" => count($data)]);
    }

    public function addFavorite($movie_id) {
        if (!Auth::check()) {
            http_response_code(401);
            echo json_encode(["status" => "error", "message" => "Unauthorized: Please login"]);
            return;
        }

        $user_id = Auth::getUserId();
        if ($this->movieModel->addFavorite($user_id, $movie_id)) {
            echo json_encode(["status" => "success", "message" => "Movie added to favorites"]);
        } else {
            http_response_code(404);
            echo json_encode(["status" => "error", "message" => "Failed to add movie to favorites"]);
        }
    }

    public function removeFavorite($movie_id) {
        if (!Auth::check()) {
            http_response_code(401);
            echo json_encode(["status" => "error", "message" => "Unauthorized: Please login"]);
            return;
        }

        $user_id = Auth::getUserId();
        if ($this->movieModel->removeFavorite($user_id, $movie_id)) {
            echo json_encode(["status" => "success", "message" => "Movie removed from favorites"]);
        } else {
            http_response_code(404);
            echo json_encode(["status" => "error", "message" => "Movie not found in favorites or failed to remove"]);
        }
    }

    public function getFavorites() {
        if (!Auth::check()) {
            http_response_code(401);
            echo json_encode(["status" => "error", "message" => "Unauthorized: Please login"]);
            return;
        }

        $user_id = Auth::getUserId();
        $data = $this->movieModel->getFavorites($user_id);
        header('Content-Type: application/json');
        echo json_encode(["status" => "success", "data" => $data, "total" => count($data)]);
    }

   // Trong file controllers/MovieController.php
public function addWatchHistory(/* Xóa $movie_id khỏi đây */) {
    // 1. Kiểm tra đăng nhập
    if (!Auth::check()) {
        http_response_code(401); // Lỗi chưa đăng nhập
        echo json_encode(["status" => "error", "message" => "Unauthorized: Please login"]);
        return;
    }

    // 2. Lấy dữ liệu từ body của request
    $input = json_decode(file_get_contents('php://input'), true);
    $movie_id = $input['movie_id'] ?? null;

    if (!$movie_id) {
        http_response_code(400); // Lỗi yêu cầu không hợp lệ
        echo json_encode(["status" => "error", "message" => "Movie ID is required"]);
        return;
    }

    // 3. Lấy user_id và thêm vào CSDL
    $user_id = Auth::getUserId();
    if ($this->movieModel->addWatchHistory($user_id, $movie_id)) {
        echo json_encode(["status" => "success", "message" => "Movie added to watch history"]);
    } else {
        http_response_code(500); // Lỗi server (ví dụ: không ghi vào CSDL được)
        echo json_encode(["status" => "error", "message" => "Failed to add movie to watch history"]);
    }
}

    public function getWatchHistory() {
        if (!Auth::check()) {
            http_response_code(401);
            echo json_encode(["status" => "error", "message" => "Unauthorized: Please login"]);
            return;
        }

        $user_id = Auth::getUserId();
        $data = $this->movieModel->getWatchHistory($user_id);
        header('Content-Type: application/json');
        echo json_encode(["status" => "success", "data" => $data, "total" => count($data)]);
    }
}
