import React from 'react';
import styles from './BannerSplitLayout.module.scss';
import sectionResolver from '../../utils/sectionResolver';

function renderZone({ zoneId, zones, sections, content, theme }) {
    const zoneSections = Array.isArray(zones?.[zoneId]) ? zones[zoneId] : [];

    return zoneSections.map((sectionKey) => {
        const sectionConfig = sections?.[sectionKey];

        if (!sectionConfig) {
            console.warn(
                `[CvPreview][BannerSplitLayout] Missing section config: ${sectionKey} in zone ${zoneId}`,
            );
            return null;
        }

        const SectionComponent = sectionResolver(sectionConfig.type);

        if (!SectionComponent) {
            console.warn(
                `[CvPreview][BannerSplitLayout] Missing section component for type: ${sectionConfig.type}`,
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

function BannerSplitLayout({ previewData }) {
    const { config, content } = previewData;
    const columns = config?.layout?.body?.columns || [];
    const zones = config?.zones || {};
    const sections = config?.sections || {};
    const theme = config?.theme || {};

    const bannerColumn = columns[0];
    const bodyColumns = columns.slice(1);

    return (
        <div className={styles.layout}>
            <div className={styles.banner}>
                {bannerColumn
                    ? renderZone({
                          zoneId: bannerColumn.id,
                          zones,
                          sections,
                          content,
                          theme,
                      })
                    : null}
            </div>

            <div className={styles.bottom}>
                {bodyColumns.map((column) => (
                    <div
                        key={column.id}
                        className={styles.column}
                        style={{ width: `${column.width || 100}%` }}
                    >
                        {renderZone({
                            zoneId: column.id,
                            zones,
                            sections,
                            content,
                            theme,
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default BannerSplitLayout;
