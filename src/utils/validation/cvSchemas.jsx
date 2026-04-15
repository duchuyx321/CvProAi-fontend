const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[0-9+\-\s()]{8,20}$/;

export function validateCvData(cvData) {
    const errors = {};

    const profileHeader = cvData?.content?.profile_header || {};
    const contact = cvData?.content?.CONTACT || {};

    const fullName = profileHeader?.full_name || '';
    const headline = profileHeader?.headline || '';
    const email = contact?.email || '';
    const phone = contact?.phone || '';
    const address = contact?.address || '';

    const summary = cvData?.content?.SUMMARY || '';
    const skills = cvData?.content?.SKILLS || [];
    const experience = cvData?.content?.EXPERIENCE || [];
    const education = cvData?.content?.EDUCATION || [];

    if (!String(fullName).trim()) {
        errors.full_name = 'Họ và tên là bắt buộc';
    }

    if (!String(headline).trim()) {
        errors.headline = 'Vị trí ứng tuyển là bắt buộc';
    }

    if (!String(email).trim()) {
        errors.email = 'Email là bắt buộc';
    } else if (!emailRegex.test(email)) {
        errors.email = 'Email không đúng định dạng';
    }

    if (phone && !phoneRegex.test(phone)) {
        errors.phone = 'Số điện thoại không hợp lệ';
    }

    if (!String(address).trim()) {
        errors.address = 'Địa chỉ là bắt buộc';
    }

    if (!String(summary).trim()) {
        errors.summary = 'Vui lòng nhập mục tiêu nghề nghiệp';
    }

    if (!Array.isArray(skills) || skills.length === 0) {
        errors.skills = 'Vui lòng thêm ít nhất 1 kỹ năng';
    }

    // ===== EXPERIENCE =====
    if (!Array.isArray(experience) || experience.length === 0) {
        errors.experience = 'Vui lòng thêm ít nhất 1 kinh nghiệm làm việc';
    } else {
        experience.forEach((item, index) => {
            if (!String(item?.company || '').trim()) {
                errors[`experience_company_${index}`] = 'Tên công ty là bắt buộc';
            }

            if (!String(item?.role || '').trim()) {
                errors[`experience_role_${index}`] = 'Vị trí làm việc là bắt buộc';
            }

            if (!String(item?.description || '').trim()) {
                errors[`experience_description_${index}`] =
                    'Mô tả kinh nghiệm là bắt buộc';
            }
        });
    }

    // ===== EDUCATION =====
    if (!Array.isArray(education) || education.length === 0) {
        errors.education = 'Vui lòng thêm ít nhất 1 học vấn';
    } else {
        education.forEach((item, index) => {
            if (!String(item?.school || '').trim()) {
                errors[`education_school_${index}`] = 'Tên trường là bắt buộc';
            }

            if (!String(item?.degree || '').trim()) {
                errors[`education_degree_${index}`] =
                    'Bằng cấp / chuyên ngành là bắt buộc';
            }

            if (!String(item?.description || '').trim()) {
                errors[`education_description_${index}`] =
                    'Mô tả học vấn là bắt buộc';
            }
        });
    }

    return errors;
}