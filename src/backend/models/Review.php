<?php
require_once __DIR__ . '/../config/database.php';

class Review {
    private $conn;
    private $table = 'reviews';

    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
    }

    public function getByMovieId($movie_id) {
        $query = "SELECT r.*, u.username 
                  FROM $this->table r 
                  JOIN users u ON r.user_id = u.id 
                  WHERE r.movie_id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("i", $movie_id);
        $stmt->execute();
        return $stmt->get_result();
    }

    public function create($movie_id, $user_id, $rating, $comment) {
        $query = "INSERT INTO $this->table (movie_id, user_id, rating, comment) VALUES (?, ?, ?, ?)";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("iiis", $movie_id, $user_id, $rating, $comment);
        return $stmt->execute() ? $this->conn->insert_id : false;
    }

    public function update($id, $rating, $comment) {
        $query = "UPDATE $this->table SET rating = ?, comment = ? WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("isi", $rating, $comment, $id);
        return $stmt->execute();
    }

    public function delete($id) {
        $query = "DELETE FROM $this->table WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("i", $id);
        return $stmt->execute();
    }

    public function getById($id) {
        $query = "SELECT * FROM $this->table WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("i", $id);
        $stmt->execute();
        return $stmt->get_result()->fetch_assoc();
    }

    // Thêm các phương thức cho comments
    public function createComment($movie_id, $user_id, $content, $parent_id = null) {
        $query = "INSERT INTO comments (movie_id, user_id, content, parent_id) VALUES (?, ?, ?, ?)";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("iisi", $movie_id, $user_id, $content, $parent_id);
        return $stmt->execute() ? $this->conn->insert_id : false;
    }

    public function getComments($movie_id) {
        $query = "WITH RECURSIVE comment_tree AS (
            SELECT id, movie_id, user_id, content, created_at, updated_at, parent_id, 0 AS level
            FROM comments
            WHERE movie_id = ? AND parent_id IS NULL
            UNION ALL
            SELECT c.id, c.movie_id, c.user_id, c.content, c.created_at, c.updated_at, c.parent_id, ct.level + 1
            FROM comments c
            INNER JOIN comment_tree ct ON c.parent_id = ct.id
        )
        SELECT ct.*, u.username
        FROM comment_tree ct
        JOIN users u ON ct.user_id = u.id
        ORDER BY ct.created_at DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("i", $movie_id);
        $stmt->execute();
        $result = $stmt->get_result();
        $comments = [];
        while ($row = $result->fetch_assoc()) {
            $comments[] = $row;
        }
        return $this->buildNestedComments($comments);
    }

    private function buildNestedComments($comments, $parent_id = null) {
        $nested = [];
        foreach ($comments as $comment) {
            if ($comment['parent_id'] == $parent_id) {
                $children = $this->buildNestedComments($comments, $comment['id']);
                if (!empty($children)) {
                    $comment['children'] = $children;
                }
                $nested[] = $comment;
            }
        }
        return $nested;
    }

    public function updateComment($id, $content) {
        $query = "UPDATE comments SET content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("si", $content, $id);
        return $stmt->execute();
    }

    public function deleteComment($id) {
        $query = "DELETE FROM comments WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("i", $id);
        return $stmt->execute();
    }

    public function getCommentById($id) {
        $query = "SELECT * FROM comments WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("i", $id);
        $stmt->execute();
        return $stmt->get_result()->fetch_assoc();
    }
}
?>