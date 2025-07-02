<?php
// File: reset_all_passwords.php
// Đặt file này vào cùng thư mục với server.php

// --- CẤU HÌNH ---
// CHỌN MỘT MẬT KHẨU MẶC ĐỊNH MỚI CHO TẤT CẢ NGƯỜI DÙNG
$defaultPassword = 'Password123@'; 
// --- KẾT THÚC CẤU HÌNH ---


// Báo cáo lỗi để dễ debug
ini_set('display_errors', 1);
error_reporting(E_ALL);

require_once __DIR__ . '/config/database.php';


echo "Bắt đầu quá trình reset mật khẩu...<br>";

try {
    // Kết nối đến cơ sở dữ liệu
    $database = new Database();
    $conn = $database->getConnection();

    // 1. Lấy ID của tất cả người dùng
    $result = $conn->query("SELECT id FROM users");

    if ($result->num_rows > 0) {
        // 2. Hash mật khẩu mặc định MỘT LẦN DUY NHẤT để tăng hiệu suất
        $hashedDefaultPassword = password_hash($defaultPassword, PASSWORD_DEFAULT);
        
        // 3. Chuẩn bị câu lệnh UPDATE
        $stmt = $conn->prepare("UPDATE users SET password = ? WHERE id = ?");
        if ($stmt === false) {
            throw new Exception("Lỗi khi chuẩn bị câu lệnh UPDATE: " . $conn->error);
        }

        $count = 0;
        // 4. Lặp qua từng người dùng và cập nhật mật khẩu của họ
        while ($row = $result->fetch_assoc()) {
            $userId = $row['id'];
            
            // Gán tham số và thực thi
            $stmt->bind_param("si", $hashedDefaultPassword, $userId);
            $stmt->execute();
            
            $count++;
            echo "Đã reset mật khẩu cho user ID: " . htmlspecialchars($userId) . "<br>";
        }

        $stmt->close();
        echo "<hr>";
        echo "<strong>Hoàn tất!</strong><br>";
        echo "Đã reset mật khẩu cho tổng cộng " . $count . " người dùng.<br>";
        echo "Mật khẩu mặc định mới cho tất cả mọi người là: <strong>" . htmlspecialchars($defaultPassword) . "</strong>";

    } else {
        echo "Không tìm thấy người dùng nào trong database.";
    }

    $conn->close();

} catch (Exception $e) {
    echo "<hr>";
    echo "<strong>Đã xảy ra lỗi:</strong> " . $e->getMessage();
}
?>
