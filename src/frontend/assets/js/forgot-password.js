document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("forgotPasswordForm");
    const recoveryInput = document.getElementById("recovery");
    const errorDiv = document.getElementById("recovery-error");
    const popup = document.getElementById("otp-popup");
    const closePopupBtn = document.getElementById("closePopupBtn");

    form.addEventListener("submit", function (e) {
        e.preventDefault();
        const value = recoveryInput.value.trim();
        errorDiv.textContent = "";

        if (value === "") {
            errorDiv.textContent = "Vui lòng nhập email.";
            return;
        }

        let responseStatus;

        fetch('http://localhost/movie_project/src/backend/server.php?controller=user&method=forgotPassword', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: value })
        })
        .then(res => {
            responseStatus = res.status;
            console.log("Response status:", responseStatus); // Debug status
            return res.text(); // Get raw response text
        })
        .then(text => {
            console.log("Raw response:", text); // Debug raw response
            const data = JSON.parse(text); // Manually parse

            if (responseStatus === 200 && data.status === "success") {
                popup.classList.remove("popup-hidden");
                popup.classList.add("popup-show");
                recoveryInput.value = "";

                // Chuyển hướng sang trang nhập mã OTP và mật khẩu mới
                window.location.href = `reset-password.html?email=${encodeURIComponent(value)}`;
            } else {
                errorDiv.textContent = data.message || "Đã xảy ra lỗi không xác định.";
            }
        })
        .catch(error => {
            console.error("Error:", error);
            errorDiv.textContent = "Đã xảy ra lỗi. Vui lòng thử lại.";
        });

        closePopupBtn.onclick = function () {
            popup.classList.remove("popup-show");
            popup.classList.add("popup-hidden");
        };
    });
});
