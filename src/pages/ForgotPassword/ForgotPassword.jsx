import AuthContainer from '~/components/AuthContainer';
import ForgotPasswordLeft from './components/ForgotPasswordLeft';
import ForgotPasswordRight from './components/ForgotPasswordRight';


function ForgotPassword() {
    return (
        <AuthContainer
            id="forgot-password"
            title="Quên mật khẩu"
            childrenLeft={<ForgotPasswordLeft />}
            childrenRight={<ForgotPasswordRight />}
        />
    );
}

export default ForgotPassword;