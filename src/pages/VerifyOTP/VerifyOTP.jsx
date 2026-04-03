import AuthContainer from "~/components/AuthContainer";
import RegisterRight from "~/pages/Register/components/RegisterRight";
import VerifyOTPLeft from "./VerifyOTPLeft";


function VerifyOTP() {
    return ( 
       <AuthContainer
            childrenLeft={<VerifyOTPLeft />}
            childrenRight={<RegisterRight />}
        />
     );
}

export default VerifyOTP;
