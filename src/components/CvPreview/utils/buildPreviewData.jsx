import { deepMerge } from './deepMerge';
import { getMockContent } from './mockContent';

export default function buildPreviewData({ template, cv }) {
  const config = cv?.config || template?.config || {};
  const templateCode = template?.code || 'DEV_01';
  const mockContent = getMockContent(templateCode);
  const userContent = cv?.content || {};

  return {
    id: cv?.id || template?.id || 'preview-id',
    title: cv?.title || template?.name || 'CV Preview',
    templateCode,
    config,
    content: deepMerge(mockContent, userContent),
  };
}