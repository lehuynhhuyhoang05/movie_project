<?php
require_once __DIR__ . '/../config/database.php';

class Movie {
    private $conn;
    private $table = 'movies';

    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
    }

    // Thêm phương thức public để truy cập $conn nếu cần (tùy chọn)
    public function getConnection() {
        return $this->conn;
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
            $stmtActors->close();
        }

        $stmt->close();
        return $movie;
    }

    public function create($title, $description, $release_date, $poster_url, $trailer_url, $duration, $imdb_rating, $director, $genre_id) {
        $query = "INSERT INTO $this->table (title, description, release_date, poster_url, trailer_url, duration, imdb_rating, director, genre_id) 
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("sssssidss", $title, $description, $release_date, $poster_url, $trailer_url, $duration, $imdb_rating, $director, $genre_id);
        $success = $stmt->execute();
        $id = $success ? $this->conn->insert_id : false;
        $stmt->close();
        return $id;
    }

    public function update($id, $title, $description, $release_date, $poster_url, $trailer_url, $duration, $imdb_rating, $director, $genre_id) {
        $query = "UPDATE $this->table 
                  SET title = ?, description = ?, release_date = ?, poster_url = ?, trailer_url = ?, duration = ?, imdb_rating = ?, director = ?, genre_id = ? 
                  WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("sssssidssi", $title, $description, $release_date, $poster_url, $trailer_url, $duration, $imdb_rating, $director, $genre_id, $id);
        $success = $stmt->execute();
        $stmt->close();
        return $success;
    }

    public function delete($id) {
        $query = "DELETE FROM $this->table WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("i", $id);
        $success = $stmt->execute();
        $stmt->close();
        return $success;
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
        $result = $stmt->get_result();
        $stmt->close();
        return $result;
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
        $result = $stmt->get_result();
        $stmt->close();
        return $result;
    }

    public function addFavorite($user_id, $movie_id) {
        $stmt = $this->conn->prepare("SELECT id FROM movies WHERE id = ?");
        $stmt->bind_param("i", $movie_id);
        $stmt->execute();
        $result = $stmt->get_result();
        if ($result->num_rows === 0) {
            $stmt->close();
            return false;
        }
        $stmt->close();

        $stmt = $this->conn->prepare("INSERT INTO favorites (user_id, movie_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE created_at = NOW()");
        $stmt->bind_param("ii", $user_id, $movie_id);
        $success = $stmt->execute();
        $stmt->close();
        return $success;
    }

    public function removeFavorite($user_id, $movie_id) {
        $stmt = $this->conn->prepare("SELECT id FROM favorites WHERE user_id = ? AND movie_id = ?");
        $stmt->bind_param("ii", $user_id, $movie_id);
        $stmt->execute();
        $result = $stmt->get_result();
        if ($result->num_rows === 0) {
            $stmt->close();
            return false;
        }
        $stmt->close();

        $stmt = $this->conn->prepare("DELETE FROM favorites WHERE user_id = ? AND movie_id = ?");
        $stmt->bind_param("ii", $user_id, $movie_id);
        $success = $stmt->execute();
        $stmt->close();
        return $success;
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
            $stmtActors->close();
        }
        $stmt->close();
        return $favorites;
    }

    public function addWatchHistory($user_id, $movie_id) {
        $stmt = $this->conn->prepare("SELECT id FROM movies WHERE id = ?");
        $stmt->bind_param("i", $movie_id);
        $stmt->execute();
        $result = $stmt->get_result();
        if ($result->num_rows === 0) {
            error_log("Movie ID $movie_id not found for user_id $user_id");
            $stmt->close();
            return false;
        }
        $stmt->close();

        $stmt = $this->conn->prepare("INSERT INTO watch_history (user_id, movie_id) VALUES (?, ?)");
        $stmt->bind_param("ii", $user_id, $movie_id);
        $success = $stmt->execute();
        if (!$success) {
            error_log("Failed to insert into watch_history for user_id $user_id, movie_id $movie_id: " . $this->conn->error);
        } else {
            error_log("Successfully inserted into watch_history for user_id $user_id, movie_id $movie_id");
        }
        $stmt->close();
        return $success;
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
            $stmtActors->close();
        }
        $stmt->close();
        return $history;
    }
    public function getWatchlistMoviesByType($userId, $listType) {
    $conn = $this->getConnection();
    $stmt = $conn->prepare("
        SELECT m.id, m.title, m.release_date, m.poster_url, m.duration, m.director, m.imdb_rating, g.name AS genre_name
        FROM watchlist w
        LEFT JOIN movies m ON w.movie_id = m.id
        LEFT JOIN genres g ON m.genre_id = g.id
        WHERE w.user_id = ? AND w.list_type = ? AND m.id IS NOT NULL
    ");
    $stmt->bind_param("is", $userId, $listType);
    $stmt->execute();
    $result = $stmt->get_result();
    $movies = $result->fetch_all(MYSQLI_ASSOC);
    $stmt->close();
    return $movies;
}

public function removeWatchHistory($user_id, $movie_id) {
        $stmt = $this->conn->prepare("SELECT id FROM watch_history WHERE user_id = ? AND movie_id = ?");
        $stmt->bind_param("ii", $user_id, $movie_id);
        $stmt->execute();
        $result = $stmt->get_result();
        if ($result->num_rows === 0) {
            $stmt->close();
            return false;
        }
        $stmt->close();

        $stmt = $this->conn->prepare("DELETE FROM watch_history WHERE user_id = ? AND movie_id = ?");
        $stmt->bind_param("ii", $user_id, $movie_id);
        $success = $stmt->execute();
        $stmt->close();
        return $success;
    }
}
?>