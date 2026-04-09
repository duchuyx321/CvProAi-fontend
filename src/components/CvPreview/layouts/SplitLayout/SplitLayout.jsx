import React from 'react';
import styles from './SplitLayout.module.scss';
import sectionResolver from '../../utils/sectionResolver';

function renderSectionList({ zoneSections, sections, content, theme, zoneId }) {
    return zoneSections.map((sectionKey) => {
        const sectionConfig = sections?.[sectionKey];

        if (!sectionConfig) {
            console.warn(
                `[CvPreview][SplitLayout] Missing section config: ${sectionKey} in zone ${zoneId}`,
            );
            return null;
        }

        const SectionComponent = sectionResolver(sectionConfig.type);

        if (!SectionComponent) {
            console.warn(
                `[CvPreview][SplitLayout] Missing section component for type: ${sectionConfig.type}`,
            );
            return null;
        }

        return (
            <SectionComponent
                key={sectionKey}
                sectionKey={sectionKey}
                config={sectionConfig}
                data={content?.[sectionKey]}
                theme={theme}
            />
        );
    });
}

function SplitLayout({ previewData }) {
    const { config, content } = previewData;
    const columns = config?.layout?.body?.columns || [];
    const zones = config?.zones || {};
    const sections = config?.sections || {};
    const theme = config?.theme || {};

    return (
        <div className={styles.layout}>
            {columns.map((column) => {
                const zoneSections = Array.isArray(zones?.[column.id])
                    ? zones[column.id]
                    : [];

                return (
                    <div
                        key={column.id}
                        className={styles.column}
                        style={{ width: `${column.width || 100}%` }}
                    >
                        {renderSectionList({
                            zoneSections,
                            sections,
                            content,
                            theme,
                            zoneId: column.id,
                        })}
                    </div>
                );
            })}
        </div>
    );
}

export default SplitLayout;
