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
  }
  ?>