import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import classNames from 'classnames/bind';
import { toast, ToastContainer } from 'react-toastify';
import { FiMenu } from 'react-icons/fi';
import Modal from '~/components/Modal';
import Button from '~/components/Button';
import Input from '~/components/Input';

import LeftEditor from './components/LeftEditor';
import RightPreview from './components/RightPreview';
import styles from './CvEditor.module.scss';
import { config } from '~/config';
import {
    buildEditorResumeData,
    createInitialCvState,
    getContentKey,
    isArraySection,
    normalizeSectionType,
    validateTemplateConfig,
} from '~/utils/cv-section.schema';
import { MOCK_TEMPLATE_DETAIL } from '../CvTemplateDetail/CvTemplateDetail';
import { buildPatchFromDirtyFields } from '~/utils/cv-patch.utils';


const cx = classNames.bind(styles);
const MOCK_CV_STORAGE_PREFIX = 'mock-cv:';

const buildMockCvStorageKey = (slug) => `${MOCK_CV_STORAGE_PREFIX}${slug}`;

const cloneDeep = (value) => structuredClone(value);

const getMockCvBySlug = (slug) => {
    if (!slug) return null;
    try {
        const raw = localStorage.getItem(buildMockCvStorageKey(slug));
        return raw ? JSON.parse(raw) : null;
    } catch (error) {
        console.error('Lỗi khi lấy mock CV từ localStorage', error);
        return null;
    }
};

const saveMockCvBySlug = (slug, data) => {
    if (!slug) return;
    localStorage.setItem(buildMockCvStorageKey(slug), JSON.stringify(data));
};

const generateCvSlug = (name = '') => {
    const normalized = name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
    return `cv-templates-${normalized || 'untitled'}-${Date.now()}`;
};

