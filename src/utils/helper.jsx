import CryptoJS from 'crypto-js';
export class helper {
    static hashValidate(text) {
        return CryptoJS.AES.encrypt(
            text,
            import.meta.env.VITE_SECRET_KEY,
        ).toString();
    }
    static decryptValidate(text) {
        const bytes = CryptoJS.AES.decrypt(
            text,
            import.meta.env.VITE_SECRET_KEY,
        );

        return bytes.toString(CryptoJS.enc.Utf8);
    }
    static buildPlanFeatures(plan) {
        const features = [];

        if (plan.cv_limit) {
            features.push(`Tạo tối đa ${plan.cv_limit} CV/tháng`);
        }

        if (plan.ai_limit) {
            features.push(`Phân tích AI ${plan.ai_limit} lần/tháng`);
        }

        if (plan.export_limit) {
            features.push(`Xuất file ${plan.export_limit} lần/tháng`);
        }

        if (plan.view_full_ai_analysis) {
            features.push('Xem đầy đủ phân tích AI');
        }

        if (plan.premium_template) {
            features.push('Mẫu CV cao cấp');
        }

        if (plan.remove_watermark) {
            features.push('Xuất file không watermark');
        }

        if (plan.custom_domain) {
            features.push('Tùy chỉnh liên kết CV');
        }

        if (plan.priority_support) {
            features.push('Hỗ trợ ưu tiên');
        }

        return features;
    }
}
