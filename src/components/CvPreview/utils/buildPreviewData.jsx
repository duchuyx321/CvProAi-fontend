import { normalizeCvData } from '~/utils/cv-data.normalizer';

export default function buildPreviewData({ template, cv }) {
    const normalizedCv = normalizeCvData(
        {
            ...template,
            ...cv,
            template: {
                ...(template || {}),
                ...(cv?.template || {}),
            },
            config: cv?.config || template?.config || {},
            content: cv?.content || template?.content || {},
            template_content:
                cv?.template_content || template?.content || cv?.template?.content || {},
        },
        {
            seedContent:
                template?.content ||
                cv?.template_content ||
                cv?.template?.content ||
                {},
            useMockContent: Boolean(template?.content || cv?.template_content),
        },
    );

    return {
        id: normalizedCv?.id || template?.id || 'preview-id',
        title: normalizedCv?.title || template?.name || 'CV Preview',
        templateCode: normalizedCv?.template_code || template?.code || 'DEV_01',
        config: normalizedCv?.config || {},
        content: normalizedCv?.content || {},
    };
}