function CvEditor() {
    const { code, slug } = useParams();
    const navigate = useNavigate();

    const isCreateMode = Boolean(code) && !slug;
    const isEditMode = Boolean(slug) && !code;
    const canDownloadPdf = isEditMode && Boolean(slug);

    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true);
    const [cvData, setCvData] = useState(createInitialCvState);

    const [isNameModalOpen, setIsNameModalOpen] = useState(false);
    const [cvNameDraft, setCvNameDraft] = useState('');
    const [originalData, setOriginalData] = useState(null);
    const [dirtyFields, setDirtyFields] = useState({});

    const isDirty = useMemo(() => Object.keys(dirtyFields).length > 0, [dirtyFields]);

    const markDirtyField = useCallback((path) => {
        if (!path) return;
        setDirtyFields((prev) => ({ ...prev, [path]: true }));
    }, []);

    useEffect(() => {
        const fetchCvDetail = async () => {
            try {
                setLoading(true);
                let result;

                if (isEditMode) {
                    const parsedMockCv = getMockCvBySlug(slug);
                    result = {
                        ...MOCK_TEMPLATE_DETAIL,
                        data: parsedMockCv || { ...MOCK_TEMPLATE_DETAIL.data, slug },
                    };
                } else if (isCreateMode) {
                    result = {
                        ...MOCK_TEMPLATE_DETAIL,
                        data: { ...MOCK_TEMPLATE_DETAIL.data, code },
                    };
                } else {
                    throw new Error('Thiếu code hoặc slug để xác định CV');
                }

                if (!result?.success) {
                    throw new Error(result?.message || 'Không thể tải CV');
                }

                const nextCvData = result?.data || createInitialCvState();
                const validation = validateTemplateConfig(nextCvData?.config);

                if (!validation?.isValid) {
                    throw new Error(validation?.message || 'Cấu hình CV không hợp lệ');
                }

                setCvData(nextCvData);
                setOriginalData(cloneDeep(nextCvData));
                setDirtyFields({});
            } catch (error) {
                toast.error(error?.message || 'Lỗi load CV');
            } finally {
                setLoading(false);
            }
        };

        fetchCvDetail();
    }, [code, slug, isCreateMode, isEditMode]);

    useEffect(() => {
        if (!isDirty) return;

        const handleBeforeUnload = (event) => {
            event.preventDefault();
            event.returnValue = '';
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isDirty]);

    const resumeData = useMemo(() => buildEditorResumeData(cvData), [cvData]);

    const updateContentKey = useCallback((contentKey, updater) => {
        setCvData((prev) => {
            const prevContent = prev?.content || {};
            const prevValue = prevContent[contentKey];
            const nextValue = typeof updater === 'function' ? updater(prevValue) : updater;

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

    const handleChangeField = useCallback((sectionKey, field, value) => {
        const sectionConfig = cvData?.config?.sections?.[sectionKey] || {};
        const normalizedType = normalizeSectionType(sectionKey, sectionConfig);
        const contentKey = getContentKey(sectionKey, sectionConfig);

        if (normalizedType === 'summary') {
            markDirtyField(`content.${contentKey}`);
            updateContentKey(contentKey, typeof value === 'string' ? value : value?.summary || '');
            return;
        }

        markDirtyField(`content.${contentKey}.${field}`);
        updateContentKey(contentKey, (prevValue = {}) => ({ ...prevValue, [field]: value }));
    }, [cvData?.config?.sections, markDirtyField, updateContentKey]);

    const handleChangeArrayField = useCallback((sectionKey, nextValue) => {
        const sectionConfig = cvData?.config?.sections?.[sectionKey] || {};
        const contentKey = getContentKey(sectionKey, sectionConfig);

        markDirtyField(`content.${contentKey}`);
        updateContentKey(contentKey, Array.isArray(nextValue) ? nextValue : []);
    }, [cvData?.config?.sections, markDirtyField, updateContentKey]);

    const handleChangeObjectInArray = useCallback((sectionKey, index, key, value) => {
        const sectionConfig = cvData?.config?.sections?.[sectionKey] || {};
        const contentKey = getContentKey(sectionKey, sectionConfig);

        markDirtyField(`content.${contentKey}`);
        updateContentKey(contentKey, (prevValue) => {
            const currentList = Array.isArray(prevValue) ? prevValue : [];
            const nextList = [...currentList];
            nextList[index] = { ...(nextList[index] || {}), [key]: value };
            return nextList;
        });
    }, [cvData?.config?.sections, markDirtyField, updateContentKey]);

    const handleChangeConfig = useCallback((nextConfig) => {
        markDirtyField('config');
        setCvData((prev) => ({ ...prev, config: nextConfig }));
    }, [markDirtyField]);

    const handleChangeCvName = useCallback((value) => {
        markDirtyField('name');
        setCvData((prev) => ({ ...prev, name: value }));
    }, [markDirtyField]);

    const handleRemoveSection = useCallback((sectionKey) => {
        const sectionConfig = cvData?.config?.sections?.[sectionKey] || {};
        const normalizedType = normalizeSectionType(sectionKey, sectionConfig);
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
    }, [cvData?.config?.sections, markDirtyField, updateContentKey]);


    const submitSaveCv = useCallback(async (finalCvName) => {
        const trimmedName = (finalCvName || '').trim();

        if (!trimmedName) {
            toast.error('Vui lòng nhập tên CV');
            return;
        }

        setSubmitting(true);

        try {
            const nextSlug = cvData?.slug || generateCvSlug(trimmedName);
            const payload = { ...cvData, name: trimmedName, slug: nextSlug };

            const patchPayload = buildPatchFromDirtyFields(originalData, payload, dirtyFields);

            if (!patchPayload || Object.keys(patchPayload).length === 0) {
                toast.info('Bạn chưa thay đổi nội dung CV');
                return;
            }

            console.log('>>> patchPayload gui backend:', patchPayload);

            // Khi nối API thật
            // if (isEditMode) {
            //     await updateCvBySlug(nextSlug, patchPayload);
            // } else {
            //     await createCv(payload);
            // }

            await new Promise((resolve) => setTimeout(resolve, 300));

            saveMockCvBySlug(nextSlug, payload);
            setCvData(payload);
            setOriginalData(cloneDeep(payload));
            setDirtyFields({});

            if (isEditMode) {
                toast.success('Cập nhật CV thành công (mock)');
                return;
            }

            toast.success('Tạo CV thành công (mock)');
            navigate(config.router.editCv.replace(':slug', nextSlug), { replace: true });
        } catch (error) {
            toast.error(error?.message || 'Lỗi lưu CV');
        } finally {
            setSubmitting(false);
        }
    }, [cvData, originalData, dirtyFields, isEditMode, navigate]);


    const handleSaveCv = useCallback(async () => {
        if (submitting) return;

        if (!isDirty) {
            toast.info('Bạn chưa thay đổi nội dung CV');
            return;
        }

        const currentName = (cvData?.name || '').trim();

        if (!currentName) {
            if (isCreateMode) {
                setCvNameDraft(cvData?.name || '');
                setIsNameModalOpen(true);
            } else {
                toast.error('Vui lòng nhập tên CV');
            }
            return;
        }

        await submitSaveCv(currentName);
    }, [submitting, isDirty, cvData?.name, isCreateMode, submitSaveCv]);

    const handleCloseNameModal = useCallback(() => {
        if (submitting) return;
        setCvNameDraft(cvData?.name || '');
        setIsNameModalOpen(false);
    }, [submitting, cvData?.name]);

    const handleConfirmCvName = useCallback(async () => {
        const trimmedName = cvNameDraft.trim();

        if (!trimmedName) {
            toast.error('Vui lòng nhập tên CV');
            return;
        }

        markDirtyField('name');
        setCvData((prev) => ({ ...prev, name: trimmedName }));
        setIsNameModalOpen(false);
        await submitSaveCv(trimmedName);
    }, [cvNameDraft, markDirtyField, submitSaveCv]);

    const handleDownloadPdf = useCallback(async () => {
        toast.info('Chức năng tải PDF đang dùng mock, tạm thời chưa khả dụng');
    }, []);

    const handleResetData = useCallback(() => {
        if (!window.confirm('Bạn có chắc muốn reset toàn bộ dữ liệu CV không?')) return;

        if (!originalData) {
            toast.error('Không có dữ liệu gốc để reset');
            return;
        }
        setCvData(cloneDeep(originalData));
        setDirtyFields({});
        toast.success('Đã reset về dữ liệu ban đầu');
    }, [originalData]);

    if (loading) {
        return (
            <section className={cx('wrapper')}>
                <div className={cx('loading')}>
                    <p>Đang tải dữ liệu CV...</p>
                </div>
            </section>
        );
    }

    return (
        <>
            <ToastContainer position="top-right" autoClose={2500} />

            <section className={cx('wrapper')}>
                <div className={cx('inner')}>
                    {!isLeftPanelOpen && (
                        <button
                            type="button"
                            className={cx('open-panel-btn')}
                            onClick={() => setIsLeftPanelOpen(true)}
                        >
                            <FiMenu />
                        </button>
                    )}

                    <LeftEditor
                        isOpen={isLeftPanelOpen}
                        onTogglePanel={() => setIsLeftPanelOpen(false)}
                        resumeData={resumeData}
                        onChangeField={handleChangeField}
                        onChangeArrayField={handleChangeArrayField}
                        onChangeObjectInArray={handleChangeObjectInArray}
                        onRemoveSection={handleRemoveSection}
                        onChangeConfig={handleChangeConfig}
                        templateConfig={cvData?.config || {}}
                        onResetData={handleResetData}
                        onSaveCv={handleSaveCv}
                        onDownloadPdf={handleDownloadPdf}
                        canDownloadPdf={canDownloadPdf}
                        submitting={submitting}
                        cvName={cvData?.name || ''}
                        onChangeCvName={handleChangeCvName}
                        isDirty={isDirty}
                        canSave={isDirty && !submitting}
                    />

                    <RightPreview templateDetail={cvData} />
                </div>
            </section>

            <Modal
                isOpen={isNameModalOpen}
                onClose={handleCloseNameModal}
                title="Đặt tên cho CV của bạn"
                description="Việc đặt tên cho CV sẽ khiến việc quản lý CV trở nên dễ dàng hơn."
                size="md"
                closeOnOverlayClick={!submitting}
                closeOnEsc={!submitting}
                footer={
                    <Button
                        primary
                        type="button"
                        className={cx('modalPrimaryBtn')}
                        onClick={handleConfirmCvName}
                        disabled={submitting}
                    >
                        Tiếp tục
                    </Button>
                }
            >
                <div className={cx('saveNameModalBody')}>
                    <Input
                        type="text"
                        className={cx('saveNameInput')}
                        value={cvNameDraft}
                        onChange={(valueOrEvent) =>
                            setCvNameDraft(valueOrEvent?.target?.value ?? valueOrEvent ?? '')
                        }
                        placeholder="Ví dụ: CV Nhân viên kinh doanh"
                        maxLength={120}
                        autoFocus
                    />
                </div>
            </Modal>
        </>
    );
}

export default CvEditor;