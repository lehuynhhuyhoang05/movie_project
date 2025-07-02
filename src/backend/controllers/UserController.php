<?php
require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../utils/Auth.php';
require_once __DIR__ . '/../helpers/EmailHelper.php';

class UserController {
    private $userModel;

    public function __construct() {
        $this->userModel = new User();
    }

    public function index() {
        if (!Auth::isAdmin()) {
            http_response_code(403);
            echo json_encode(["status" => "error", "message" => "Admin access required"]);
            return;
        }
        $users = $this->userModel->getAll();
        $data = [];
        while ($row = $users->fetch_assoc()) {
            unset($row['password']);
            unset($row['verification_token']);
            $data[] = $row;
        }
        header('Content-Type: application/json');
        echo json_encode(["status" => "success", "data" => $data]);
    }

    public function register() {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
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
            $user = $this->userModel->getById($userId);
            if (EmailHelper::sendVerificationEmail($email, $username, $user['verification_token'])) {
                echo json_encode(["status" => "success", "message" => "User registered. Please check your email to verify your account.", "user_id" => $userId]);
            } else {
                echo json_encode(["status" => "error", "message" => "User registered but email sending failed. Contact support."]);
            }
        } else {
            echo json_encode(["status" => "error", "message" => "Failed to register user"]);
        }
    }

    public function create() {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            echo json_encode(["status" => "error", "message" => "Method not allowed"]);
            return;
        }

        if (!Auth::isAdmin()) {
            echo json_encode(["status" => "error", "message" => "Admin access required"]);
            return;
        }

        $data = json_decode(file_get_contents('php://input'), true);
        $username = $data['username'] ?? '';
        $password = $data['password'] ?? '';
        $email = $data['email'] ?? '';
        $role = $data['role'] ?? 'user';

        if (empty($username) || empty($password) || empty($email)) {
            echo json_encode(["status" => "error", "message" => "Username, password, and email are required"]);
            return;
        }

        if (!in_array($role, ['user', 'admin'])) {
            echo json_encode(["status" => "error", "message" => "Invalid role. Role must be 'user' or 'admin'"]);
            return;
        }

        if ($this->userModel->findByUsername($username)) {
            echo json_encode(["status" => "error", "message" => "Username already exists"]);
            return;
        }

        $userId = $this->userModel->create($username, $password, $email, $role);
        if ($userId) {
            echo json_encode(["status" => "success", "message" => "User created by admin", "user_id" => $userId]);
        } else {
            echo json_encode(["status" => "error", "message" => "Failed to create user"]);
        }
    }

    /**
     * SỬA LỖI TẠI ĐÂY
     * 1. Chuyển hàm về non-static: `public function login()`
     * 2. Xóa các tham số đầu vào.
     * 3. Lấy dữ liệu từ `php://input`.
     * 4. Gọi đến `Auth::login()` để xử lý logic.
     * 5. Trả về response JSON hoàn chỉnh.
     */
    public function login() {
        // Lấy dữ liệu từ request body
        $data = json_decode(file_get_contents("php://input"), true);
        error_log("Login request data: " . print_r($data, true));

        // Kiểm tra dữ liệu đầu vào
        if (!isset($data['username']) || !isset($data['password'])) {
            http_response_code(400); // Bad Request
            echo json_encode(["status" => "error", "message" => "Username and password are required"]);
            return;
        }

        // Gọi đến lớp Auth để xử lý logic đăng nhập
        $token = Auth::login($data['username'], $data['password']);

        // Xử lý kết quả trả về từ Auth::login
        if ($token) {
            // Nếu đăng nhập thành công, lấy thông tin người dùng để trả về
            $user = $this->userModel->findByUsername($data['username']);
            if (!$user) {
                http_response_code(404);
                echo json_encode(["status" => "error", "message" => "User not found after successful login"]);
                return;
            }
            
            // Tạo thông báo chào mừng
            $this->userModel->createNotification($user['id'], "Chào mừng " . htmlspecialchars($user['username']) . " đã đăng nhập thành công!");

            // Gửi phản hồi thành công
            echo json_encode([
                "status" => "success",
                "message" => "Login successful",
                "token" => $token,
                "user" => [
                    "id" => $user['id'],
                    "username" => $user['username'],
                    "role" => $user['role']
                ]
            ]);
        } else {
            // Gửi phản hồi thất bại
            http_response_code(401); // Unauthorized
            echo json_encode(["status" => "error", "message" => "Login failed. Please check your credentials or verify your account."]);
        }
    }


    public function logout() {
        echo json_encode(["status" => "success", "message" => "Logged out"]);
    }

    public function delete($id) {
        if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
            http_response_code(405);
            echo json_encode(["status" => "error", "message" => "Method not allowed"]);
            return;
        }

        if (!Auth::isAdmin()) {
            http_response_code(403);
            echo json_encode(["status" => "error", "message" => "Admin access required"]);
            return;
        }

        if ($this->userModel->delete($id)) {
            echo json_encode(["status" => "success", "message" => "User deleted"]);
        } else {
            http_response_code(404);
            echo json_encode(["status" => "error", "message" => "Failed to delete user"]);
        }
    }

    public function updateProfile() {
        if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
            http_response_code(405);
            echo json_encode(["status" => "error", "message" => "Method not allowed"]);
            return;
        }

        if (!Auth::check()) {
            http_response_code(401);
            echo json_encode(["status" => "error", "message" => "Login required"]);
            return;
        }

        $user_id = Auth::getUserId();
        $data = json_decode(file_get_contents('php://input'), true);
        $full_name = $data['full_name'] ?? '';
        $avatar = $data['avatar'] ?? '';
        $email = $data['email'] ?? '';

        if (empty($full_name) && empty($avatar) && empty($email)) {
            echo json_encode(["status" => "error", "message" => "At least one field (full_name, avatar, or email) is required"]);
            return;
        }

        if ($email) {
            $currentUser = $this->userModel->getById($user_id);
            if ($email !== $currentUser['email'] && $this->userModel->findByEmail($email)) {
                echo json_encode(["status" => "error", "message" => "Email already exists"]);
                return;
            }
        }

        if ($this->userModel->updateProfile($user_id, $full_name, $avatar, $email)) {
            echo json_encode(["status" => "success", "message" => "Profile updated"]);
        } else {
            echo json_encode(["status" => "error", "message" => "Failed to update profile"]);
        }
    }

    public function changePassword() {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(["status" => "error", "message" => "Method not allowed"]);
            return;
        }

        if (!Auth::check()) {
            http_response_code(401);
            echo json_encode(["status" => "error", "message" => "Login required"]);
            return;
        }

        $user_id = Auth::getUserId();
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

    public function update() {
        if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
            http_response_code(405);
            echo json_encode(["status" => "error", "message" => "Method not allowed"]);
            return;
        }

        if (!Auth::isAdmin()) {
            http_response_code(403);
            echo json_encode(["status" => "error", "message" => "Admin access required"]);
            return;
        }

        $data = json_decode(file_get_contents('php://input'), true);
        $id = $data['id'] ?? null;
        $username = $data['username'] ?? '';
        $email = $data['email'] ?? '';
        $role = $data['role'] ?? '';
        $full_name = $data['full_name'] ?? '';
        $avatar = $data['avatar'] ?? '';

        if (!$id) {
            echo json_encode(["status" => "error", "message" => "User ID is required"]);
            return;
        }

        $existingUser = $this->userModel->getById($id);
        if (!$existingUser) {
            echo json_encode(["status" => "error", "message" => "User not found"]);
            return;
        }

        if ($username && $username !== $existingUser['username']) {
            if ($this->userModel->findByUsername($username)) {
                echo json_encode(["status" => "error", "message" => "Username already exists"]);
                return;
            }
        }

        if ($role && !in_array($role, ['user', 'admin'])) {
            echo json_encode(["status" => "error", "message" => "Invalid role. Role must be 'user' or 'admin'"]);
            return;
        }

        $username = $username ?: $existingUser['username'];
        $email = $email ?: $existingUser['email'];
        $role = $role ?: $existingUser['role'];
        $full_name = $full_name !== '' ? $full_name : $existingUser['full_name'];
        $avatar = $avatar !== '' ? $avatar : $existingUser['avatar'];

        if ($this->userModel->update($id, $username, $email, $role, $full_name, $avatar)) {
            echo json_encode(["status" => "success", "message" => "User updated successfully"]);
        } else {
            echo json_encode(["status" => "error", "message" => "Failed to update user"]);
        }
    }

    public function verify() {
        if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
            http_response_code(405);
            echo json_encode(["status" => "error", "message" => "Method not allowed"]);
            return;
        }

        $token = $_GET['token'] ?? '';
        if (empty($token)) {
            echo json_encode(["status" => "error", "message" => "Verification token is required"]);
            return;
        }

        if ($this->userModel->verifyAccount($token)) {
            echo json_encode(["status" => "success", "message" => "Account verified successfully. You can now log in."]);
        } else {
            echo json_encode(["status" => "error", "message" => "Invalid or expired verification token."]);
        }
    }

    public function getProfile() {
        if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
            http_response_code(405);
            echo json_encode(["status" => "error", "message" => "Method not allowed"]);
            return;
        }

        error_log("Checking authentication...");
        if (!Auth::check()) {
            error_log("Authentication failed");
            http_response_code(401);
            echo json_encode(["status" => "error", "message" => "Login required"]);
            return;
        }

        $user_id = Auth::getUserId();
        error_log("User ID from token: " . $user_id);
        $user = $this->userModel->getById($user_id);

        if (!$user) {
            http_response_code(404);
            echo json_encode(["status" => "error", "message" => "User not found"]);
            return;
        }

        unset($user['password']);
        unset($user['verification_token']);

        header('Content-Type: application/json');
        echo json_encode(["status" => "success", "data" => $user]);
    }

    public function forgotPassword() {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            header('Content-Type: application/json');
            echo json_encode(["status" => "error", "message" => "Method not allowed"]);
            return;
        }

        $data = json_decode(file_get_contents('php://input'), true);
        $email = $data['email'] ?? '';

        header('Content-Type: application/json');

        if (empty($email)) {
            echo json_encode(["status" => "error", "message" => "Email is required"]);
            return;
        }

        $user = $this->userModel->findByEmail($email);
        if (!$user) {
            echo json_encode(["status" => "error", "message" => "Email not found"]);
            return;
        }

        $resetCode = rand(100000, 999999);
        $expiresAt = date('Y-m-d H:i:s', strtotime('+1 hour'));

        try {
            if ($this->userModel->saveResetCode($user['id'], $resetCode, $expiresAt)) {
                error_log("Reset code saved for email: $email, code: $resetCode");
                if (EmailHelper::sendResetCode($email, $resetCode)) {
                    error_log("Email sent successfully for email: $email");
                    echo json_encode(["status" => "success", "message" => "Reset code sent to your email"]);
                    return;
                } else {
                    error_log("Failed to send email for email: $email");
                    echo json_encode(["status" => "error", "message" => "Failed to send reset code. Try again later."]);
                    return;
                }
            } else {
                error_log("Failed to save reset code for email: $email");
                echo json_encode(["status" => "error", "message" => "Failed to save reset code"]);
                return;
            }
        } catch (Exception $e) {
            error_log("Exception in forgotPassword: " . $e->getMessage());
            echo json_encode(["status" => "error", "message" => "An error occurred. Please try again later."]);
            return;
        }
    }


    public function resetPassword() {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(["status" => "error", "message" => "Method not allowed"]);
            return;
        }

        $data = json_decode(file_get_contents('php://input'), true);
        $email = $data['email'] ?? '';
        $otp = $data['otp'] ?? '';
        $newPassword = $data['newPassword'] ?? '';

        if (empty($email) || empty($otp) || empty($newPassword)) {
            echo json_encode(["status" => "error", "message" => "Email, OTP, and new password are required"]);
            return;
        }

        $user = $this->userModel->findByEmail($email);
        if (!$user || $user['reset_code'] !== $otp || $user['reset_expires_at'] < date('Y-m-d H:i:s')) {
            echo json_encode(["status" => "error", "message" => "Invalid or expired OTP"]);
            return;
        }

        if ($this->userModel->changePassword($user['id'], $newPassword)) {
            $this->userModel->clearResetCode($user['id']);
            echo json_encode(["status" => "success", "message" => "Password reset successfully"]);
        } else {
            echo json_encode(["status" => "error", "message" => "Failed to reset password"]);
        }
    }

    public function getNotifications() {
        if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
            http_response_code(405);
            echo json_encode(["status" => "error", "message" => "Method not allowed"]);
            return;
        }

        if (!Auth::check()) {
            http_response_code(401);
            echo json_encode(["status" => "error", "message" => "Login required"]);
            return;
        }

        $user_id = Auth::getUserId();
        $notifications = $this->userModel->getNotifications($user_id);
        $data = [];
        while ($row = $notifications->fetch_assoc()) {
            $data[] = $row;
        }
        header('Content-Type: application/json');
        echo json_encode(["status" => "success", "data" => $data]);
    }

}
?>
