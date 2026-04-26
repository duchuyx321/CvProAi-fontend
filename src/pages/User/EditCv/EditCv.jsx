import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

import CvEditor from '~/pages/User/CvEditor';
import { config } from '~/config';
import { getCvDetailBySlug } from '~/services/cv-teamplate.service';
import { normalizeCvDetailForEditor } from '~/utils/cv-editor.bootstrap';
import { validateTemplateConfig } from '~/utils/cv-section.schema';
import { buildEditSubmitPreview } from '~/utils/cv-submit-preview.utils';
import {
    getApiMessage,
    unwrapApiResponse,
} from '~/utils/api-response.utils';

import useCvEditorState from '../CvEditor/hooks/useCvEditorState';
function EditCv() {
    const { slug } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);

    const {
        cvData,
        dirtyFields,
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
        originalData,
        pageRef,
        resumeData,
        setSubmitting,
        submitting,
        syncPersistedData,
    } = useCvEditorState();

    useEffect(() => {
        let isCancelled = false;

        const fetchCvDetail = async () => {
            try {
                setLoading(true);

                const result = await getCvDetailBySlug(slug);

                if (!result?.success) {
                    throw new Error(getApiMessage(result, 'Không thể tải CV'));
                }

                const cv = unwrapApiResponse(result);
                const nextCvData = normalizeCvDetailForEditor(cv);
                const validation = validateTemplateConfig(nextCvData?.config);

                if (!validation?.isValid) {
                    throw new Error(
                        validation?.message || 'Cấu hình CV không hợp lệ',
                    );
                }

                if (isCancelled) return;

                syncPersistedData(nextCvData);
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

        if (!slug) {
            toast.error('Thiếu slug để chỉnh sửa CV');
            navigate(config.router.cvSample, { replace: true });
            return undefined;
        }

        fetchCvDetail();

        return () => {
            isCancelled = true;
        };
    }, [navigate, slug, syncPersistedData]);

    const submitUpdateCv = useCallback(
        async (finalCvName) => {
            const trimmedName = (finalCvName || '').trim();

            if (!trimmedName) {
                toast.error('Vui lòng nhập tên CV');
                return;
            }

            setSubmitting(true);

            try {
                const nextCvData = {
                    ...cvData,
                    name: trimmedName,
                    title: trimmedName,
                };

                const preview = buildEditSubmitPreview({
                    originalData,
                    currentData: nextCvData,
                    dirtyFields,
                    finalCvName: trimmedName,
                });

                if (
                    !preview.payload ||
                    Object.keys(preview.payload).length === 0
                ) {
                    toast.info('Bạn chưa thay đổi nội dung CV');
                    return;
                }

                console.log(preview.payload);
                syncPersistedData(nextCvData);
                toast.success('Cập nhật CV thành công.');
            } catch (error) {
                toast.error(error?.message || 'Lỗi lưu CV');
            } finally {
                setSubmitting(false);
            }
        },
        [cvData, dirtyFields, originalData, setSubmitting, syncPersistedData],
    );

    const handleSaveCv = useCallback(async () => {
        if (submitting) return;

        if (!isDirty) {
            toast.info('Bạn chưa thay đổi nội dung CV');
            return;
        }

        const currentName = (cvData?.name || '').trim();

        if (!currentName) {
            toast.error('Vui lòng nhập tên CV');
            return;
        }

        await submitUpdateCv(currentName);
    }, [cvData?.name, isDirty, submitUpdateCv, submitting]);

    return (
        <CvEditor
            loading={loading}
            submitting={submitting}
            cvData={cvData}
            resumeData={resumeData}
            isDirty={isDirty}
            canDownloadPdf={Boolean(slug)}
            onChangeField={handleChangeField}
            onChangeArrayField={handleChangeArrayField}
            onChangeObjectInArray={handleChangeObjectInArray}
            onRemoveSection={handleRemoveSection}
            onChangeConfig={handleChangeConfig}
            onResetData={handleResetData}
            onSaveCv={handleSaveCv}
            onDownloadPdf={handleDownloadPdf}
            onGeneratePreview={handleGeneratePreview}
            onChangeCvName={handleChangeCvName}
            pageRef={pageRef}
        />
    );
}

export default EditCv;
