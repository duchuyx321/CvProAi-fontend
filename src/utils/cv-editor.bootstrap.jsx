import { normalizeCvData } from './cv-data.normalizer';
import {
    getContentKey,
    isArraySection,
    normalizeSectionType,
} from './cv-section.schema';

function buildEmptyEditableContent(templateConfig = {}) {
    const sections = templateConfig?.sections || {};

    return Object.keys(sections).reduce((result, sectionKey) => {
        const sectionConfig = sections?.[sectionKey] || {};
        const contentKey = getContentKey(sectionKey, sectionConfig);

        if (!contentKey || Object.prototype.hasOwnProperty.call(result, contentKey)) {
            return result;
        }

        const normalizedType = normalizeSectionType(sectionKey, sectionConfig);

        if (normalizedType === 'summary') {
            result[contentKey] = '';
            return result;
        }

        if (isArraySection(sectionKey, sectionConfig)) {
            result[contentKey] = [];
            return result;
        }

        result[contentKey] = {};
        return result;
    }, {});
}

export function normalizeTemplateToCreateCv(template = {}) {
    const normalizedCv = normalizeCvData(
        {
            id: '',
            slug: '',
            name: '',
            title: '',
            template_id: template?.id || template?.template_id || '',
            preview_url: template?.preview_url || '',
            code: template?.template_code || template?.code || '',
            template_code: template?.template_code || template?.code || '',
            config: template?.config || {},
            content: template?.content || {},
            template_content: template?.content || {},
            user_profile: template?.user_profile || {},
        },
        {
            seedContent: template?.content || {},
            useMockContent: true,
        },
    );

    return {
        ...normalizedCv,
        content: buildEmptyEditableContent(normalizedCv?.config),
    };
}

export function normalizeCvDetailForEditor(cv = {}) {
    return normalizeCvData(cv, {
        seedContent:
            cv?.template_content ||
            (cv?.template?.content && typeof cv.template.content === 'object'
                ? cv.template.content
                : {}),
        useMockContent: false,
    });
}
