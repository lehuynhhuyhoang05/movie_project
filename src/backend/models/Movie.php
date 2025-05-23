<?php
require_once __DIR__ . '/../config/database.php';

class Movie {
    private $conn;
    private $table = 'movies';

    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
    }

    public function getAll($page = 1, $perPage = 0) {
        $query = "SELECT m.*, g.name as genre_name 
                  FROM $this->table m 
                  LEFT JOIN genres g ON m.genre_id = g.id";
        
        if ($perPage > 0) {
            $offset = ($page - 1) * $perPage;
            $query .= " LIMIT ? OFFSET ?";
            $stmt = $this->conn->prepare($query);
            $stmt->bind_param("ii", $perPage, $offset);
        } else {
            $stmt = $this->conn->prepare($query);
        }
        
        $stmt->execute();
        return $stmt->get_result();
    }

    public function getById($id) {
        $query = "SELECT m.*, g.name as genre_name 
                  FROM $this->table m 
                  LEFT JOIN genres g ON m.genre_id = g.id 
                  WHERE m.id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $movie = $stmt->get_result()->fetch_assoc();

        if ($movie) {
            $queryActors = "SELECT a.id, a.name, a.profile_url, ma.role 
                            FROM actors a 
                            JOIN movie_actors ma ON a.id = ma.actor_id 
                            WHERE ma.movie_id = ?";
            $stmtActors = $this->conn->prepare($queryActors);
            $stmtActors->bind_param("i", $id);
            $stmtActors->execute();
            $actorsResult = $stmtActors->get_result();
            $actors = [];
            while ($actor = $actorsResult->fetch_assoc()) {
                $actors[] = $actor;
            }
            $movie['actors'] = $actors;
        }

        return $movie;
    }

    public function create($title, $description, $release_date, $poster_url, $trailer_url, $duration, $imdb_rating, $director, $genre_id) {
        $query = "INSERT INTO $this->table (title, description, release_date, poster_url, trailer_url, duration, imdb_rating, director, genre_id) 
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("sssssidss", $title, $description, $release_date, $poster_url, $trailer_url, $duration, $imdb_rating, $director, $genre_id);
        return $stmt->execute() ? $this->conn->insert_id : false;
    }

    public function update($id, $title, $description, $release_date, $poster_url, $trailer_url, $duration, $imdb_rating, $director, $genre_id) {
        $query = "UPDATE $this->table 
                  SET title = ?, description = ?, release_date = ?, poster_url = ?, trailer_url = ?, duration = ?, imdb_rating = ?, director = ?, genre_id = ? 
                  WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("sssssidssi", $title, $description, $release_date, $poster_url, $trailer_url, $duration, $imdb_rating, $director, $genre_id, $id);
        return $stmt->execute();
    }

    public function delete($id) {
        $query = "DELETE FROM $this->table WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("i", $id);
        return $stmt->execute();
    }

    public function search($keyword, $page = 1, $perPage = 0) {
        $keyword = "%$keyword%";
        $query = "SELECT m.*, g.name as genre_name 
                  FROM $this->table m 
                  LEFT JOIN genres g ON m.genre_id = g.id 
                  WHERE m.title LIKE ? OR m.description LIKE ? OR m.director LIKE ?";
        
        if ($perPage > 0) {
            $offset = ($page - 1) * $perPage;
            $query .= " LIMIT ? OFFSET ?";
            $stmt = $this->conn->prepare($query);
            $stmt->bind_param("sssii", $keyword, $keyword, $keyword, $perPage, $offset);
        } else {
            $stmt = $this->conn->prepare($query);
            $stmt->bind_param("sss", $keyword, $keyword, $keyword);
        }
        
        $stmt->execute();
        return $stmt->get_result();
    }

    public function getByGenre($genre_name, $page = 1, $perPage = 0) {
        $query = "SELECT m.*, g.name as genre_name 
                  FROM $this->table m 
                  LEFT JOIN genres g ON m.genre_id = g.id 
                  WHERE g.name = ?";
        
        if ($perPage > 0) {
            $offset = ($page - 1) * $perPage;
            $query .= " LIMIT ? OFFSET ?";
            $stmt = $this->conn->prepare($query);
            $stmt->bind_param("sii", $genre_name, $perPage, $offset);
        } else {
            $stmt = $this->conn->prepare($query);
            $stmt->bind_param("s", $genre_name);
        }
        
        $stmt->execute();
        return $stmt->get_result();
    }

    public function addFavorite($user_id, $movie_id) {
        $stmt = $this->conn->prepare("SELECT id FROM movies WHERE id = ?");
        $stmt->bind_param("i", $movie_id);
        $stmt->execute();
        $result = $stmt->get_result();
        if ($result->num_rows === 0) {
            return false;
        }
        $stmt->close();

        $stmt = $this->conn->prepare("INSERT INTO favorites (user_id, movie_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE created_at = NOW()");
        $stmt->bind_param("ii", $user_id, $movie_id);
        return $stmt->execute();
    }

    public function removeFavorite($user_id, $movie_id) {
        $stmt = $this->conn->prepare("SELECT id FROM favorites WHERE user_id = ? AND movie_id = ?");
        $stmt->bind_param("ii", $user_id, $movie_id);
        $stmt->execute();
        $result = $stmt->get_result();
        if ($result->num_rows === 0) {
            return false;
        }
        $stmt->close();

        $stmt = $this->conn->prepare("DELETE FROM favorites WHERE user_id = ? AND movie_id = ?");
        $stmt->bind_param("ii", $user_id, $movie_id);
        return $stmt->execute();
    }

    public function getFavorites($user_id) {
        $stmt = $this->conn->prepare("
            SELECT m.*, g.name as genre_name 
            FROM favorites f 
            JOIN movies m ON f.movie_id = m.id 
            LEFT JOIN genres g ON m.genre_id = g.id 
            WHERE f.user_id = ?
            ORDER BY f.created_at DESC
        ");
        $stmt->bind_param("i", $user_id);
        $stmt->execute();
        $result = $stmt->get_result();
        $favorites = [];
        while ($row = $result->fetch_assoc()) {
            $movie_id = $row['id'];
            $queryActors = "SELECT a.id, a.name, a.profile_url, ma.role 
                            FROM actors a 
                            JOIN movie_actors ma ON a.id = ma.actor_id 
                            WHERE ma.movie_id = ?";
            $stmtActors = $this->conn->prepare($queryActors);
            $stmtActors->bind_param("i", $movie_id);
            $stmtActors->execute();
            $actorsResult = $stmtActors->get_result();
            $actors = [];
            while ($actor = $actorsResult->fetch_assoc()) {
                $actors[] = $actor;
            }
            $row['actors'] = $actors;
            $favorites[] = $row;
        }
        return $favorites; // Sửa lại để trả về mảng $favorites
    }

    public function addWatchHistory($user_id, $movie_id) {
        $stmt = $this->conn->prepare("SELECT id FROM movies WHERE id = ?");
        $stmt->bind_param("i", $movie_id);
        $stmt->execute();
        $result = $stmt->get_result();
        if ($result->num_rows === 0) {
            return false;
        }
        $stmt->close();

        $stmt = $this->conn->prepare("INSERT INTO watch_history (user_id, movie_id) VALUES (?, ?)");
        $stmt->bind_param("ii", $user_id, $movie_id);
        return $stmt->execute();
    }

    public function getWatchHistory($user_id) {
        $stmt = $this->conn->prepare("
            SELECT m.*, g.name as genre_name 
            FROM watch_history w 
            JOIN movies m ON w.movie_id = m.id 
            LEFT JOIN genres g ON m.genre_id = g.id 
            WHERE w.user_id = ?
            ORDER BY w.watched_at DESC
        ");
        $stmt->bind_param("i", $user_id);
        $stmt->execute();
        $result = $stmt->get_result();
        $history = [];
        while ($row = $result->fetch_assoc()) {
            $movie_id = $row['id'];
            $queryActors = "SELECT a.id, a.name, a.profile_url, ma.role 
                            FROM actors a 
                            JOIN movie_actors ma ON a.id = ma.actor_id 
                            WHERE ma.movie_id = ?";
            $stmtActors = $this->conn->prepare($queryActors);
            $stmtActors->bind_param("i", $movie_id);
            $stmtActors->execute();
            $actorsResult = $stmtActors->get_result();
            $actors = [];
            while ($actor = $actorsResult->fetch_assoc()) {
                $actors[] = $actor;
            }
            $row['actors'] = $actors;
            $history[] = $row;
        }
        return $history; // Sửa lại để trả về mảng $history
    }
}
?>