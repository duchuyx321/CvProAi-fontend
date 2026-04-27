import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

import CvEditor from '~/pages/User/CvEditor';
import { config } from '~/config';
import {
    buildUpdateCvFormData,
    downloadCvPdfBySlug,
    getCvDetailBySlug,
    updateCvBySlug,
} from '~/services/cv-teamplate.service';
import { normalizeCvDetailForEditor } from '~/utils/cv-editor.bootstrap';
import { validateTemplateConfig } from '~/utils/cv-section.schema';
import { buildEditSubmitPreview } from '~/utils/cv-submit-preview.utils';
import { getApiMessage, unwrapApiResponse } from '~/utils/api-response.utils';
import { captureCvPreviewFile } from '~/utils/cv-capture.utils';

import useCvEditorState from '../CvEditor/hooks/useCvEditorState';

function EditCv() {
    const { slug } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);

    const {
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

                const avatarFile =
                    fileMap['content.profile_header.avatar_url'] || null;

                const previewFile = await captureCvPreviewFile(
                    pageRef?.current,
                    trimmedName,
                );

                const formData = buildUpdateCvFormData({
                    payload: preview.payload,
                    avatarFile,
                    previewFile,
                });

                const response = await updateCvBySlug(cvData?.id, formData);

                if (!response?.success) {
                    throw new Error(
                        response?.message ||
                            'Cập nhật CV thất bại, vui lòng thử lại',
                    );
                }

                syncPersistedData(nextCvData);
                toast.success('Cập nhật CV thành công.');
            } catch (error) {
                toast.error(error?.message || 'Lỗi lưu CV');
            } finally {
                setSubmitting(false);
            }
        },
        [
            cvData,
            dirtyFields,
            fileMap,
            originalData,
            pageRef,
            setSubmitting,
            syncPersistedData,
        ],
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

    const handeDownloadPdfClick = async () => {
        const { htmlText, cssText } = handleDownloadPdf();
        const exportPromise = fetchApi(htmlText, cssText);
        await toast.promise(exportPromise, {
            pending: 'Đang tải xuống...',
            success: {
                render() {
                    return 'Tải xuống thành công.';
                },
            },
            error: {
                render({ data }) {
                    return (
                        data?.message ||
                        'Hệ thống đang xảy ra lỗi vui lòng thử lại sau giây lát.'
                    );
                },
            },
        });
    };
    const fetchApi = async (htmlText, cssText) => {
        const result = await downloadCvPdfBySlug(cvData.id, htmlText, cssText);
        if (!result?.success) {
            throw new Error(
                result?.message ||
                    'Hệ thống đang xảy ra lỗi vui lòng thử lại sau giây lát.',
            );
        }

        console.log({ result });
        const buffers = result?.data?.stream?._readableState?.buffer || [];
        if (!Array.isArray(buffers) || buffers.length === 0) {
            throw new Error(
                'Hệ thống đang xảy ra lỗi vui lòng thử lại sau giây lát.',
            );
        }
        const uint8Arrays = buffers.map((item) => {
            return new Uint8Array(item.data);
        });

        const blob = new Blob(uint8Arrays, {
            type: 'application/pdf',
        });

        const url = window.URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `${cvData?.title || 'cv'}.pdf`;

        document.body.appendChild(link);
        link.click();

        link.remove();
        window.URL.revokeObjectURL(url);

        return true;
    };

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
            onDownloadPdf={handeDownloadPdfClick}
            onGeneratePreview={handleGeneratePreview}
            onChangeCvName={handleChangeCvName}
            pageRef={pageRef}
        />
    );
}

export default EditCv;
