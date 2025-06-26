<?php
require_once __DIR__ . '/../config/database.php';

class Genre {
    private $conn;
    private $table = 'genres';

    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
    }

    public function getAll() {
        $query = "SELECT * FROM $this->table";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt->get_result();
    }

    public function getById($id) {
        $query = "SELECT * FROM $this->table WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("i", $id);
        $stmt->execute();
        return $stmt->get_result()->fetch_assoc();
    }

    public function create($name) {
        $query = "INSERT INTO $this->table (name) VALUES (?)";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("s", $name);
        if ($stmt->execute()) {
            return $this->conn->insert_id;
        } else {
            throw new Exception($stmt->error); // Ném lỗi nếu vi phạm ràng buộc UNIQUE hoặc lỗi khác
        }
    }

    public function update($id, $name) {
        $query = "UPDATE $this->table SET name = ? WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("si", $name, $id);
        if ($stmt->execute()) {
            return true;
        } else {
            throw new Exception($stmt->error); // Ném lỗi nếu vi phạm ràng buộc UNIQUE hoặc lỗi khác
        }
    }

    public function delete($id) {
        $query = "DELETE FROM $this->table WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("i", $id);
        return $stmt->execute();
    }

    public function checkGenreMovies($id) {
        $query = "SELECT COUNT(*) as count FROM movies WHERE genre_id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result()->fetch_assoc();
        return $result['count'];
    }
}
?>