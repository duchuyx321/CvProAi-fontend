export function getFieldKey(field) {
    if (typeof field === 'string') return field;
    if (field?.type === 'FIELD') return field.key;
    if (field?.key) return field.key;
    return '';
}

export function flattenFieldKeys(fields = []) {
    if (!Array.isArray(fields)) return [];

    return fields.reduce((result, field) => {
        const directKey = getFieldKey(field);

        if (directKey) {
            result.push(directKey);
        }

        if (Array.isArray(field?.items)) {
            result.push(...flattenFieldKeys(field.items));
        }

        return result;
    }, []);
}

export function uniqueFieldKeys(fields = []) {
    return [...new Set(flattenFieldKeys(fields).filter(Boolean))];
}

export function getFieldLabel(fieldKey = '') {
    const labelMap = {
        full_name: 'Họ và tên',
        headline: 'Vị trí ứng tuyển',
        avatar_url: 'Ảnh đại diện',
        birth_date: 'Ngày sinh',
        dob: 'Ngày sinh',
        gender: 'Giới tính',
        phone: 'Số điện thoại',
        email: 'Email',
        address: 'Địa chỉ',
        location: 'Địa điểm',
        website: 'Website',
        linkedin: 'LinkedIn',
        github: 'GitHub',
        portfolio: 'Portfolio',
        summary: 'Tóm tắt',
        name: 'Tên',
        title: 'Tiêu đề',
        role: 'Vai trò',
        position: 'Vị trí',
        company: 'Công ty',
        organization: 'Tổ chức',
        school: 'Trường học',
        degree: 'Bằng cấp',
        major: 'Chuyên ngành',
        start_date: 'Ngày bắt đầu',
        end_date: 'Ngày kết thúc',
        date: 'Ngày',
        year: 'Năm',
        issue_date: 'Ngày cấp',
        issuer: 'Đơn vị cấp',
        credential_url: 'URL chứng chỉ',
        link: 'Liên kết',
        technologies: 'Công nghệ',
        tech_stack: 'Công nghệ',
        gpa: 'GPA',
        level: 'Cấp độ',
        category: 'Nhóm',
        description: 'Mô tả',
        achievements: 'Thành tựu',
        content: 'Nội dung',
        is_current: 'Đang diễn ra',
    };

    return labelMap[fieldKey] || fieldKey.replace(/_/g, ' ');
}

export function isLongTextField(fieldKey = '') {
    return [
        'description',
        'achievements',
        'content',
        'summary',
        'technologies',
        'tech_stack',
    ].includes(fieldKey);
}

export function isBooleanField(fieldKey = '') {
    return fieldKey === 'is_current' || fieldKey.startsWith('is_');
}
