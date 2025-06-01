const otpInputs = document.querySelectorAll('.otp-input');
const otpForm = document.getElementById('otpForm');
const errorMessage = document.getElementById('otp-error');
const successMessage = document.getElementById('otp-success');

// Giả lập mã OTP 4 số (ví dụ là 1234)
const fakeOTP = '1234';

// Tự động chuyển ô nhập
otpInputs.forEach((input, index) => {
  input.addEventListener('input', (e) => {
    const value = e.target.value;
    // Chỉ cho nhập số
    if (/\D/.test(value)) {
      input.value = '';
      return;
    }
    // Xóa lỗi khi nhập mới
    errorMessage.textContent = '';
    successMessage.textContent = '';
    successMessage.style.color = '#4CAF50'; // reset màu

    if (value.length === 1 && index < otpInputs.length - 1) {
      otpInputs[index + 1].focus();
    }
  });

  // Hỗ trợ phím Backspace quay lại ô trước
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Backspace' && !input.value && index > 0) {
      otpInputs[index - 1].focus();
    }
  });
});

// Submit xác thực OTP
otpForm.addEventListener('submit', function (event) {
  event.preventDefault();

  const otpValue = Array.from(otpInputs).map(input => input.value).join('').trim();

  if (otpValue === '') {
    errorMessage.textContent = 'Vui lòng nhập mã OTP.';
    successMessage.textContent = '';
    otpInputs[0].focus();
  } else if (!/^\d{4}$/.test(otpValue)) {
    errorMessage.textContent = 'Mã OTP phải gồm 4 chữ số.';
    successMessage.textContent = '';
    otpInputs[0].focus();
  } else if (otpValue !== fakeOTP) {
    errorMessage.textContent = 'Mã OTP không chính xác.';
    successMessage.textContent = '';
    otpInputs[0].focus();
  } else {
    errorMessage.textContent = '';
    successMessage.textContent = 'Xác thực OTP thành công!';
    successMessage.style.color = '#4CAF50';

    setTimeout(() => {
      window.location.href = 'reset-password.html';
    }, 1500);
  }
});
