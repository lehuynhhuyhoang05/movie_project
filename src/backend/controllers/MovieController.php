<?php
require_once __DIR__ . '/../models/Movie.php';
require_once __DIR__ . '/../utils/Auth.php';

// Tắt hiển thị lỗi trực tiếp, ghi vào log
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/php_errors.log');

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

    public function addWatchHistory() {
        if (!Auth::check()) {
            http_response_code(401);
            echo json_encode(["status" => "error", "message" => "Unauthorized: Please login"]);
            return;
        }

        $input = json_decode(file_get_contents('php://input'), true);
        $movie_id = $input['movie_id'] ?? null;

        if (!$movie_id) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Movie ID is required"]);
            return;
        }

        $user_id = Auth::getUserId();
        if ($this->movieModel->addWatchHistory($user_id, $movie_id)) {
            echo json_encode(["status" => "success", "message" => "Movie added to watch history"]);
        } else {
            http_response_code(500);
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

   public function addToWatchlist() {
    header('Content-Type: application/json');
    $stmt = null;
    try {
        if (!Auth::check()) {
            http_response_code(401);
            echo json_encode(["status" => "error", "message" => "Unauthorized: Please login"]);
            return;
        }

        $input = json_decode(file_get_contents('php://input'), true);
        $movie_id = $input['movie_id'] ?? null;
        $list_type = $input['list_type'] ?? 'watch_later'; // Nhận chuỗi từ frontend

        error_log("Received Input: " . print_r($input, true)); // Log dữ liệu nhận được

        if (!$movie_id) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Movie ID is required"]);
            return;
        }

        $user_id = Auth::getUserId();
        $conn = $this->movieModel->getConnection();
        $stmt = $conn->prepare("SELECT id FROM movies WHERE id = ?");
        if ($stmt === false) {
            throw new Exception("Failed to prepare statement: " . $conn->error);
        }
        $stmt->bind_param("i", $movie_id);
        $stmt->execute();
        if ($stmt->get_result()->num_rows === 0) {
            http_response_code(404);
            echo json_encode(["status" => "error", "message" => "Movie not found"]);
            return;
        }

        // Kiểm tra và tạo list_type nếu chưa tồn tại
        $stmtCheck = $conn->prepare("SELECT 1 FROM watchlist WHERE user_id = ? AND list_type = ? LIMIT 1");
        $stmtCheck->bind_param("is", $user_id, $list_type);
        $stmtCheck->execute();
        if ($stmtCheck->get_result()->num_rows === 0) {
            $stmtCreate = $conn->prepare("INSERT INTO watchlist (user_id, movie_id, list_type) VALUES (?, NULL, ?) ON DUPLICATE KEY UPDATE created_at = NOW()");
            $stmtCreate->bind_param("is", $user_id, $list_type);
            $stmtCreate->execute();
            $stmtCreate->close();
        }
        $stmtCheck->close();

        $stmt = $conn->prepare("INSERT INTO watchlist (user_id, movie_id, list_type) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE created_at = NOW()");
        if ($stmt === false) {
            throw new Exception("Failed to prepare statement: " . $conn->error);
        }
        $stmt->bind_param("iis", $user_id, $movie_id, $list_type);

        if ($stmt->execute()) {
            error_log("Successfully added to watchlist with list_type: " . $list_type); // Log thành công
            echo json_encode(["status" => "success", "message" => "Added to watchlist", "data" => [["id" => 1, "name" => $list_type]]]);
        } else {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Failed to add to watchlist: " . $stmt->error]);
        }
    } catch (Exception $e) {
        http_response_code(500);
        error_log("Server error in addToWatchlist: " . $e->getMessage()); // Log lỗi
        echo json_encode(["status" => "error", "message" => "Server error: " . $e->getMessage()]);
    } finally {
        if (isset($stmt) && $stmt !== null) {
            $stmt->close();
        }
    }
}

    public function removeFromWatchlist() {
        header('Content-Type: application/json');
        $stmt = null;
        try {
            if (!Auth::check()) {
                http_response_code(401);
                echo json_encode(["status" => "error", "message" => "Unauthorized: Please login"]);
                return;
            }

            $input = json_decode(file_get_contents('php://input'), true);
            $movie_id = $input['movie_id'] ?? null;
            $list_type = $input['list_type'] ?? 'watch_later';

            if (!$movie_id) {
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "Movie ID is required"]);
                return;
            }

            $user_id = Auth::getUserId();
            $stmt = $this->movieModel->getConnection()->prepare("DELETE FROM watchlist WHERE user_id = ? AND movie_id = ? AND list_type = ?");
            if ($stmt === false) {
                throw new Exception("Failed to prepare statement: " . $this->movieModel->getConnection()->error);
            }
            $stmt->bind_param("iis", $user_id, $movie_id, $list_type);

            if ($stmt->execute()) {
                echo json_encode(["status" => "success", "message" => "Removed from watchlist"]);
            } else {
                http_response_code(500);
                echo json_encode(["status" => "error", "message" => "Failed to remove from watchlist: " . $stmt->error]);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Server error: " . $e->getMessage()]);
        } finally {
            if (isset($stmt) && $stmt !== null) {
                $stmt->close();
            }
        }
    }

   // Trong file MovieController.php

