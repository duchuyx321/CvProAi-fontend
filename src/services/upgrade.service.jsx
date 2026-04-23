/* eslint-disable react-refresh/only-export-components */
import * as Response from '~/utils/HttpsRequest';

const UPGRADE_PACKAGES_ENDPOINT = 'packages';
const UPGRADE_FAQS_ENDPOINT = 'faqs/upgrade';
const PACKAGE_DETAIL_ENDPOINT = (packageId) => `packages/${encodeURIComponent(packageId)}`;
const PACKAGE_ADDONS_ENDPOINT = (packageId) => `packages/${encodeURIComponent(packageId)}/addons`;

const FALLBACK_PACKAGES = [
    {
        id: 'free_plan',
        name: 'Gói Miễn phí',
        description: 'Dành cho người mới bắt đầu',
        price: 0,
        interval: '/ tháng',
        isPopular: false,
        features: [
            { text: '5 mẫu CV cơ bản', isActive: true },
            { text: 'Phân tích AI giới hạn', isActive: true },
            { text: 'Xuất PDF có watermark', isActive: true },
            { text: 'Gợi ý nâng cao từ AI', isActive: false },
        ],
    },
    {
        id: 'premium_plan',
        name: 'Gói Premium',
        description: 'Tối ưu hồ sơ sự nghiệp của bạn',
        price: 199000,
        interval: '/ tháng',
        isPopular: true,
        features: [
            { text: '20 lượt phân tích AI / tháng', isActive: true },
            { text: 'Xuất PDF không watermark', isActive: true },
            { text: 'Gợi ý nâng cao từ AI', isActive: true },
            { text: 'Hỗ trợ ưu tiên 24/7', isActive: true },
            { text: 'Truy cập tất cả các mẫu thiết kế', isActive: true },
        ],
    },
];

const FALLBACK_ADDONS = [
    {
        id: 'credit_pack_5',
        credits: 5,
        price: 45000,
        label: 'Thử nghiệm thêm với giá ưu đãi',
        discountPercent: 8,
        savingText: 'Tiết kiệm 10%',
        isBestValue: false,
    },
    {
        id: 'credit_pack_10',
        credits: 10,
        price: 90000,
        label: 'Bổ sung nhanh khi cần gấp',
        discountPercent: 10,
        savingText: 'Tiết kiệm 10%',
        isBestValue: false,
    },
    {
        id: 'credit_pack_20',
        credits: 20,
        price: 150000,
        label: 'Phù hợp sử dụng thường xuyên',
        discountPercent: 25,
        savingText: 'Tiết kiệm 25%',
        isBestValue: false,
    },
    {
        id: 'credit_pack_50',
        credits: 50,
        price: 250000,
        label: 'Ưu đãi lớn nhất',
        discountPercent: 50,
        savingText: 'Tiết kiệm 50%',
        isBestValue: true,
    },
];

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

const toSafeNumber = (value, fallback = 0) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};

const firstNotEmpty = (...values) => {
    for (const value of values) {
        if (value !== null && value !== undefined && value !== '') {
            return value;
        }
    }
    return null;
};

const normalizeFeature = (feature) => {
    if (typeof feature === 'string') {
        return {
            text: feature,
            isActive: true,
        };
    }

    return {
        text: firstNotEmpty(feature?.text, feature?.name, feature?.title, '') || '',
        isActive: feature?.isActive ?? feature?.is_active ?? true,
    };
};

const normalizePackage = (source = {}) => ({
    id: String(firstNotEmpty(source?.id, source?.code, source?.slug, '')),
    name: firstNotEmpty(source?.name, source?.title, 'Gói dịch vụ'),
    description: firstNotEmpty(source?.description, source?.desc, ''),
    price: toSafeNumber(firstNotEmpty(source?.price, source?.amount), 0),
    interval: firstNotEmpty(source?.interval, source?.billingCycle, source?.billing_cycle, '/ tháng'),
    isPopular: Boolean(source?.isPopular ?? source?.is_popular),
    features: Array.isArray(source?.features) ? source.features.map(normalizeFeature) : [],
});

