import { useLocation } from 'react-router-dom';
import AuthContainer from '~/components/AuthContainer';
import RegisterRight from '~/pages/Register/components/RegisterRight';
import ForgotPasswordRight from '../ForgotPassword/components/ForgotPasswordRight';
import VerifySuccessLeft from './VerifySuccessLeft';

function VerifySuccess() {
    const { state } = useLocation();

    const formType = state?.from;
    const rightContent =
        formType === 'RESET_PASSWORD' ? (
            <ForgotPasswordRight />
        ) : (
            <RegisterRight />
        );

    return (
        <AuthContainer
            childrenLeft={<VerifySuccessLeft />}
            childrenRight={rightContent}
        />
    );
}

export default VerifySuccess;
