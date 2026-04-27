//hằng số UI + cấu hình trạng thái

export const SAFE_ID_PATTERN = /^[a-zA-Z0-9_-]+$/;
export const REALTIME_CONNECT_TIMEOUT_MS = 7000;

export const PAYMENT_METHOD = {
    apiValue: 'sepay',
    label: 'SePay',
    hint: 'Cổng thanh toán tự động',
};

export const GUIDE_STEPS = [
    {
        title: 'Mở ứng dụng ngân hàng',
        description: 'Chọn tính năng quét mã QR trên ứng dụng của bạn.',
    },
    {
        title: 'Quét mã và kiểm tra',
        description: 'Kiểm tra chính xác số tiền và nội dung chuyển khoản.',
    },
    {
        title: 'Xác nhận chuyển khoản',
        description: 'Hệ thống sẽ tự động kích hoạt trong vài giây.',
    },
];

export const STATUS_ALIAS = {
    PAID: 'PAID',
    SUCCESS: 'PAID',
    COMPLETED: 'PAID',
    PENDING: 'PENDING',
    PROCESSING: 'PENDING',
    WAITING: 'PENDING',
    FAILED: 'FAILED',
    FAIL: 'FAILED',
    CANCELED: 'FAILED',
    CANCELLED: 'FAILED',
    CANCEL: 'FAILED',
    ERROR: 'FAILED',
    EXPIRED: 'EXPIRED',
    TIMEOUT: 'EXPIRED',
};
