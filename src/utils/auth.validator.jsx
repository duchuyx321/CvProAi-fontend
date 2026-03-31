export function validateEmail(email = '') {
    const emailValue = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailValue) {
        return 'Vui lòng nhập email';
    }

    if (emailValue.length < 6) {
        return 'Email phải có ít nhất 6 ký tự';
    }

    if (!emailRegex.test(emailValue)) {
        return 'Email không đúng định dạng';
    }

    return '';
}

export function validatePassword(password = '') {
    const passwordValue = password.trim();

    if (!passwordValue) {
        return 'Vui lòng nhập mật khẩu';
    }

    if (passwordValue.length < 8) {
        return 'Mật khẩu ít nhất 8 ký tự';
    }

    return '';
}

export function validateFullName(fullName = '') {
    const fullNameValue = fullName.trim();

    if (!fullNameValue) {
        return 'Vui lòng nhập họ tên';
    }

    if (fullNameValue.length < 2) {
        return 'Họ tên phải có ít nhất 2 ký tự';
    }

    return '';
}

export function validateConfirmPassword(password = '', confirmPassword = '') {
    const passwordValue = password.trim();
    const confirmPasswordValue = confirmPassword.trim();

    if (!confirmPasswordValue) {
        return 'Vui lòng nhập xác nhận mật khẩu';
    }

    if (passwordValue !== confirmPasswordValue) {
        return 'Mật khẩu xác nhận không khớp';
    }

    return '';
}

export function validateLoginForm({ email, password }) {
    const emailError = validateEmail(email);
    if (emailError) {
        return emailError;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
        return passwordError;
    }

    return '';
}

export function validateRegisterForm({
    fullName,
    email,
    password,
    confirmPassword,
    agreed,
}) {
    const fullNameError = validateFullName(fullName);
    if (fullNameError) {
        return fullNameError;
    }

    const emailError = validateEmail(email);
    if (emailError) {
        return emailError;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
        return passwordError;
    }

    const confirmPasswordError = validateConfirmPassword(password, confirmPassword);
    if (confirmPasswordError) {
        return confirmPasswordError;
    }

    if (!agreed) {
        return 'Bạn cần đồng ý với điều khoản và chính sách';
    }

    return '';
}