import { normalizeTemplateToCreateCv } from '~/utils/cv-editor.bootstrap';
import { validateTemplateConfig } from '~/utils/cv-section.schema';

import { buildEditorTemplateConfig } from '../TemplateEditor/templateSchema';

const CHECK_STATUS = {
    PASS: 'pass',
    WARNING: 'warning',
    FAIL: 'fail',
};

const createCheck = ({ key, label, status, message }) => ({
    key,
    label,
    status,
    message,
});

const hasObjectValues = (value) => {
    return Boolean(
        value &&
            typeof value === 'object' &&
            !Array.isArray(value) &&
            Object.keys(value).length > 0,
    );
};

const getZoneSectionKeys = (zones = {}) => {
    return [...new Set(Object.values(zones).flat().filter(Boolean))];
};

export const buildTemplateDraftFromEditor = (editor, template = {}) => {
    const config = buildEditorTemplateConfig(editor, template?.config || {});

    return {
        ...(template || {}),
        name: editor?.name?.trim() || template?.name || '',
        code: editor?.code?.trim() || template?.code || '',
        description: editor?.description || template?.description || '',
        category: editor?.category || template?.category || '',
        is_active: editor?.is_active ?? template?.is_active ?? true,
        is_premium: editor?.is_premium ?? template?.is_premium ?? false,
        config,
    };
};

export const validateTemplateForUserFlow = (template = {}) => {
    const config = template?.config || {};
    const zones = config?.zones || {};
    const sections = config?.sections || {};
    const zoneSectionKeys = getZoneSectionKeys(zones);
    const checks = [];

    checks.push(
        createCheck({
            key: 'identity',
            label: 'Thông tin mẫu',
            status:
                template?.name && template?.code
                    ? CHECK_STATUS.PASS
                    : CHECK_STATUS.FAIL,
            message:
                template?.name && template?.code
                    ? 'Đã có tên và mã mẫu CV.'
                    : 'Cần có đủ tên và mã mẫu CV trước khi xuất bản.',
        }),
    );

    checks.push(
        createCheck({
            key: 'zones',
            label: 'Layout zones',
            status: hasObjectValues(zones) ? CHECK_STATUS.PASS : CHECK_STATUS.FAIL,
            message: hasObjectValues(zones)
                ? `Đã cấu hình ${Object.keys(zones).length} vùng layout.`
                : 'Thiếu config.zones, user không thể render bố cục CV.',
        }),
    );

    checks.push(
        createCheck({
            key: 'sections',
            label: 'Section config',
            status:
                hasObjectValues(sections) && zoneSectionKeys.length > 0
                    ? CHECK_STATUS.PASS
                    : CHECK_STATUS.FAIL,
            message:
                hasObjectValues(sections) && zoneSectionKeys.length > 0
                    ? `Đã có ${zoneSectionKeys.length} section trong layout.`
                    : 'Thiếu config.sections hoặc chưa gắn section vào zones.',
        }),
    );

    const schemaValidation = validateTemplateConfig(config);
    checks.push(
        createCheck({
            key: 'schema',
            label: 'Schema renderer',
            status: schemaValidation?.isValid
                ? CHECK_STATUS.PASS
                : CHECK_STATUS.FAIL,
            message: schemaValidation?.isValid
                ? 'Schema hợp lệ với renderer hiện tại.'
                : schemaValidation?.message || 'Schema CV chưa hợp lệ.',
        }),
    );

    let normalizedCv = null;
    let normalizeError = '';

    try {
        normalizedCv = normalizeTemplateToCreateCv(template);
    } catch (error) {
        normalizeError = error?.message || 'Không thể mô phỏng tạo CV.';
    }

    checks.push(
        createCheck({
            key: 'createFlow',
            label: 'Luồng tạo CV',
            status: normalizedCv ? CHECK_STATUS.PASS : CHECK_STATUS.FAIL,
            message: normalizedCv
                ? 'Template đi qua được normalizeTemplateToCreateCv.'
                : normalizeError,
        }),
    );

    const hasTheme = hasObjectValues(config?.theme);
    checks.push(
        createCheck({
            key: 'theme',
            label: 'Theme',
            status: hasTheme ? CHECK_STATUS.PASS : CHECK_STATUS.WARNING,
            message: hasTheme
                ? 'Đã có theme riêng cho template.'
                : 'Chưa có theme riêng, renderer sẽ dùng fallback mặc định.',
        }),
    );

    const errors = checks.filter((check) => check.status === CHECK_STATUS.FAIL);
    const warnings = checks.filter(
        (check) => check.status === CHECK_STATUS.WARNING,
    );

    return {
        isValid: errors.length === 0,
        status:
            errors.length > 0
                ? CHECK_STATUS.FAIL
                : warnings.length > 0
                  ? CHECK_STATUS.WARNING
                  : CHECK_STATUS.PASS,
        checks,
        errors,
        warnings,
        normalizedCv,
    };
};

export const getQualitySummary = (report) => {
    if (!report) return 'Chưa kiểm tra template.';
    if (report.errors?.length) {
        return `Còn ${report.errors.length} lỗi cần sửa trước khi xuất bản.`;
    }
    if (report.warnings?.length) {
        return `Đã đạt kiểm tra chính, còn ${report.warnings.length} cảnh báo nên xem lại.`;
    }
    return 'Template sẵn sàng cho luồng tạo CV của user.';
};

export { CHECK_STATUS };
