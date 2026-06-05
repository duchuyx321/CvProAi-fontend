//Lấy giá trị theo path kiểu "content.SKILLS.0.name"
export const getValueByPath = (obj, path) =>
    path.split('.').reduce((acc, key) => acc?.[key], obj);

// Gán giá trị theo path, tự tạo object trung gian nếu chưa có
// Mutates obj trực tiếp — chỉ dùng trên object mới tạo (result trong buildPatch)
export const setValueByPath = (obj, path, value) => {
    const keys = path.split('.');
    let current = obj;

    keys.forEach((key, index) => {
        if (index === keys.length - 1) {
            current[key] = value;
            return;
        }
        if (!current[key] || typeof current[key] !== 'object' || Array.isArray(current[key])) {
            current[key] = {};
        }
        current = current[key];
    });

    return obj;
};

// Xây dựng patch object chỉ chứa các field thực sự thay đổi
// so với originalData, dựa trên danh sách dirtyFields đã track
export const buildPatchFromDirtyFields = (originalData, currentData, dirtyFields) => {
    const result = {};

    Object.keys(dirtyFields || {}).forEach((path) => {
        const currentValue = getValueByPath(currentData, path);

        // Bỏ qua path không có giá trị thực (tránh patch object sai cấu trúc)
        if (currentValue === undefined) return;

        const originalValue = getValueByPath(originalData, path);

        if (JSON.stringify(originalValue) !== JSON.stringify(currentValue)) {
            setValueByPath(result, path, currentValue);
        }
    });

    return result;
};