const normalizeAddOn = (source = {}) => {
    const credits = toSafeNumber(firstNotEmpty(source?.credits, source?.aiCredits, source?.ai_credits), 0);
    const price = toSafeNumber(firstNotEmpty(source?.price, source?.amount), 0);
    const discountPercent = toSafeNumber(
        firstNotEmpty(source?.discountPercent, source?.discount_percent, source?.discount),
        0,
    );

    return {
        id: String(firstNotEmpty(source?.id, source?.code, source?.slug, '')),
        credits,
        price,
        label: firstNotEmpty(source?.label, source?.name, source?.title, `Gói ${credits} lượt`),
        discountPercent,
        savingText:
            firstNotEmpty(source?.savingText, source?.saving_text, source?.savingLabel) ||
            (discountPercent > 0 ? `Tiết kiệm ${discountPercent}%` : null),
        isBestValue: Boolean(source?.isBestValue ?? source?.is_best_value),
    };
};

const normalizeApiData = (res) => {
    const payload = res?.data ?? res ?? {};
    return payload?.data ?? payload;
};

const buildErrorResult = (error, fallbackData, defaultMessage) => {
    const status = error?.status || error?.response?.status || 500;
    const message = error?.response?.data?.message || defaultMessage;

    return {
        success: false,
        status,
        message,
        data: fallbackData,
    };
};

// export const getUpgradePackages = async () => {
//     try {
//         const res = await Response.GET(UPGRADE_PACKAGES_ENDPOINT);
//         const data = normalizeApiData(res);
//         const packages = Array.isArray(data)
//             ? data.map(normalizePackage).filter((item) => item.id)
//             : [];

//         return {
//             ...(res || {}),
//             success: res?.success ?? true,
//             data: packages,
//         };
//     } catch (error) {
//         return buildErrorResult(error, FALLBACK_PACKAGES, 'Không thể tải danh sách gói dịch vụ.');
//     }
// };

// export const getUpgradeFaqs = async () => {
//     try {
//         const res = await Response.GET(UPGRADE_FAQS_ENDPOINT);
//         const data = normalizeApiData(res);
//         const faqs = Array.isArray(data) ? data : [];

//         return {
//             ...(res || {}),
//             success: res?.success ?? true,
//             data: faqs,
//         };
//     } catch (error) {
//         return buildErrorResult(error, FALLBACK_FAQS, 'Không thể tải câu hỏi thường gặp.');
//     }
// };

export const getUpgradePackages = async () => {
    try {
        const res = await Response.GET(UPGRADE_PACKAGES_ENDPOINT);
        const data = normalizeApiData(res);
        const packages = Array.isArray(data)
            ? data.map(normalizePackage).filter((item) => item.id)
            : [];

        // Nếu API trả về mảng rỗng -> Ép dùng dữ liệu mẫu (Fallback)
        if (!packages || packages.length === 0) {
            return {
                success: false,
                message: 'Đang sử dụng dữ liệu mẫu.',
                data: FALLBACK_PACKAGES,
            };
        }

        return {
            ...(res || {}),
            success: res?.success ?? true,
            data: packages,
        };
    } catch (error) {
        return buildErrorResult(error, FALLBACK_PACKAGES, 'Không thể tải danh sách gói dịch vụ.');
    }
};

export const getUpgradeFaqs = async () => {
    try {
        const res = await Response.GET(UPGRADE_FAQS_ENDPOINT);
        const data = normalizeApiData(res);
        const faqs = Array.isArray(data) ? data : [];

        // Nếu API trả về mảng rỗng -> Ép dùng dữ liệu mẫu (Fallback)
        if (!faqs || faqs.length === 0) {
            return {
                success: false,
                message: 'Đang sử dụng dữ liệu mẫu.',
                data: FALLBACK_FAQS,
            };
        }

        return {
            ...(res || {}),
            success: res?.success ?? true,
            data: faqs,
        };
    } catch (error) {
        return buildErrorResult(error, FALLBACK_FAQS, 'Không thể tải câu hỏi thường gặp.');
    }
};  

// export const getUpgradeOptionsByPackageId = async (packageId) => {
//     const normalizedPackageId = String(packageId || '').trim();
//     const fallbackPlan = FALLBACK_PACKAGES.find((item) => item.id === normalizedPackageId) || FALLBACK_PACKAGES[1];

