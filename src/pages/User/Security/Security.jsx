import ProfileContainer from '~/components/ProfileContainer';
import SecurityMain from './SecurityMain';

const LIST_CONTENT = [
  {
    key: 'password',
    section: 'login',
    label: 'Đổi mật khẩu',
    value: 'Đã cập nhật gần đây',
    title: 'Đổi mật khẩu',
    description:
      'Cập nhật mật khẩu mới để tăng cường bảo mật cho tài khoản của bạn.',
  },
  {
    key: 'twoFactor',
    section: 'login',
    label: 'Xác minh 2 bước',
    value: 'Đang tắt',
    title: 'Xác minh 2 bước',
    description:
      'Bật xác minh 2 bước để bảo vệ tài khoản tốt hơn khi đăng nhập.',
  },
  {
    key: 'devices',
    section: 'session',
    label: 'Nơi bạn đã đăng nhập',
    value: 'Quản lý các thiết bị đã đăng nhập',
    title: 'Phiên đăng nhập',
    description:
      'Xem và quản lý các thiết bị đang hoặc đã đăng nhập vào tài khoản của bạn.',
  },
];

function Security() {
  return (
    <ProfileContainer
      childrenMain={<SecurityMain LIST_CONTENT={LIST_CONTENT} />}
    />
  );
}

export default Security;