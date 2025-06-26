<?php
require_once __DIR__ . '/../models/Review.php';
require_once __DIR__ . '/../utils/Auth.php';

class ReviewController {
    private $reviewModel;

    public function __construct() {
        $this->reviewModel = new Review();
    }

    public function getByMovie($movie_id) {
        if (!is_numeric($movie_id) || $movie_id <= 0) {
            header('Content-Type: application/json');
            echo json_encode(["status" => "error", "message" => "Invalid movie_id"]);
            return;
        }
        $reviews = $this->reviewModel->getByMovieId($movie_id);
        $data = [];
        while ($row = $reviews->fetch_assoc()) {
            $data[] = $row;
        }
        header('Content-Type: application/json');
        echo json_encode(["status" => "success", "data" => $data]);
    }

    public function create() {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            header('Content-Type: application/json');
            echo json_encode(["status" => "error", "message" => "Method not allowed"]);
            return;
        }
        if (!Auth::check()) {
            http_response_code(401);
            header('Content-Type: application/json');
            echo json_encode(["status" => "error", "message" => "Login required"]);
            return;
        }
        $data = json_decode(file_get_contents('php://input'), true);
        $movie_id = $data['movie_id'] ?? 0;
        $rating = $data['rating'] ?? 0;
        $comment = $data['comment'] ?? '';
        $user_id = Auth::getUserId();
        if ($rating < 1 || $rating > 10 || $movie_id <= 0) {
            header('Content-Type: application/json');
            echo json_encode(["status" => "error", "message" => "Invalid movie_id or rating"]);
            return;
        }
        $reviewId = $this->reviewModel->create($movie_id, $user_id, $rating, $comment);
        if ($reviewId) {
            header('Content-Type: application/json');
            echo json_encode(["status" => "success", "message" => "Review added", "review_id" => $reviewId]);
        } else {
            header('Content-Type: application/json');
            echo json_encode(["status" => "error", "message" => "Failed to add review"]);
        }
    }

    public function update($id) {
        if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
            header('Content-Type: application/json');
            echo json_encode(["status" => "error", "message" => "Method not allowed"]);
            return;
        }
        if (!Auth::check()) {
            http_response_code(401);
            header('Content-Type: application/json');
            echo json_encode(["status" => "error", "message" => "Login required"]);
            return;
        }
        $review = $this->reviewModel->getById($id);
        if (!$review) {
            header('Content-Type: application/json');
            echo json_encode(["status" => "error", "message" => "Review not found"]);
            return;
        }
        $user_id = Auth::getUserId();
        if ($review['user_id'] !== $user_id && !Auth::isAdmin()) {
            header('Content-Type: application/json');
            echo json_encode(["status" => "error", "message" => "Permission denied"]);
            return;
        }
        $data = json_decode(file_get_contents('php://input'), true);
        $rating = $data['rating'] ?? 0;
        $comment = $data['comment'] ?? '';
        if ($rating < 1 || $rating > 10) {
            header('Content-Type: application/json');
            echo json_encode(["status" => "error", "message" => "Invalid rating"]);
            return;
        }
        if ($this->reviewModel->update($id, $rating, $comment)) {
            header('Content-Type: application/json');
            echo json_encode(["status" => "success", "message" => "Review updated"]);
        } else {
            header('Content-Type: application/json');
            echo json_encode(["status" => "error", "message" => "Failed to update review"]);
        }
    }

    public function delete($id) {
        if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
            header('Content-Type: application/json');
            echo json_encode(["status" => "error", "message" => "Method not allowed"]);
            return;
        }
        if (!Auth::check()) {
            http_response_code(401);
            header('Content-Type: application/json');
            echo json_encode(["status" => "error", "message" => "Login required"]);
            return;
        }
        $review = $this->reviewModel->getById($id);
        if (!$review) {
            header('Content-Type: application/json');
            echo json_encode(["status" => "error", "message" => "Review not found"]);
            return;
        }
        $user_id = Auth::getUserId();
        if ($review['user_id'] !== $user_id && !Auth::isAdmin()) {
            header('Content-Type: application/json');
            echo json_encode(["status" => "error", "message" => "Permission denied"]);
            return;
        }
        if ($this->reviewModel->delete($id)) {
            header('Content-Type: application/json');
            echo json_encode(["status" => "success", "message" => "Review deleted"]);
        } else {
            header('Content-Type: application/json');
            echo json_encode(["status" => "error", "message" => "Failed to delete review"]);
        }
    }

    public function createComment() {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            header('Content-Type: application/json');
            echo json_encode(["status" => "error", "message" => "Method not allowed"]);
            return;
        }
        if (!Auth::check()) {
            http_response_code(401);
            header('Content-Type: application/json');
            echo json_encode(["status" => "error", "message" => "Login required"]);
            return;
        }
        $data = json_decode(file_get_contents('php://input'), true);
        $movie_id = $data['movie_id'] ?? 0;
        $content = trim($data['content'] ?? '');
        $parent_id = $data['parent_id'] ?? null;
        if (!is_numeric($movie_id) || $movie_id <= 0 || empty($content)) {
            header('Content-Type: application/json');
            echo json_encode(["status" => "error", "message" => "Invalid movie_id or content"]);
            return;
        }
        $user_id = Auth::getUserId();
        $commentId = $this->reviewModel->createComment($movie_id, $user_id, $content, $parent_id);
        if ($commentId) {
            header('Content-Type: application/json');
            echo json_encode(["status" => "success", "message" => "Comment added", "comment_id" => $commentId]);
        } else {
            header('Content-Type: application/json');
            echo json_encode(["status" => "error", "message" => "Failed to add comment"]);
        }
    }

    public function getComments($movie_id) {
        if (!is_numeric($movie_id) || $movie_id <= 0) {
            header('Content-Type: application/json');
            echo json_encode(["status" => "error", "message" => "Invalid movie_id"]);
            return;
        }
        $comments = $this->reviewModel->getComments($movie_id);
        header('Content-Type: application/json');
        echo json_encode(["status" => "success", "data" => $comments, "total" => count($comments)]);
    }

    public function updateComment($id) {
        if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
            header('Content-Type: application/json');
            echo json_encode(["status" => "error", "message" => "Method not allowed"]);
            return;
        }
        if (!Auth::check()) {
            http_response_code(401);
            header('Content-Type: application/json');
            echo json_encode(["status" => "error", "message" => "Login required"]);
            return;
        }
        $comment = $this->reviewModel->getCommentById($id);
        if (!$comment) {
            header('Content-Type: application/json');
            echo json_encode(["status" => "error", "message" => "Comment not found"]);
            return;
        }
        $user_id = Auth::getUserId();
        if ($comment['user_id'] !== $user_id && !Auth::isAdmin()) {
            header('Content-Type: application/json');
            echo json_encode(["status" => "error", "message" => "Permission denied"]);
            return;
        }
        $data = json_decode(file_get_contents('php://input'), true);
        $content = trim($data['content'] ?? '');
        if (empty($content)) {
            header('Content-Type: application/json');
            echo json_encode(["status" => "error", "message" => "Content is required"]);
            return;
        }
        if ($this->reviewModel->updateComment($id, $content)) {
            header('Content-Type: application/json');
            echo json_encode(["status" => "success", "message" => "Comment updated"]);
        } else {
            header('Content-Type: application/json');
            echo json_encode(["status" => "error", "message" => "Failed to update comment"]);
        }
    }

    public function deleteComment($id) {
        if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
            header('Content-Type: application/json');
            echo json_encode(["status" => "error", "message" => "Method not allowed"]);
            return;
        }
        if (!Auth::check()) {
            http_response_code(401);
            header('Content-Type: application/json');
            echo json_encode(["status" => "error", "message" => "Login required"]);
            return;
        }
        $comment = $this->reviewModel->getCommentById($id);
        if (!$comment) {
            header('Content-Type: application/json');
            echo json_encode(["status" => "error", "message" => "Comment not found"]);
            return;
        }
        $user_id = Auth::getUserId();
        if ($comment['user_id'] !== $user_id && !Auth::isAdmin()) {
            header('Content-Type: application/json');
            echo json_encode(["status" => "error", "message" => "Permission denied"]);
            return;
        }
        if ($this->reviewModel->deleteComment($id)) {
            header('Content-Type: application/json');
            echo json_encode(["status" => "success", "message" => "Comment deleted"]);
        } else {
            header('Content-Type: application/json');
            echo json_encode(["status" => "error", "message" => "Failed to delete comment"]);
        }
    }
}
?>