//     if (!normalizedPackageId) {
//         return {
//             success: false,
//             status: 400,
//             message: 'Thiếu mã gói dịch vụ.',
//             data: {
//                 plan: fallbackPlan,
//                 addOns: FALLBACK_ADDONS,
//             },
//         };
//     }

//     try {
//         const [planRes, addOnRes] = await Promise.all([
//             Response.GET(PACKAGE_DETAIL_ENDPOINT(normalizedPackageId)),
//             Response.GET(PACKAGE_ADDONS_ENDPOINT(normalizedPackageId)),
//         ]);

//         const rawPlan = normalizeApiData(planRes);
//         const rawAddOns = normalizeApiData(addOnRes);

//         const plan = normalizePackage(rawPlan || {});
//         const addOns = Array.isArray(rawAddOns) ? rawAddOns.map(normalizeAddOn).filter((item) => item.id) : [];

//         return {
//             success: (planRes?.success ?? true) && (addOnRes?.success ?? true),
//             data: {
//                 plan: plan.id ? plan : fallbackPlan,
//                 addOns: addOns.length ? addOns : FALLBACK_ADDONS,
//             },
//         };
//     } catch (error) {
//         return buildErrorResult(
//             error,
//             {
//                 plan: fallbackPlan,
//                 addOns: FALLBACK_ADDONS,
//             },
//             'Không thể tải tùy chọn nâng cấp.',
//         );
//     }
// };

export const getUpgradeOptionsByPackageId = async (packageId) => {
    const normalizedPackageId = String(packageId || '').trim();
    const fallbackPlan = FALLBACK_PACKAGES.find((item) => item.id === normalizedPackageId) || FALLBACK_PACKAGES[1];

    if (!normalizedPackageId) {
        return {
            success: false,
            status: 400,
            message: 'Thiếu mã gói dịch vụ.',
            data: {
                plan: fallbackPlan,
                addOns: FALLBACK_ADDONS,
            },
        };
    }

    try {
        const [planRes, addOnRes] = await Promise.all([
            Response.GET(PACKAGE_DETAIL_ENDPOINT(normalizedPackageId)),
            Response.GET(PACKAGE_ADDONS_ENDPOINT(normalizedPackageId)),
        ]);

        const rawPlan = normalizeApiData(planRes);
        const rawAddOns = normalizeApiData(addOnRes);

        // Tránh lỗi khi Vite trả về HTML thay vì JSON
        const safeRawPlan = typeof rawPlan === 'object' && rawPlan !== null ? rawPlan : {};
        
        const plan = normalizePackage(safeRawPlan);
        const addOns = Array.isArray(rawAddOns)
            ? rawAddOns
                  .map((item, index) => {
                      const normalized = normalizeAddOn(item);
                      const fallbackId =
                          normalized?.id && normalized.id !== 'null' && normalized.id !== 'undefined'
                              ? normalized.id
                              : `addon_${normalizedPackageId}_${index + 1}`;
                      const runs = Number(normalized?.runs ?? normalized?.credits ?? item?.runs ?? item?.credits ?? 0);

                      return {
                          ...normalized,
                          id: fallbackId,
                          runs: Number.isFinite(runs) ? runs : 0,
                          credits: Number.isFinite(runs) ? runs : 0,
                          name: normalized?.name || item?.name || item?.title || normalized?.label || null,
                          description: normalized?.description || item?.description || item?.desc || null,
                      };
                  })
                  .filter((item) => item.id && item.id !== 'null')
            : [];

        // Kiểm tra nếu bóc tách lỗi (ra chuỗi 'null' hoặc rỗng) thì ép dùng Fallback
        const isPlanValid = plan && plan.id && plan.id !== 'null' && plan.id !== 'undefined';

        return {
            success: (planRes?.success ?? true) && (addOnRes?.success ?? true),
            data: {
                plan: isPlanValid ? plan : fallbackPlan,
                addOns: addOns.length > 0 ? addOns : FALLBACK_ADDONS,
            },
        };
    } catch (error) {
        return buildErrorResult(
            error,
            {
                plan: fallbackPlan,
                addOns: FALLBACK_ADDONS,
            },
            'Không thể tải tùy chọn nâng cấp.',
        );
    }
};
