import AuthContainer from "~/components/AuthContainer";
import RegisterLeft from "./components/RegisterLeft";
import RegisterRight from "./components/RegisterRight";

function Register() {
  return (
    <AuthContainer
      id="register"
      title="Tạo tài khoản mới"
      textMenuAuth="Hoặc đăng ký với"
      desc="Bắt đầu hành trình sự nghiệp chuyên nghiệp của bạn với AI"
      childrenLeft={<RegisterLeft />}
      childrenRight={<RegisterRight />}
    />
  );
}

export default Register;