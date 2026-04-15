const CV_COLLECTION_ENDPOINT = '/api/cv/my-collection';
// TODO: đổi endpoint này đúng với BE hiện tại của bạn

const parseResponse = async (response) => {
    try {
        return await response.json();
    } catch (error) {
        return null;
    }
};

const normalizeCVItem = (cv) => ({
    id: cv?.id ?? cv?.cvId ?? cv?._id ?? null,
    fileName:
        cv?.fileName ||
        cv?.title ||
        cv?.name ||
        cv?.originalFileName ||
        'CV chưa đặt tên',
    fileUrl: cv?.fileUrl || cv?.cvUrl || cv?.url || '',
    updatedAt: cv?.updatedAt || cv?.updated_at || cv?.modifiedAt || '',
    role:
        cv?.role ||
        cv?.targetPosition ||
        cv?.jobTitle ||
        cv?.desiredPosition ||
        'Ứng viên tổng quát',
    location:
        cv?.location ||
        cv?.city ||
        cv?.province ||
        cv?.address ||
        'Chưa cập nhật địa điểm',
    level:
        cv?.level ||
        cv?.experienceLevel ||
        cv?.seniority ||
        cv?.experience ||
        'Chưa cập nhật cấp độ',
});

export const getMyCVCollection = async (options = {}) => {
    try {
        const response = await fetch(CV_COLLECTION_ENDPOINT, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            signal: options.signal,
        });

        const result = await parseResponse(response);

        if (!response.ok || result?.success === false) {
            return {
                success: false,
                data: [],
                message:
                    result?.message || 'Không thể tải danh sách CV của bạn',
            };
        }

        const rawData = Array.isArray(result?.data)
            ? result.data
            : Array.isArray(result?.data?.items)
              ? result.data.items
              : Array.isArray(result)
                ? result
                : [];

        return {
            success: true,
            data: rawData.map(normalizeCVItem),
            message: result?.message || '',
        };
    } catch (error) {
        if (error?.name === 'AbortError') {
            return {
                success: false,
                data: [],
                message: 'Yêu cầu tải danh sách CV đã bị hủy',
            };
        }

        return {
            success: false,
            data: [],
            message: error?.message || 'Không thể tải danh sách CV của bạn',
        };
    }
};