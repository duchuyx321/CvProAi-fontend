import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { toBlob } from 'html-to-image';

import {
    buildEditorResumeData,
    createInitialCvState,
    getContentKey,
    isArraySection,
    normalizeSectionType,
} from '~/utils/cv-section.schema';

function useCvEditorState() {
    const [submitting, setSubmitting] = useState(false);
    const [cvData, setCvData] = useState(createInitialCvState);
    const [previewImage, setPreviewImage] = useState('');
    const [originalData, setOriginalData] = useState(null);
    const [dirtyFields, setDirtyFields] = useState({});
    const [fileMap, setFileMap] = useState({});

    const pageRef = useRef(null);

    const isDirty = useMemo(
        () => Object.keys(dirtyFields).length > 0,
        [dirtyFields],
    );

    const resumeData = useMemo(() => buildEditorResumeData(cvData), [cvData]);

    const syncPersistedData = useCallback((nextCvData) => {
        setCvData(nextCvData);
        setOriginalData(JSON.parse(JSON.stringify(nextCvData || {})));
        setDirtyFields({});
        setFileMap({});
    }, []);

    const markDirtyField = useCallback((path) => {
        if (!path) return;
        setDirtyFields((prev) => ({ ...prev, [path]: true }));
    }, []);

    const updateContentKey = useCallback((contentKey, updater) => {
        setCvData((prev) => {
            const prevContent = prev?.content || {};
            const prevValue = prevContent[contentKey];
            const nextValue =
                typeof updater === 'function' ? updater(prevValue) : updater;

            if (nextValue === undefined) {
                const { [contentKey]: _removed, ...restContent } = prevContent;
                return { ...prev, content: restContent };
            }

            return {
                ...prev,
                content: { ...prevContent, [contentKey]: nextValue },
            };
        });
    }, []);

    const handleChangeField = useCallback(
        (sectionKey, field, value, file) => {
            const sectionConfig = cvData?.config?.sections?.[sectionKey] || {};
            const normalizedType = normalizeSectionType(
                sectionKey,
                sectionConfig,
            );
            const contentKey = getContentKey(sectionKey, sectionConfig);

            if (normalizedType === 'summary') {
                markDirtyField(`content.${contentKey}`);
                updateContentKey(
                    contentKey,
                    typeof value === 'string' ? value : value?.summary || '',
                );
                return;
            }

            markDirtyField(`content.${contentKey}.${field}`);
            updateContentKey(contentKey, (prevValue = {}) => ({
                ...prevValue,
                [field]: value,
            }));

            if (file instanceof File) {
                setFileMap((prev) => ({
                    ...prev,
                    [`content.${contentKey}.${field}`]: file,
                }));
            }
        },
        [cvData?.config?.sections, markDirtyField, updateContentKey],
    );

    const handleChangeArrayField = useCallback(
        (sectionKey, nextValue) => {
            const sectionConfig = cvData?.config?.sections?.[sectionKey] || {};
            const contentKey = getContentKey(sectionKey, sectionConfig);

            markDirtyField(`content.${contentKey}`);
            updateContentKey(
                contentKey,
                Array.isArray(nextValue) ? nextValue : [],
            );
        },
        [cvData?.config?.sections, markDirtyField, updateContentKey],
    );

    const handleChangeObjectInArray = useCallback(
        (sectionKey, index, key, value) => {
            const sectionConfig = cvData?.config?.sections?.[sectionKey] || {};
            const contentKey = getContentKey(sectionKey, sectionConfig);

            markDirtyField(`content.${contentKey}`);
            updateContentKey(contentKey, (prevValue) => {
                const currentList = Array.isArray(prevValue) ? prevValue : [];
                const nextList = [...currentList];
                nextList[index] = { ...(nextList[index] || {}), [key]: value };
                return nextList;
            });
        },
        [cvData?.config?.sections, markDirtyField, updateContentKey],
    );

    const handleChangeConfig = useCallback(
        (nextConfig) => {
            markDirtyField('config');
            setCvData((prev) => ({ ...prev, config: nextConfig }));
        },
        [markDirtyField],
    );

    const handleChangeCvName = useCallback(
        (value) => {
            markDirtyField('name');
            setCvData((prev) => ({ ...prev, name: value }));
        },
        [markDirtyField],
    );

    const handleRemoveSection = useCallback(
        (sectionKey) => {
            const sectionConfig = cvData?.config?.sections?.[sectionKey] || {};
            const normalizedType = normalizeSectionType(
                sectionKey,
                sectionConfig,
            );
            const contentKey = getContentKey(sectionKey, sectionConfig);

            markDirtyField(`content.${contentKey}`);

            if (normalizedType === 'summary') {
                updateContentKey(contentKey, '');
                return;
            }

            if (isArraySection(sectionKey, sectionConfig)) {
                updateContentKey(contentKey, []);
                return;
            }

            updateContentKey(contentKey, {});
        },
        [cvData?.config?.sections, markDirtyField, updateContentKey],
    );

    const waitForImages = useCallback(async (container) => {
        if (!container) return;

        const images = Array.from(container.querySelectorAll('img'));

        await Promise.all(
            images.map((img) => {
                if (img.complete) return Promise.resolve();

                return new Promise((resolve) => {
                    img.onload = resolve;
                    img.onerror = resolve;
                });
            }),
        );
    }, []);

    const handleGeneratePreview = useCallback(async () => {
        if (submitting) return null;
        if (!pageRef?.current) {
            toast.error('Không tìm thấy vùng preview CV');
            return null;
        }

        try {
            setSubmitting(true);

            if (document.fonts?.ready) {
                await document.fonts.ready;
            }

            await waitForImages(pageRef.current);

            const blob = await toBlob(pageRef.current, {
                cacheBust: true,
                pixelRatio: 2,
                backgroundColor: '#ffffff',
            });

            if (!blob) {
                throw new Error('Không tạo được ảnh preview');
            }

            const localUrl = URL.createObjectURL(blob);
            setPreviewImage((prev) => {
                if (prev) {
                    URL.revokeObjectURL(prev);
                }
                return localUrl;
            });

            console.log('Preview image URL:', localUrl);
            toast.success('Chụp preview thành công');
            return { blob, localUrl };
        } catch (error) {
            console.error(error);
            toast.error(error?.message || 'Lỗi chụp preview');
            return null;
        } finally {
            setSubmitting(false);
        }
    }, [submitting, waitForImages]);

    const handleDownloadPdf = useCallback(() => {
        if (!pageRef?.current) {
            toast.error('Không tìm thấy vùng preview CV');
            return;
        }

        const htmlText = pageRef.current?.outerHTML;

        const getAllCssText = () => {
            let cssText = '';

            for (const sheet of Array.from(document.styleSheets)) {
                try {
                    const rules = Array.from(sheet.cssRules || []);
                    cssText += rules.map((rule) => rule.cssText).join('\n');
                } catch (error) {
                    console.warn('Cannot read stylesheet', sheet.href, error);
                }
            }

            return cssText;
        };

        const cssText = getAllCssText();

        return { htmlText, cssText };
    }, []);

    const handleResetData = useCallback(() => {
        if (!window.confirm('Bạn có chắc muốn reset toàn bộ dữ liệu CV không?'))
            return;

        if (!originalData) {
            toast.error('Không có dữ liệu gốc để reset');
            return;
        }

        // setCvData(cloneDeep(originalData));
        setDirtyFields({});
        toast.success('Đã reset về dữ liệu ban đầu');
    }, [originalData]);

    useEffect(() => {
        if (!isDirty) return;

        const handleBeforeUnload = (event) => {
            event.preventDefault();
            event.returnValue = '';
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () =>
            window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isDirty]);

    useEffect(() => {
        return () => {
            if (previewImage) {
                URL.revokeObjectURL(previewImage);
            }
        };
    }, [previewImage]);

    return {
        cvData,
        dirtyFields,
        fileMap,
        handleChangeArrayField,
        handleChangeConfig,
        handleChangeCvName,
        handleChangeField,
        handleChangeObjectInArray,
        handleDownloadPdf,
        handleGeneratePreview,
        handleRemoveSection,
        handleResetData,
        isDirty,
        markDirtyField,
        originalData,
        pageRef,
        resumeData,
        setSubmitting,
        submitting,
        syncPersistedData,
    };
}

export default useCvEditorState;
