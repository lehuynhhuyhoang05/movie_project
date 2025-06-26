<?php
require_once __DIR__ . '/../models/Genre.php';
require_once __DIR__ . '/../utils/Auth.php';

class GenreController {
    private $genreModel;

    public function __construct() {
        $this->genreModel = new Genre();
    }

    public function index() {
        $genres = $this->genreModel->getAll();
        $data = [];
        while ($row = $genres->fetch_assoc()) {
            $data[] = $row;
        }
        header('Content-Type: application/json');
        echo json_encode(["status" => "success", "data" => $data, "total" => count($data)]);
    }

    public function create() {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(["status" => "error", "message" => "Method not allowed"]);
            return;
        }

        if (!Auth::isAdmin()) {
            http_response_code(403);
            echo json_encode(["status" => "error", "message" => "Admin access required"]);
            return;
        }

        $data = json_decode(file_get_contents('php://input'), true);
        $name = $data['name'] ?? '';

        if (empty($name)) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Name is required"]);
            return;
        }

        try {
            $newGenreId = $this->genreModel->create($name);
            if ($newGenreId) {
                $newGenre = $this->genreModel->getById($newGenreId);
                echo json_encode(["status" => "success", "data" => $newGenre]);
            } else {
                http_response_code(500);
                echo json_encode(["status" => "error", "message" => "Failed to create genre"]);
            }
        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Failed to create genre: " . $e->getMessage()]);
        }
    }

    public function update($id) {
        if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
            http_response_code(405);
            echo json_encode(["status" => "error", "message" => "Method not allowed"]);
            return;
        }

        if (!Auth::isAdmin()) {
            http_response_code(403);
            echo json_encode(["status" => "error", "message" => "Admin access required"]);
            return;
        }

        $data = json_decode(file_get_contents('php://input'), true);
        $name = $data['name'] ?? '';

        if (empty($name)) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Name is required"]);
            return;
        }

        try {
            if ($this->genreModel->update($id, $name)) {
                echo json_encode(["status" => "success", "message" => "Genre updated successfully"]);
            } else {
                http_response_code(500);
                echo json_encode(["status" => "error", "message" => "Failed to update genre"]);
            }
        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Failed to update genre: " . $e->getMessage()]);
        }
    }

    public function delete($id) {
        if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
            http_response_code(405);
            echo json_encode(["status" => "error", "message" => "Method not allowed"]);
            return;
        }

        if (!Auth::isAdmin()) {
            http_response_code(403);
            echo json_encode(["status" => "error", "message" => "Admin access required"]);
            return;
        }

        if ($this->genreModel->delete($id)) {
            echo json_encode(["status" => "success", "message" => "Genre deleted successfully"]);
        } else {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Failed to delete genre"]);
        }
    }

    public function checkGenreMovies($id) {
        if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
            http_response_code(405);
            echo json_encode(["status" => "error", "message" => "Method not allowed"]);
            return;
        }

        if (!Auth::isAdmin()) {
            http_response_code(403);
            echo json_encode(["status" => "error", "message" => "Admin access required"]);
            return;
        }

        $movieCount = $this->genreModel->checkGenreMovies($id);
        echo json_encode(["status" => "success", "movieCount" => $movieCount]);
    }
}
?>