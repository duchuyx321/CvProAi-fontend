import { useMemo } from 'react';
import buildPreviewData from './utils/buildPreviewData';
import CVTemplateRenderer from './components/CVTemplateRenderer';

function CvPreview({ template, cv, pageRef = null }) {
    const previewData = useMemo(
        () => buildPreviewData({ template, cv }),
        [template, cv],
    );

    return <CVTemplateRenderer previewData={previewData} pageRef={pageRef} />;
}

export default CvPreview;
