import { deepMerge } from './deepMerge';
import { getMockContent } from './mockContent';
import normalizeTemplateConfig from './normalizeTemplateConfig';

export default function buildPreviewData({ template, cv }) {
    const rawConfig = cv?.config || template?.config || {};
    const templateCode = cv?.template_code || template?.code || 'DEV_01';
    const mockContent = getMockContent(templateCode);
    const userContent = cv?.content || {};

    const content = deepMerge(mockContent, userContent);
    const config = normalizeTemplateConfig(rawConfig, content);

    return {
        id: cv?.id || template?.id || 'preview-id',
        title: cv?.title || template?.name || 'CV Preview',
        templateCode,
        config,
        content,
    };
}
