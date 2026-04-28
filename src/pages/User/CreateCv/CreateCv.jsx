import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

import CvEditor from '~/pages/User/CvEditor';
import { config } from '~/config';
import {
    buildCreateCvFormData,
    createCv,
    getCvTemplateDetail,
} from '~/services/cv-teamplate.service';
import { normalizeTemplateToCreateCv } from '~/utils/cv-editor.bootstrap';
import { validateTemplateConfig } from '~/utils/cv-section.schema';
import { buildCreateSubmitPreview } from '~/utils/cv-submit-preview.utils';
import { getApiMessage, unwrapApiResponse } from '~/utils/api-response.utils';
import { captureCvPreviewFile } from '~/utils/cv-capture.utils';
import useCvEditorState from '../CvEditor/hooks/useCvEditorState';

function CreateCv() {
    const { code } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [isNameModalOpen, setIsNameModalOpen] = useState(false);
    const [cvNameDraft, setCvNameDraft] = useState('');

    const {
        cvData,
        fileMap,
        handleChangeArrayField,
        handleChangeConfig,
        handleChangeCvName,
        handleChangeField,
        handleChangeObjectInArray,
        // handleDownloadPdf,
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
    } = useCvEditorState();

    useEffect(() => {
        let isCancelled = false;

        const fetchCreateTemplate = async () => {
            try {
                setLoading(true);

                const result = await getCvTemplateDetail(code);

                if (!result?.success) {
                    throw new Error(getApiMessage(result, 'Không thể tải CV'));
                }

                const template = unwrapApiResponse(result);
                const nextCvData = normalizeTemplateToCreateCv(template);
                const validation = validateTemplateConfig(nextCvData?.config);

                if (!validation?.isValid) {
                    throw new Error(
                        validation?.message || 'Cấu hình CV không hợp lệ',
                    );
                }

                if (isCancelled) return;

                syncPersistedData(nextCvData);
                setCvNameDraft('');
            } catch (error) {
                if (!isCancelled) {
                    toast.error(error?.message || 'Lỗi load CV');
                }
            } finally {
                if (!isCancelled) {
                    setLoading(false);
                }
            }
        };

        if (!code) {
            toast.error('Thiếu mã template để tạo CV');
            navigate(config.router.cvSample, { replace: true });

            return undefined;
        }

        fetchCreateTemplate();

        return () => {
            isCancelled = true;
        };
    }, [code, navigate, syncPersistedData]);

    const submitCreateCv = useCallback(
        async (finalCvName) => {
            const trimmedName = (finalCvName || '').trim();

            if (!trimmedName) {
                toast.error('Vui lòng nhập tên CV');
                return;
            }

            setSubmitting(true);

            try {
                const preview = buildCreateSubmitPreview({
                    originalData,
                    currentData: {
                        ...cvData,
                        name: trimmedName,
                        title: trimmedName,
                    },
                    finalCvName: trimmedName,
                });

                const avatarFile =
                    fileMap['content.profile_header.avatar_url'] || null;

                const previewFile = await captureCvPreviewFile(
                    pageRef?.current,
                    trimmedName,
                );
                const formData = buildCreateCvFormData({
                    payload: preview.payload,
                    avatarFile,
                    previewFile,
                });
                const response = await createCv(formData);

                if (!response?.success) {
                    throw new Error(
                        response?.message ||
                            'Tạo CV thất bại, vui lòng thử lại',
                    );
                }

                toast.success('Tạo CV thành công');

                navigate(
                    config.router.editCv.replace(':slug', response?.data?.slug),
                    {
                        replace: true,
                    },
                );
            } catch (error) {
                console.log(error);
                toast.error(error?.message || 'Lỗi lưu CV');
            } finally {
                setSubmitting(false);
            }
        },
        [cvData, fileMap, originalData, pageRef, setSubmitting, navigate],
    );

    const handleSaveCv = useCallback(async () => {
        if (submitting) return;

        if (!isDirty) {
            toast.info('Bạn chưa thay đổi nội dung CV');
            return;
        }

        const currentName = (cvData?.name || '').trim();

        if (!currentName) {
            setCvNameDraft(cvData?.name || '');
            setIsNameModalOpen(true);
            return;
        }

        await submitCreateCv(currentName);
    }, [cvData?.name, isDirty, submitCreateCv, submitting]);

    const handleCloseNameModal = useCallback(() => {
        if (submitting) return;

        setCvNameDraft(cvData?.name || '');
        setIsNameModalOpen(false);
    }, [cvData?.name, submitting]);

    const handleConfirmCvName = useCallback(async () => {
        const trimmedName = cvNameDraft.trim();

        if (!trimmedName) {
            toast.error('Vui lòng nhập tên CV');
            return;
        }

        markDirtyField('name');
        handleChangeCvName(trimmedName);
        setIsNameModalOpen(false);

        await submitCreateCv(trimmedName);
    }, [cvNameDraft, handleChangeCvName, markDirtyField, submitCreateCv]);

    return (
        <CvEditor
            loading={loading}
            submitting={submitting}
            cvData={cvData}
            resumeData={resumeData}
            isDirty={isDirty}
            canDownloadPdf={false}
            onChangeField={handleChangeField}
            onChangeArrayField={handleChangeArrayField}
            onChangeObjectInArray={handleChangeObjectInArray}
            onRemoveSection={handleRemoveSection}
            onChangeConfig={handleChangeConfig}
            onResetData={handleResetData}
            onSaveCv={handleSaveCv}
            onDownloadPdf={() =>
                toast.warn('Vui lòng lưu cv trước khi xuất file')
            }
            onGeneratePreview={handleGeneratePreview}
            onChangeCvName={handleChangeCvName}
            pageRef={pageRef}
            namePrompt={{
                isOpen: isNameModalOpen,
                onClose: handleCloseNameModal,
                onConfirm: handleConfirmCvName,
                onChange: (valueOrEvent) =>
                    setCvNameDraft(
                        valueOrEvent?.target?.value ?? valueOrEvent ?? '',
                    ),
                value: cvNameDraft,
            }}
        />
    );
}

export default CreateCv;
