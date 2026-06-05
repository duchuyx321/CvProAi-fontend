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
import {
    applyRewriteProposals,
    rejectedRewriteProposals,
} from '~/services/aiAnalysis.service';
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

const getProposalId = (proposal = {}) =>
    String(proposal?.id ?? proposal?.proposal_id ?? proposal?.proposalId ?? '');

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
    const [aiRewriteLoading, setAiRewriteLoading] = useState(false);
    const [aiRewriteError, setAiRewriteError] = useState('');
    const [actionLoadingId, setActionLoadingId] = useState('');
    const [applyingAll, setApplyingAll] = useState(false);

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
                setAiRewriteError('');
            } catch (error) {
                if (!isCancelled) {
                    const message = error?.message || 'Lỗi load CV';

                    setAiRewriteResult(null);
                    setAiRewriteError(message);
                    toast.error(message);
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

    const refreshCvDetailAfterRewrite = useCallback(async () => {
        if (!slug) {
            throw new Error('Thiếu slug CV');
        }

        setAiRewriteLoading(true);

        try {
            const result = await getCvDetailBySlug({
                slug,
                rewrite,
                ai_run_id,
            });

            if (!result?.success) {
                throw new Error(getApiMessage(result, 'Không thể tải lại CV'));
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

            syncPersistedData(nextCvData);
            setAiRewriteResult(aiRewritePayload);
            setAiRewriteError('');
        } finally {
            setAiRewriteLoading(false);
        }
    }, [ai_run_id, rewrite, slug, syncPersistedData]);

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
    const isPremium =
        resolveResultTier({ ai_rewrite: aiRewriteResult }) === 'premium';

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

    const validateRewriteAction = useCallback(() => {
        if (!ai_run_id) {
            toast.error('Thiếu dữ liệu aiRun');
            return false;
        }

        if (!isPremium) {
            toast.info('Vui lòng nâng cấp Premium để áp dụng gợi ý AI.');
            return false;
        }

        if (submitting) {
            toast.info('CV đang được xử lý, vui lòng chờ trong giây lát.');
            return false;
        }

        if (isDirty) {
            toast.warning(
                'Vui lòng lưu CV trước khi xử lý gợi ý AI để tránh ghi đè dữ liệu đang sửa.',
            );
            return false;
        }

        return true;
    }, [ai_run_id, isDirty, isPremium, submitting]);

    const handleRewriteActionError = useCallback((error, fallbackMessage) => {
        const message = error?.message || fallbackMessage;

        setAiRewriteError(message);
        toast.error(message);
    }, []);

    const onApplyProposal = useCallback(
        async (proposal) => {
            const proposalId = getProposalId(proposal);

            if (!proposalId) {
                toast.error('Không tìm thấy proposal cần áp dụng.');
                return;
            }

            if (actionLoadingId || applyingAll || !validateRewriteAction()) {
                return;
            }

            setActionLoadingId(proposalId);
            setAiRewriteError('');

            try {
                const result = await applyRewriteProposals({
                    aiRunId: ai_run_id,
                    apply_all: false,
                    proposal_ids: [proposalId],
                });

                if (
                    result?.success === false ||
                    Number(result?.status) >= 400
                ) {
                    throw new Error(
                        getApiMessage(result, 'Áp dụng gợi ý AI thất bại.'),
                    );
                }

                await refreshCvDetailAfterRewrite();
                toast.success(getApiMessage(result, 'Đã áp dụng gợi ý AI.'));
            } catch (error) {
                handleRewriteActionError(error, 'Áp dụng gợi ý AI thất bại.');
            } finally {
                setActionLoadingId('');
            }
        },
        [
            actionLoadingId,
            ai_run_id,
            applyingAll,
            handleRewriteActionError,
            refreshCvDetailAfterRewrite,
            validateRewriteAction,
        ],
    );

    const onRejectProposal = useCallback(
        async (proposal) => {
            const proposalId = getProposalId(proposal);

            if (!proposalId) {
                toast.error('Không tìm thấy proposal cần bỏ qua.');
                return;
            }

            if (actionLoadingId || applyingAll || !validateRewriteAction()) {
                return;
            }

            setActionLoadingId(proposalId);
            setAiRewriteError('');

            try {
                const result = await rejectedRewriteProposals({
                    aiRunId: ai_run_id,
                    proposal_ids: [proposalId],
                });

                if (
                    result?.success === false ||
                    Number(result?.status) >= 400
                ) {
                    throw new Error(
                        getApiMessage(result, 'Bỏ qua gợi ý AI thất bại.'),
                    );
                }

                await refreshCvDetailAfterRewrite();
                toast.success(getApiMessage(result, 'Đã bỏ qua gợi ý AI.'));
            } catch (error) {
                handleRewriteActionError(error, 'Bỏ qua gợi ý AI thất bại.');
            } finally {
                setActionLoadingId('');
            }
        },
        [
            actionLoadingId,
            ai_run_id,
            applyingAll,
            handleRewriteActionError,
            refreshCvDetailAfterRewrite,
            validateRewriteAction,
        ],
    );

    const onConfirmApplyAll = useCallback(async () => {
        if (applyingAll || actionLoadingId || !validateRewriteAction()) {
            return;
        }

        const pendingProposalIds = pendingProposals
            .map((proposal) => getProposalId(proposal))
            .filter(Boolean);

        if (pendingProposalIds.length === 0) {
            toast.info('Không còn gợi ý pending để áp dụng.');
            setIsApplyAllModalOpen(false);
            return;
        }

        setApplyingAll(true);
        setAiRewriteError('');

        try {
            const result = await applyRewriteProposals({
                aiRunId: ai_run_id,
                apply_all: true,
                proposal_ids: pendingProposalIds,
            });

            if (result?.success === false || Number(result?.status) >= 400) {
                throw new Error(
                    getApiMessage(result, 'Áp dụng tất cả gợi ý AI thất bại.'),
                );
            }

            await refreshCvDetailAfterRewrite();
            setIsApplyAllModalOpen(false);
            toast.success(getApiMessage(result, 'Đã áp dụng tất cả gợi ý AI.'));
        } catch (error) {
            handleRewriteActionError(
                error,
                'Áp dụng tất cả gợi ý AI thất bại.',
            );
        } finally {
            setApplyingAll(false);
        }
    }, [
        actionLoadingId,
        ai_run_id,
        applyingAll,
        handleRewriteActionError,
        pendingProposals,
        refreshCvDetailAfterRewrite,
        validateRewriteAction,
    ]);

    const handleRefreshAiRewrite = useCallback(async () => {
        try {
            await refreshCvDetailAfterRewrite();
            toast.success('Đã tải lại gợi ý AI.');
        } catch (error) {
            handleRewriteActionError(error, 'Tải lại gợi ý AI thất bại.');
        }
    }, [handleRewriteActionError, refreshCvDetailAfterRewrite]);

    const aiRewrite = useMemo(() => {
        if (!isAiRewriteActive) return null;

        return {
            isActive: true,
            isPremium,
            isPanelOpen: isAiPanelOpen,
            loading: aiRewriteLoading,
            errorMessage: aiRewriteError,
            proposals: rewriteProposals,
            pendingCount: pendingProposals.length,
            sectionCounts,
            activeSectionFilter,
            activeSeverityFilter,
            actionLoadingId,
            applyingAll,
            applyAllSummary,
            isApplyAllModalOpen,
            activeSectionKey: activeSectionFilter,
            onApplyProposal,
            onRejectProposal,
            onViewProposal: handleViewProposal,
            onApplyAllClick: () => setIsApplyAllModalOpen(true),
            onConfirmApplyAll,
            onCloseApplyAllModal: () => setIsApplyAllModalOpen(false),
            onChangeSectionFilter: setActiveSectionFilter,
            onChangeSeverityFilter: setActiveSeverityFilter,
            onRefresh: handleRefreshAiRewrite,
            onTogglePanel: () => setIsAiPanelOpen((prev) => !prev),
            onSelectSection: handleSelectAiSection,
            onUpgrade: () =>
                navigate(
                    config.router.upgradePremium ||
                        config.router.upgradeAccount,
                ),
        };
    }, [
        activeSectionFilter,
        activeSeverityFilter,
        actionLoadingId,
        aiRewriteError,
        aiRewriteLoading,
        applyingAll,
        applyAllSummary,
        handleRefreshAiRewrite,
        handleSelectAiSection,
        handleViewProposal,
        isAiPanelOpen,
        isAiRewriteActive,
        isApplyAllModalOpen,
        isPremium,
        navigate,
        onApplyProposal,
        onConfirmApplyAll,
        onRejectProposal,
        pendingProposals.length,
        rewriteProposals,
        sectionCounts,
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
            } catch (error) {
                throw new Error(error?.message || 'Lỗi lưu CV');
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

        const updateCvPromise = submitUpdateCv(currentName);
        await toast.promise(updateCvPromise, {
            pending: 'Đang lưu cv...',
            success: {
                render() {
                    return 'Lưu Cv Thành Công.';
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
