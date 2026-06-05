export function unwrapApiResponse(response, fallback = null) {
    if (!response || typeof response !== 'object') return fallback;
    return Object.prototype.hasOwnProperty.call(response, 'data')
        ? response.data
        : fallback;
}

export function getApiMessage(response, fallback = '') {
    return response?.messsage || response?.message || fallback;
}
