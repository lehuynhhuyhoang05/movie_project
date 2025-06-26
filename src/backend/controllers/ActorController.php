<?php
require_once __DIR__ . '/../models/Actor.php';

class ActorController {
    private $actorModel;

    public function __construct() {
        $this->actorModel = new Actor();
    }

    public function index() {
        $actors = $this->actorModel->getAllActors();
        header('Content-Type: application/json');
        echo json_encode([
            "status" => "success",
            "data" => $actors,
            "total" => count($actors)
        ]);
    }

    public function show($actorId) {
        // Kiểm tra diễn viên có tồn tại không
        $actor = $this->actorModel->getActorById($actorId);
        if (!$actor) {
            http_response_code(404);
            echo json_encode(["status" => "error", "message" => "Actor not found"]);
            return;
        }

        // Lấy tham số phân trang từ query string
        $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
        $perPage = isset($_GET['perPage']) ? (int)$_GET['perPage'] : 10;

        // Lấy danh sách phim
        $result = $this->actorModel->getMoviesByActor($actorId, $page, $perPage);
        $movies = $result['movies'];

        if (empty($movies)) {
            http_response_code(404);
            echo json_encode(["status" => "error", "message" => "No movies found for this actor"]);
            return;
        }

        header('Content-Type: application/json');
        echo json_encode([
            "status" => "success",
            "actor" => $actor,
            "data" => $movies,
            "pagination" => [
                "total" => $result['total'],
                "page" => $result['page'],
                "perPage" => $result['perPage'],
                "totalPages" => $result['totalPages']
            ]
        ]);
    }
}