<?php
class Actor {
    private $db;

    public function __construct() {
        require_once __DIR__ . '/../config/database.php';
        $database = new Database();
        $this->db = $database->getConnection();
    }

    public function getAllActors() {
        $query = "SELECT id, name, profile_url, created_at, updated_at FROM actors";
        $result = $this->db->query($query);

        $actors = [];
        while ($row = $result->fetch_assoc()) {
            $actors[] = $row;
        }
        return $actors;
    }

    public function getActorById($actorId) {
        $query = "SELECT id, name, profile_url FROM actors WHERE id = ?";
        $stmt = $this->db->prepare($query);
        $stmt->bind_param("i", $actorId);
        $stmt->execute();
        return $stmt->get_result()->fetch_assoc();
    }

    public function getMoviesByActor($actorId, $page = 1, $perPage = 10) {
        $offset = ($page - 1) * $perPage;

        // Đếm tổng số phim
        $countQuery = "
            SELECT COUNT(*) as total
            FROM movie_actors ma
            WHERE ma.actor_id = ?
        ";
        $countStmt = $this->db->prepare($countQuery);
        $countStmt->bind_param("i", $actorId);
        $countStmt->execute();
        $total = $countStmt->get_result()->fetch_assoc()['total'];

        // Lấy danh sách phim cơ bản với vai trò
        $query = "
            SELECT m.id, m.title, m.poster_url, m.release_date, ma.role
            FROM movies m
            JOIN movie_actors ma ON m.id = ma.movie_id
            WHERE ma.actor_id = ?
            LIMIT ? OFFSET ?
        ";
        $stmt = $this->db->prepare($query);
        $stmt->bind_param("iii", $actorId, $perPage, $offset);
        $stmt->execute();
        $result = $stmt->get_result();

        $movies = [];
        while ($row = $result->fetch_assoc()) {
            $movies[] = $row;
        }

        return [
            'movies' => $movies,
            'total' => $total,
            'page' => $page,
            'perPage' => $perPage,
            'totalPages' => ceil($total / $perPage)
        ];
    }
}