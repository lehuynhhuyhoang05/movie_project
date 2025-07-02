<?php
require_once __DIR__ . '/../env_loader.php';
loadEnv(__DIR__ . '/../.env'); // Load biến môi trường từ file .env

class EmailHelper {
    public static function sendVerificationEmail($email, $username, $token) {
        $apiKey = $_ENV['SENDGRID_API_KEY'];
        
        $verificationLink = "http://localhost/movie_project/src/backend/server.php?controller=user&method=verify&token=$token";

        $htmlContent = "<!DOCTYPE html>
                       <html lang='en'>
                       <head>
                           <meta charset='UTF-8'>
                           <title>Verify Your Account</title>
                       </head>
                       <body style='font-family: Arial, sans-serif;'>
                           <h1 style='color: #333;'>Welcome $username!</h1>
                           <p>Please click the link below to verify your account:</p>
                           <p><a href='$verificationLink' style='color: #1a73e8; text-decoration: underline;'>Verify Account</a></p>
                           <p>If the link doesn't work, copy and paste this URL ( Nếu link không hoạt động , hãy copy link dưới và dán để xác thực ):</p>
                           <p>$verificationLink</p>
                           <p>Link will expire in 24 hours.</p>
                       </body>
                       </html>";

        $data = [
            'personalizations' => [[
                'to' => [[ 'email' => $email, 'name' => $username ]]
            ]],
            'from' => [
                'email' => 'lehuynhhuyhoang05@gmail.com',
                'name' => 'MovieOn'
            ],
            'subject' => 'Verify Your Account',
            'content' => [[
                'type' => 'text/html',
                'value' => $htmlContent
            ]]
        ];

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, 'https://api.sendgrid.com/v3/mail/send');
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Authorization: Bearer ' . $apiKey,
            'Content-Type: application/json'
        ]);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode == 202) {
            error_log("Email sent successfully via SendGrid API");
            return true;
        } else {
            error_log("Email sending failed. HTTP Code: $httpCode, Response: $response");
            return false;
        }
    }

    public static function sendResetCode($to, $resetCode) {
        $apiKey = $_ENV['SENDGRID_API_KEY'];
        
        $resetLink = "http://movieon.free.nf/forgot-password.html?resetCode=$resetCode";
        
        $htmlContent = "<!DOCTYPE html>
                       <html lang='en'>
                       <head>
                           <meta charset='UTF-8'>
                           <title>Reset Your Password</title>
                       </head>
                       <body style='font-family: Arial, sans-serif;'>
                           <h1 style='color: #333;'>Password Reset Request</h1>
                           <p>Hello! Your reset code is: <strong>$resetCode</strong></p>
                           <p>Please use this code on the reset password page to set a new password.</p>
                           <p>Code will expire in 1 hour.</p>
                           <p>If you didn’t request this, ignore this email.</p>
                       </body>
                       </html>";

        $data = [
            'personalizations' => [[
                'to' => [[ 'email' => $to, 'name' => $to ]]
            ]],
            'from' => [
                'email' => 'lehuynhhuyhoang05@gmail.com',
                'name' => 'MovieOn'
            ],
            'subject' => 'Password Reset Code',
            'content' => [[
                'type' => 'text/html',
                'value' => $htmlContent
            ]]
        ];

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, 'https://api.sendgrid.com/v3/mail/send');
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Authorization: Bearer ' . $apiKey,
            'Content-Type: application/json'
        ]);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode == 202) {
            error_log("Reset code email sent successfully via SendGrid API");
            return true;
        } else {
            error_log("Reset code email sending failed. HTTP Code: $httpCode, Response: $response");
            return false;
        }
    }
}