public function getWatchlist() {
    if (!Auth::check()) {
        http_response_code(401);
        echo json_encode(["status" => "error", "message" => "Unauthorized: Please login"]);
        return;
    }

    $user_id = Auth::getUserId();
    $conn = $this->movieModel->getConnection();

    $stmtMovies = $conn->prepare("
        SELECT m.id, m.title, m.release_date, m.poster_url, m.duration, m.director, m.imdb_rating, g.name AS genre_name, w.list_type
        FROM watchlist w
        LEFT JOIN movies m ON w.movie_id = m.id
        LEFT JOIN genres g ON m.genre_id = g.id
        WHERE w.user_id = ? AND m.id IS NOT NULL
    ");
    $stmtMovies->bind_param("i", $user_id);
    $stmtMovies->execute();
    $movies_result = $stmtMovies->get_result();
    $watchlist_movies = $movies_result->fetch_all(MYSQLI_ASSOC);
    $stmtMovies->close();

    $data = [];
    foreach ($watchlist_movies as $movie) {
        $data[] = $movie;
    }

    echo json_encode([
        "status" => "success",
        "data" => $data,
    ]);
}
    // Trong file MovieController.php

public function createWatchlist() {
        header('Content-Type: application/json');
        try {
            if (!Auth::check()) {
                http_response_code(401);
                echo json_encode(["status" => "error", "message" => "Unauthorized: Please login"]);
                return;
            }

            $input = json_decode(file_get_contents('php://input'), true);
            $list_type = $input['list_type'] ?? null;

            if (!$list_type) {
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "List type is required"]);
                return;
            }

            $user_id = Auth::getUserId();
            $conn = $this->movieModel->getConnection();

            // Kiểm tra xem danh sách đã tồn tại cho người dùng này chưa
            $checkStmt = $conn->prepare("SELECT 1 FROM watchlist WHERE user_id = ? AND list_type = ? LIMIT 1");
            $checkStmt->bind_param("is", $user_id, $list_type);
            $checkStmt->execute();
            $result = $checkStmt->get_result();
            $checkStmt->close();

            if ($result->num_rows > 0) {
                http_response_code(409); // Conflict
                echo json_encode(["status" => "error", "message" => "Danh sách đã tồn tại"]);
                return;
            }

            // Tạo danh sách mới (movie_id = NULL)
            $insertStmt = $conn->prepare("INSERT INTO watchlist (user_id, list_type, movie_id) VALUES (?, ?, NULL)");
            $insertStmt->bind_param("is", $user_id, $list_type);

            if ($insertStmt->execute()) {
                error_log("Created new watchlist: user_id=$user_id, list_type=$list_type");
                echo json_encode(["status" => "success", "message" => "Đã tạo danh sách mới thành công"]);
            } else {
                http_response_code(500);
                echo json_encode(["status" => "error", "message" => "Không thể tạo danh sách mới: " . $insertStmt->error]);
            }
            $insertStmt->close();

        } catch (Exception $e) {
            http_response_code(500);
            error_log("Server error in createWatchlist: " . $e->getMessage());
            echo json_encode(["status" => "error", "message" => "Server error: " . $e->getMessage()]);
        }
    } 


    public function getWatchlistOptions() {
    header('Content-Type: application/json');
    $stmt = null;
    try {
        // Bỏ kiểm tra đăng nhập nếu muốn public danh sách
        // Nếu vẫn muốn bắt buộc login, giữ lại đoạn này
        // if (!Auth::check()) {
        //     http_response_code(401);
        //     echo json_encode(["status" => "error", "message" => "Unauthorized: Please login"]);
        //     return;
        // }

        $conn = $this->movieModel->getConnection();

        // Truy vấn tất cả list_type khác null và rỗng
        $stmt = $conn->prepare("
            SELECT DISTINCT list_type 
            FROM watchlist 
            WHERE list_type IS NOT NULL AND list_type != ''
        ");

        if ($stmt === false) {
            throw new Exception("Failed to prepare statement: " . $conn->error);
        }

        $stmt->execute();
        $result = $stmt->get_result();

        $lists = [];
        $id = 1;
        while ($row = $result->fetch_assoc()) {
            $lists[] = [
                "id" => $id++,
                "name" => $row["list_type"]
            ];
        }

        echo json_encode([
            "status" => "success",
            "data" => $lists
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            "status" => "error",
            "message" => "Server error: " . $e->getMessage()
        ]);
    } finally {
        if (isset($stmt) && $stmt !== null) {
            $stmt->close();
        }
    }
}
public function getWatchlistMoviesByType() {
    header('Content-Type: application/json');
    $stmt = null;
    try {
        if (!Auth::check()) {
            http_response_code(401);
            echo json_encode(["status" => "error", "message" => "Unauthorized: Please login"]);
            return;
        }

        $listType = isset($_GET['list_type']) ? $_GET['list_type'] : null;
        if (!$listType) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "List type is required"]);
            return;
        }

        $userId = Auth::getUserId();
        $movies = $this->movieModel->getWatchlistMoviesByType($userId, $listType);

        echo json_encode([
            "status" => "success",
            "data" => $movies,
            "total" => count($movies)
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        error_log("Server error in getWatchlistMoviesByType: " . $e->getMessage());
        echo json_encode(["status" => "error", "message" => "Server error: " . $e->getMessage()]);
    }
}

