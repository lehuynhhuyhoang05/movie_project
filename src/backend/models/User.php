<?php
require_once __DIR__ . '/../config/database.php';

class User {
    private $conn;
    private $table = 'users';

    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
    }

    public function findByUsername($username) {
        $query = "SELECT * FROM $this->table WHERE username = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("s", $username);
        $stmt->execute();
        return $stmt->get_result()->fetch_assoc();
    }

    public function getById($id) {
        $query = "SELECT * FROM $this->table WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("i", $id);
        $stmt->execute();
        return $stmt->get_result()->fetch_assoc();
    }

    public function getAll() {
        $query = "SELECT id, username, email, role, created_at, updated_at FROM $this->table";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt->get_result();
    }

    public function create($username, $password, $email, $role = 'user') {
        $verification_token = bin2hex(random_bytes(32));
        $query = "INSERT INTO $this->table (username, password, email, role, verification_token) VALUES (?, ?, ?, ?, ?)";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("sssss", $username, $password, $email, $role, $verification_token);
        return $stmt->execute() ? $this->conn->insert_id : false;
    }

    public function delete($id) {
        $query = "DELETE FROM $this->table WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("i", $id);
        return $stmt->execute();
    }

    public function updateProfile($id, $full_name, $avatar, $email = null) {
    $query = "UPDATE $this->table SET full_name = ?, avatar = ?";
    $params = [$full_name, $avatar];
    $types = "ss";

    if ($email) {
        $query .= ", email = ?";
        $params[] = $email;
        $types .= "s";
    }
    $query .= " WHERE id = ?";
    $params[] = $id;
    $types .= "i";

    $stmt = $this->conn->prepare($query);
    $stmt->bind_param($types, ...$params);
    return $stmt->execute();
}

public function findByEmail($email) {
    $query = "SELECT * FROM $this->table WHERE email = ?";
    $stmt = $this->conn->prepare($query);
    $stmt->bind_param("s", $email);
    $stmt->execute();
    return $stmt->get_result()->fetch_assoc();
}
    

    public function changePassword($id, $new_password) {
        $query = "UPDATE $this->table SET password = ? WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("si", $new_password, $id);
        return $stmt->execute();
    }

    

    
    public function verifyPassword($id, $password) {
        $query = "SELECT password FROM $this->table WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result()->fetch_assoc();
        return $result && $result['password'] === $password; //hiện toi khongdùng password_hash
    }

    public function update($id, $username, $email, $role, $full_name, $avatar) {
        $query = "UPDATE $this->table SET username = ?, email = ?, role = ?, full_name = ?, avatar = ? WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("sssssi", $username, $email, $role, $full_name, $avatar, $id);
        return $stmt->execute();
    }

    public function verifyAccount($token) {
        $query = "UPDATE $this->table SET is_verified = 1, verification_token = NULL WHERE verification_token = ? AND is_verified = 0";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("s", $token);
        return $stmt->execute();
    }

    public function findByVerificationToken($token) {
        $query = "SELECT * FROM $this->table WHERE verification_token = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("s", $token);
        $stmt->execute();
        return $stmt->get_result()->fetch_assoc();
    }

    public function saveResetCode($userId, $resetCode, $expiresAt) {
    $query = "UPDATE $this->table SET reset_code = ?, reset_expires_at = ? WHERE id = ?";
    $stmt = $this->conn->prepare($query);
    $stmt->bind_param("ssi", $resetCode, $expiresAt, $userId);
    return $stmt->execute();
}
    public function clearResetCode($userId) {
    $query = "UPDATE $this->table SET reset_code = NULL, reset_expires_at = NULL WHERE id = ?";
    $stmt = $this->conn->prepare($query);
    $stmt->bind_param("i", $userId);
    return $stmt->execute();
}

public function createNotification($userId, $content, $type = 'welcome') {
        $query = "INSERT INTO notifications (user_id, content, type) VALUES (?, ?, ?)";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("iss", $userId, $content, $type);
        return $stmt->execute();
    }

    public function getNotifications($userId) {
        $query = "SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("i", $userId);
        $stmt->execute();
        return $stmt->get_result();
    }





}
?>