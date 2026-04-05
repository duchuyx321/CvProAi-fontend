export const validateRegex = {
    fullName: {
        regex: /^[\p{L} ]{2,50}$/u,
        message: 'Họ tên không hợp lệ',
    },
    email: {
        regex: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,
        message: 'Email không hợp lệ',
    },
    password: {
        regex: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,20}$/,
        message:
            'Mật khẩu phải có 8-20 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt',
    },
    otp: {
        regex: /^[A-HJ-NP-Za-km-z2-9]{6}$/,
        message: 'Mã OTP không hợp lệ',
    },
    phone: {
        regex: /^(0|\+84)\d{9,10}$/,
        message: 'Số điện thoại không hợp lệ',
    },
    username: {
        regex: /^[a-zA-Z0-9._-]{4,30}$/,
        message: 'Tên người dùng không hợp lệ',
    },
    bio: {
        regex: /^.{0,300}$/,
        message: 'Giới thiệu không được vượt quá 300 ký tự',
    },
};

const getValue = (value = '') => value.trim();

export function validateLoginForm({ email = '', password = '' }) {
    const payload = { email, password };

    for (const key in payload) {
        if (!validateRegex[key]?.regex.test(getValue(payload[key]))) {
            return validateRegex[key]?.message || 'Giá trị không hợp lệ';
        }
    }

    return '';
}

export function validateRegisterForm(
    payload = {
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        agreed: false,
    },
) {
    const { agreed, confirmPassword = '', ...rest } = payload;

    for (const key in rest) {
        if (!validateRegex[key]?.regex.test(getValue(payload[key]))) {
            return validateRegex[key]?.message || 'Giá trị không hợp lệ';
        }
    }

    if (getValue(confirmPassword) !== getValue(payload.password)) {
        return 'Mật khẩu xác nhận không khớp';
    }

    if (!agreed) {
        return 'Bạn cần đồng ý với điều khoản và chính sách';
    }

    return '';
}

export function validateOtpForm({ otp = '' }) {
    if (!validateRegex.otp.regex.test(getValue(otp))) {
        return validateRegex.otp.message;
    }

    return '';
}

export function validateForgotPasswordForm({ email = '' }) {
    if (!validateRegex.email.regex.test(getValue(email))) {
        return validateRegex.email.message;
    }

    return '';
}

export function validateResetPasswordForm({
    password = '',
    confirmPassword = '',
}) {
    if (!validateRegex.password.regex.test(getValue(password))) {
        return validateRegex.password.message;
    }

    if (getValue(confirmPassword) !== getValue(password)) {
        return 'Mật khẩu xác nhận không khớp';
    }

    return '';
}
