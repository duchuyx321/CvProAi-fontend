import * as Response from '~/utils/HttpsRequest';

const FALLBACK_PACKAGES = {
    success: true,
    messsage: 'lấy dữ liệu thành công.',
    data: {
        plan: {
            id: '5ec4f731-9b3b-46b7-9a62-76f261af9819',
            name: 'Premium',
            description:
                'Gói nâng cao cho người dùng cần tối ưu CV chuyên sâu, xem full phân tích AI và xuất file chất lượng cao.',
            price: '199000',
            currency: 'VND',
            billing_cycle: 'MONTH',
            cv_limit: 20,
            export_limit: 15,
            ai_limit: 10,
            premium_template: true,
            remove_watermark: true,
            custom_domain: true,
            priority_support: true,
            is_active: true,
            slug: 'premium',
            view_full_ai_analysis: true,
            can_purchase_ai_addon: true,
            createdAt: '2026-04-16T10:37:36.006Z',
            updatedAt: '2026-04-21T01:39:32.306Z',
        },
        addon: [
            {
                id: '889f1e38-c0ee-45b3-9e30-55a7ce666ff0',
                name: 'Gói AI Add-on 20+5',
                description:
                    'Tặng thêm 5 lượt phân tích AI. Tổng cộng nhận 25 lượt dùng cho tài khoản Premium.',
                price: '179000',
                currency: 'VND',
                runs: 25,
                is_active: true,
                createdAt: '2026-04-22T04:10:20.908Z',
                updatedAt: '2026-04-22T04:10:20.908Z',
            },
            {
                id: '516d0f33-18e3-4270-a42a-798f0ef73a00',
                name: 'Gói AI Add-on 10+2',
                description:
                    'Tặng thêm 2 lượt phân tích AI. Tổng cộng nhận 12 lượt dùng cho tài khoản Premium.',
                price: '99000',
                currency: 'VND',
                runs: 12,
                is_active: true,
                createdAt: '2026-04-22T04:09:31.556Z',
                updatedAt: '2026-04-22T04:09:31.556Z',
            },
            {
                id: 'ec3e3d40-3bf8-4cfa-805d-bb0f22981160',
                name: 'Gói AI Add-on 5+1',
                description:
                    'Tặng thêm 1 lượt phân tích AI. Tổng cộng nhận 6 lượt dùng cho tài khoản Premium.',
                price: '59000',
                currency: 'VND',
                runs: 6,
                is_active: true,
                createdAt: '2026-04-22T04:08:44.760Z',
                updatedAt: '2026-04-22T04:08:44.760Z',
            },
        ],
    },
    date: '16:00:42 27/4/2026',
    path: '/api/v1/plans/one/premium',
};

const FALLBACK_FAQS = [
    {
        id: 1,
        question: 'Tôi có thể hủy gói Premium bất cứ lúc nào không?',
        answer: 'Có, bạn có thể hủy đăng ký bất cứ lúc nào từ trang cài đặt tài khoản của mình.',
    },
    {
        id: 2,
        question: 'Những phương thức thanh toán nào đang được hỗ trợ?',
        answer: 'Bạn có thể thanh toán bằng chuyển khoản ngân hàng nội địa hoặc quét mã QR qua SePay.',
    },
    {
        id: 3,
        question: 'Lượt phân tích AI bổ sung có hạn sử dụng không?',
        answer: 'Lượt AI add-on được cộng trực tiếp vào tài khoản và có thể dùng cho các lần phân tích tiếp theo.',
    },
];

export const getPackageBySlug = async (slug) => {
    try {
        if (!slug) {
            throw new Error('Không có slug gửi lên.');
        }
        const result = await Response.GET(`plans/one/${slug}`);
        // const result = FALLBACK_PACKAGES;
        return result;
    } catch (error) {
        const status = error?.status || error?.response?.status;
        const data = error?.response?.data;
        return { ...data, status };
    }
};

export const createPayment = async (
    paymentable_type,
    plan_id,
    addon_package_id,
) => {
    try {
        if (!paymentable_type || !plan_id || !addon_package_id) {
            throw new Error('dữ liệu gửi lên không hợp lệ.');
        }
        const result = await Response.POST('payments/create', {
            paymentable_type,
            plan_id,
            addon_package_id,
        });

        return result;
    } catch (error) {
        const status = error?.status || error?.response?.status;
        const data = error?.response?.data;
        return { ...data, status };
    }
};
