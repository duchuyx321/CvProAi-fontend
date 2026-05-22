import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
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
import {
    buildApplyAllSummary,
    countPendingProposalsBySection,
    extractRewriteProposals,
    getPendingRewriteProposals,
    normalizeRewriteSectionKey,
    resolveResultTier,
} from '~/utils/ai-rewrite.utils';

import useCvEditorState from '../CvEditor/hooks/useCvEditorState';

function EditCv() {
    const { slug } = useParams();
    const [searchParams] = useSearchParams();

    const rewrite = searchParams.get('rewrite') === 'true';
    const ai_run_id = searchParams.get('ai_run_id');
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [aiRewriteResult, setAiRewriteResult] = useState(null);
    const [isAiPanelOpen, setIsAiPanelOpen] = useState(true);
    const [activeSectionFilter, setActiveSectionFilter] = useState('all');
    const [activeSeverityFilter, setActiveSeverityFilter] = useState('all');
    const [isApplyAllModalOpen, setIsApplyAllModalOpen] = useState(false);

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

                const result = await getCvDetailBySlug({
                    slug,
                    rewrite,
                    ai_run_id,
                });

                if (!result?.success) {
                    throw new Error(getApiMessage(result, 'Không thể tải CV'));
                }

                const payload = unwrapApiResponse(result);
                const cv = payload?.cv || payload;
                const aiRewritePayload =
                    rewrite && ai_run_id ? payload?.ai_rewrite || null : null;
                const nextCvData = normalizeCvDetailForEditor(cv);
                const validation = validateTemplateConfig(nextCvData?.config);

                if (!validation?.isValid) {
                    throw new Error(
                        validation?.message || 'Cấu hình CV không hợp lệ',
                    );
                }

                if (isCancelled) return;

                syncPersistedData(nextCvData);
                setAiRewriteResult(aiRewritePayload);
            } catch (error) {
                if (!isCancelled) {
                    setAiRewriteResult(null);
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
    }, [ai_run_id, navigate, rewrite, slug, syncPersistedData]);

    const rewriteProposals = useMemo(
        () => extractRewriteProposals(aiRewriteResult),
        [aiRewriteResult],
    );
    const pendingProposals = useMemo(
        () => getPendingRewriteProposals(rewriteProposals),
        [rewriteProposals],
    );
    const sectionCounts = useMemo(
        () => countPendingProposalsBySection(rewriteProposals),
        [rewriteProposals],
    );
    const applyAllSummary = useMemo(
        () => buildApplyAllSummary(rewriteProposals),
        [rewriteProposals],
    );
    const isAiRewriteActive = Boolean(
        rewrite && ai_run_id && aiRewriteResult?.is_active,
    );
    const isPremium = resolveResultTier({ ai_rewrite: aiRewriteResult }) === 'premium';

    const handleViewProposal = useCallback((proposal) => {
        setActiveSectionFilter(
            normalizeRewriteSectionKey(proposal?.targetSection) || 'all',
        );
        setActiveSeverityFilter(proposal?.severity || 'all');
        setIsAiPanelOpen(true);
    }, []);

    const handleSelectAiSection = useCallback((sectionKey) => {
        setActiveSectionFilter(normalizeRewriteSectionKey(sectionKey) || 'all');
        setIsAiPanelOpen(true);
    }, []);

    const showApplyTodo = useCallback(() => {
        toast.info('Đã xác định đúng proposal. Phần apply sẽ nối API sau.');
    }, []);

    const aiRewrite = useMemo(() => {
        if (!isAiRewriteActive) return null;

        return {
            isActive: true,
            isPremium,
            isPanelOpen: isAiPanelOpen,
            loading: false,
            errorMessage: '',
            proposals: rewriteProposals,
            pendingCount: pendingProposals.length,
            sectionCounts,
            activeSectionFilter,
            activeSeverityFilter,
            actionLoadingId: '',
            applyingAll: false,
            applyAllSummary,
            isApplyAllModalOpen,
            activeSectionKey: activeSectionFilter,
            onApplyProposal: showApplyTodo,
            onRejectProposal: showApplyTodo,
            onViewProposal: handleViewProposal,
            onApplyAllClick: () => setIsApplyAllModalOpen(true),
            onConfirmApplyAll: () => {
                setIsApplyAllModalOpen(false);
                showApplyTodo();
            },
            onCloseApplyAllModal: () => setIsApplyAllModalOpen(false),
            onChangeSectionFilter: setActiveSectionFilter,
            onChangeSeverityFilter: setActiveSeverityFilter,
            onRefresh: () => window.location.reload(),
            onTogglePanel: () => setIsAiPanelOpen((prev) => !prev),
            onSelectSection: handleSelectAiSection,
            onUpgrade: () =>
                navigate(
                    config.router.upgradePremium || config.router.upgradeAccount,
                ),
        };
    }, [
        activeSectionFilter,
        activeSeverityFilter,
        applyAllSummary,
        handleSelectAiSection,
        handleViewProposal,
        isAiPanelOpen,
        isAiRewriteActive,
        isApplyAllModalOpen,
        isPremium,
        navigate,
        pendingProposals.length,
        rewriteProposals,
        sectionCounts,
        showApplyTodo,
    ]);

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
            aiRewrite={aiRewrite}
        />
    );
}

export default EditCv;
