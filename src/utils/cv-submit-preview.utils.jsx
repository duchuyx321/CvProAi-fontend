import { buildPatchFromDirtyFields } from './cv-patch.utils';

function isPlainObject(value) {
    return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function isBlankRichText(value = '') {
    const normalizedValue = String(value).replace(/\s+/g, '').toLowerCase();

    return [
        '<p></p>',
        '<p><br></p>',
        '<div></div>',
        '<div><br></div>',
    ].includes(normalizedValue);
}

function sanitizePayloadValue(value) {
    if (value == null) return undefined;

    if (typeof value === 'string') {
        if (value.trim() === '' || isBlankRichText(value)) {
            return undefined;
        }

        return value;
    }

    if (Array.isArray(value)) {
        const nextArray = value
            .map((item) => sanitizePayloadValue(item))
            .filter((item) => item !== undefined);

        return nextArray.length > 0 ? nextArray : undefined;
    }

    if (isPlainObject(value)) {
        const nextObject = Object.entries(value).reduce(
            (result, [key, item]) => {
                const sanitizedValue = sanitizePayloadValue(item);

                if (sanitizedValue !== undefined) {
                    result[key] = sanitizedValue;
                }

                return result;
            },
            {},
        );

        return Object.keys(nextObject).length > 0 ? nextObject : undefined;
    }

    return value;
}

function buildDeepDiff(baseValue, currentValue) {
    if (JSON.stringify(baseValue) === JSON.stringify(currentValue)) {
        return undefined;
    }

    if (Array.isArray(currentValue)) {
        return currentValue;
    }

    if (isPlainObject(currentValue)) {
        const diffObject = Object.keys(currentValue).reduce((result, key) => {
            const diffValue = buildDeepDiff(
                baseValue?.[key],
                currentValue[key],
            );

            if (diffValue !== undefined) {
                result[key] = diffValue;
            }

            return result;
        }, {});

        return Object.keys(diffObject).length > 0 ? diffObject : undefined;
    }

    return currentValue;
}

function buildCommonPreviewPayload({
    title,
    templateId,
    language,
    status,
    visibility,
    contentPatch,
    customConfigPatch,
} = {}) {
    return (
        sanitizePayloadValue({
            template_id: templateId,
            title,
            language,
            status,
            visibility,
            content: contentPatch,
            custom_config: customConfigPatch,
        }) || {}
    );
}

export function buildCreateSubmitPreview({
    originalData,
    currentData,
    finalCvName,
} = {}) {
    const trimmedName = (finalCvName || '').trim();
    const contentPatch = sanitizePayloadValue(
        buildDeepDiff(originalData?.content || {}, currentData?.content || {}),
    );
    const customConfigPatch = sanitizePayloadValue(
        buildDeepDiff(originalData?.config || {}, currentData?.config || {}),
    );
    const payload = buildCommonPreviewPayload({
        templateId: currentData?.template_id,
        title: trimmedName || currentData?.title || currentData?.name,
        language: currentData?.language,
        status: currentData?.status,
        visibility: currentData?.visibility,
        contentPatch,
        customConfigPatch,
    });

    return {
        contentPatch,
        customConfigPatch,
        payload,
    };
}

export function buildEditSubmitPreview({
    originalData,
    currentData,
    dirtyFields,
    finalCvName,
} = {}) {
    const trimmedName = (finalCvName || '').trim();
    const nextData = {
        ...currentData,
        name: trimmedName,
        title: trimmedName,
    };
    const dirtyPatch = buildPatchFromDirtyFields(
        originalData,
        nextData,
        dirtyFields,
    );
    const contentPatch = sanitizePayloadValue(dirtyPatch?.content);
    const customConfigPatch = dirtyPatch?.config
        ? sanitizePayloadValue(
              buildDeepDiff(originalData?.config || {}, nextData?.config || {}),
          )
        : undefined;
    const payload = buildCommonPreviewPayload({
        title: dirtyPatch?.name ? trimmedName : undefined,
        language: dirtyPatch?.language,
        status: dirtyPatch?.status,
        visibility: dirtyPatch?.visibility,
        contentPatch,
        customConfigPatch,
    });

    return {
        dirtyPatch,
        contentPatch,
        customConfigPatch,
        payload,
    };
}
