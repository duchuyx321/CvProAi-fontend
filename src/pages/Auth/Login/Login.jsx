import AuthContainer from '~/components/AuthContainer';
import LoginLeft from './components/LoginLeft';
import LoginRight from './components/LoginRight';

function Login() {
    return (
        <AuthContainer
            id="login"
            title="Đăng nhập"
            textMenuAuth="Hoặc đăng nhập với"
            desc="Chào mừng bạn quay lại với trình tạo CV thông minh"
            childrenLeft={<LoginLeft />}
            childrenRight={<LoginRight />}
        />
    );
}

export default Login;