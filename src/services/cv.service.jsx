const CV_COLLECTION_ENDPOINT = '/api/cv/my-collection';
// TODO: đổi endpoint này đúng với BE hiện tại của bạn

const parseResponse = async (response) => {
    try {
        return await response.json();
    } catch (error) {
        return null;
    }
};

export const getMyCVCollection = async () => {
    try {
        const response = await fetch(CV_COLLECTION_ENDPOINT, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const result = await parseResponse(response);

        if (!response.ok) {
            return {
                success: false,
                data: [],
                message:
                    result?.message || 'Không thể tải danh sách CV của bạn',
            };
        }

        const normalizedData = Array.isArray(result?.data)
            ? result.data
            : Array.isArray(result?.data?.items)
              ? result.data.items
              : Array.isArray(result)
                ? result
                : [];

        return {
            success: true,
            data: normalizedData,
            message: result?.message || '',
        };
    } catch (error) {
        return {
            success: false,
            data: [],
            message: error?.message || 'Không thể tải danh sách CV của bạn',
        };
    }
};