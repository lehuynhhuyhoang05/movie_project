<?php
require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../utils/Auth.php';

class UserController {
    private $userModel;

    public function __construct() {
        $this->userModel = new User();
    }

    public function index() {
        if (!Auth::isAdmin()) {
            echo json_encode(["status" => "error", "message" => "Admin access required"]);
            return;
        }

        $users = $this->userModel->getAll();
        $data = [];
        while ($row = $users->fetch_assoc()) {
            $data[] = $row;
        }
        header('Content-Type: application/json');
        echo json_encode(["status" => "success", "data" => $data]);
    }

    public function register() {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            echo json_encode(["status" => "error", "message" => "Method not allowed"]);
            return;
        }

        $data = json_decode(file_get_contents('php://input'), true);
        $username = $data['username'] ?? '';
        $password = $data['password'] ?? '';
        $email = $data['email'] ?? '';

        if (empty($username) || empty($password) || empty($email)) {
            echo json_encode(["status" => "error", "message" => "All fields are required"]);
            return;
        }

        if ($this->userModel->findByUsername($username)) {
            echo json_encode(["status" => "error", "message" => "Username already exists"]);
            return;
        }

        $userId = $this->userModel->create($username, $password, $email);
        if ($userId) {
            echo json_encode(["status" => "success", "message" => "User registered", "user_id" => $userId]);
        } else {
            echo json_encode(["status" => "error", "message" => "Failed to register user"]);
        }
    }

    public function login() {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            echo json_encode(["status" => "error", "message" => "Method not allowed"]);
            return;
        }

        $data = json_decode(file_get_contents('php://input'), true);
        $username = $data['username'] ?? '';
        $password = $data['password'] ?? '';

        if (Auth::login($username, $password)) {
            $user = $this->userModel->findByUsername($username);
            echo json_encode(["status" => "success", "message" => "Login successful", "user" => [
                "id" => $user['id'],
                "username" => $user['username'],
                "role" => $user['role']
            ]]);
        } else {
            echo json_encode(["status" => "error", "message" => "Invalid credentials"]);
        }
    }

    public function logout() {
        Auth::logout();
        echo json_encode(["status" => "success", "message" => "Logged out"]);
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

        if ($this->userModel->delete($id)) {
            echo json_encode(["status" => "success", "message" => "User deleted"]);
        } else {
            echo json_encode(["status" => "error", "message" => "Failed to delete user"]);
        }
    }

    public function updateProfile() {
        if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
            echo json_encode(["status" => "error", "message" => "Method not allowed"]);
            return;
        }

        if (!Auth::check()) {
            http_response_code(401);
            echo json_encode(["status" => "error", "message" => "Login required"]);
            return;
        }

        $user_id = Auth::getUserId();
        if (!$user_id) {
            http_response_code(401);
            echo json_encode(["status" => "error", "message" => "Invalid user session"]);
            return;
        }

        $data = json_decode(file_get_contents('php://input'), true);
        $full_name = $data['full_name'] ?? '';
        $avatar = $data['avatar'] ?? '';

        if (empty($full_name) && empty($avatar)) {
            echo json_encode(["status" => "error", "message" => "At least one field (full_name or avatar) is required"]);
            return;
        }

        if ($this->userModel->updateProfile($user_id, $full_name, $avatar)) {
            echo json_encode(["status" => "success", "message" => "Profile updated"]);
        } else {
            echo json_encode(["status" => "error", "message" => "Failed to update profile"]);
        }
    }

    public function changePassword() {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            echo json_encode(["status" => "error", "message" => "Method not allowed"]);
            return;
        }

        if (!Auth::check()) {
            http_response_code(401);
            echo json_encode(["status" => "error", "message" => "Login required"]);
            return;
        }

        $user_id = Auth::getUserId();
        if (!$user_id) {
            http_response_code(401);
            echo json_encode(["status" => "error", "message" => "Invalid user session"]);
            return;
        }

        $data = json_decode(file_get_contents('php://input'), true);
        $current_password = $data['current_password'] ?? '';
        $new_password = $data['new_password'] ?? '';

        if (empty($current_password) || empty($new_password)) {
            echo json_encode(["status" => "error", "message" => "Current password and new password are required"]);
            return;
        }

        if (!$this->userModel->verifyPassword($user_id, $current_password)) {
            echo json_encode(["status" => "error", "message" => "Current password is incorrect"]);
            return;
        }

        if ($this->userModel->changePassword($user_id, $new_password)) {
            echo json_encode(["status" => "success", "message" => "Password changed successfully"]);
        } else {
            echo json_encode(["status" => "error", "message" => "Failed to change password"]);
        }
    }
}
?>