public function removeWatchHistory() {
        header('Content-Type: application/json');
        $stmt = null;
        try {
            if (!Auth::check()) {
                http_response_code(401);
                echo json_encode(["status" => "error", "message" => "Unauthorized: Please login"]);
                return;
            }

            $input = json_decode(file_get_contents('php://input'), true);
            $movie_id = $input['movie_id'] ?? null;

            if (!$movie_id) {
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "Movie ID is required"]);
                return;
            }

            $user_id = Auth::getUserId();
            if ($this->movieModel->removeWatchHistory($user_id, $movie_id)) {
                echo json_encode(["status" => "success", "message" => "Movie removed from watch history"]);
            } else {
                http_response_code(404);
                echo json_encode(["status" => "error", "message" => "Movie not found in watch history or failed to remove"]);
            }
        } catch (Exception $e) {
            http_response_code(500);
            error_log("Server error in removeWatchHistory: " . $e->getMessage());
            echo json_encode(["status" => "error", "message" => "Server error: " . $e->getMessage()]);
        } finally {
            if (isset($stmt) && $stmt !== null) {
                $stmt->close();
            }
        }
    }


    public function deleteWatchlist() {
    header('Content-Type: application/json');
    $stmt = null;
    try {
        if (!Auth::check()) {
            http_response_code(401);
            echo json_encode(["status" => "error", "message" => "Unauthorized: Please login"]);
            return;
        }

        $input = json_decode(file_get_contents('php://input'), true);
        $list_type = $input['list_type'] ?? null;

        if (!$list_type) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "List type is required"]);
            return;
        }

        $user_id = Auth::getUserId();
        $conn = $this->movieModel->getConnection();

        // Xóa tất cả bản ghi liên quan đến list_type của user
        $stmt = $conn->prepare("DELETE FROM watchlist WHERE user_id = ? AND list_type = ?");
        if ($stmt === false) {
            throw new Exception("Failed to prepare statement: " . $conn->error);
        }
        $stmt->bind_param("is", $user_id, $list_type);

        if ($stmt->execute()) {
            echo json_encode(["status" => "success", "message" => "Watchlist deleted successfully"]);
        } else {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Failed to delete watchlist: " . $stmt->error]);
        }
    } catch (Exception $e) {
        http_response_code(500);
        error_log("Server error in deleteWatchlist: " . $e->getMessage());
        echo json_encode(["status" => "error", "message" => "Server error: " . $e->getMessage()]);
    } finally {
        if (isset($stmt) && $stmt !== null) {
            $stmt->close();
        }
    }
}
}
?>