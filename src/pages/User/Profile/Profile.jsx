import ProfileContainer from '~/components/ProfileContainer';
import ProfileMain from './ProfileMain';

const LIST_CONTENT = [
    {
        key: 'full_name',
        label: 'Họ và tên',
        type: 'text',
        placeholder: 'Nhập họ và tên',
        description:
            'Họ và tên sẽ xuất hiện trên CV, hồ sơ CVProAI và trong các hoạt động ứng tuyển của bạn.',
        required: true,
    },
    {
        key: 'phone',
        label: 'Số điện thoại',
        type: 'text',
        placeholder: 'Nhập số điện thoại',
        description:
            'Số điện thoại giúp nhà tuyển dụng liên hệ với bạn nhanh hơn và hỗ trợ tăng độ tin cậy cho hồ sơ.',
        required: false,
    },
    {
        key: 'email',
        label: 'Email',
        type: 'email',
        placeholder: 'Nhập email',
        description:
            'Email được dùng để nhận thông báo ứng tuyển, cập nhật từ CVProAI và hỗ trợ khôi phục tài khoản khi cần.',
        required: true,
    },
    {
        key: 'summary',
        label: 'Giới thiệu',
        type: 'textarea',
        placeholder: 'Giới thiệu về bản thân',
        description:
            'Một phần giới thiệu ngắn gọn, rõ điểm mạnh và định hướng nghề nghiệp sẽ giúp hồ sơ của bạn nổi bật hơn với nhà tuyển dụng.',
        rows: 5,
        required: false,
    },
];

function Profile() {
    return (
        <ProfileContainer
            childrenMain={<ProfileMain LIST_CONTENT={LIST_CONTENT} />}
        />
    );
}

export default Profile;