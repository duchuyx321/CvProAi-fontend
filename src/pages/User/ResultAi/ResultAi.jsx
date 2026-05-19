import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import classNames from 'classnames/bind';
import { FiAlertCircle, FiRefreshCw, FiZap } from 'react-icons/fi';
import { toast } from 'react-toastify';

import Button from '~/components/Button';
import { config } from '~/config';
import { useAuth } from '~/context/AuthContext';
import { getAiAnalysisResultByRunId } from '~/services/aiAnalysis.service';

import { normalizeAiResult, normalizeTier } from './utils';
import {
    HeroCard,
    SummaryCard,
    StrengthSection,
    WeaknessSection,
    SuggestionSection,
    StructuredFeedbackSection,
    UpsellCard,
} from './ResultComponents';
import styles from './ResultAi.module.scss';

const cx = classNames.bind(styles);
const FREE_VISIBLE_COUNT = 2;

function ResultAiPremium() {
    const { aiRunId } = useParams();
    const location = useLocation();
    const { user } = useAuth();

    const statePayload = useMemo(() => {
        const state = location?.state ?? {};
        return (
            state.aiResult ||
            state.result ||
            state.data ||
            state.payload ||
            null
        );
    }, [location?.state]);

    const [aiResult, setAiResult] = useState(() =>
        statePayload ? normalizeAiResult(statePayload) : null,
    );
    const [loading, setLoading] = useState(
        () => Boolean(aiRunId) && !statePayload,
    );
    const [errorMessage, setErrorMessage] = useState('');

    const loadResult = useCallback(
        async (runId, { silent = false, activeRef } = {}) => {
            const isActive = () =>
                typeof activeRef === 'function' ? activeRef() : true;

            if (!runId) {
                if (!statePayload) {
                    if (isActive()) {
                        setAiResult(null);
                        setErrorMessage(
                            'Thiếu aiRunId để tải kết quả phân tích',
                        );
                        setLoading(false);
                    }
                }
                return;
            }

            if (isActive()) {
                setErrorMessage('');
                setLoading(true);
            }

            try {
                const result = await getAiAnalysisResultByRunId(runId);

                if (!isActive()) return;

                if (!result?.success) {
                    const message =
                        result?.message || 'Không thể tải kết quả phân tích';
                    setAiResult(null);
                    setErrorMessage(message);
                    if (!silent) toast.error(message);
                    return;
                }

                setAiResult(
                    normalizeAiResult(result.data.dataValues || result.data),
                );
            } catch (error) {
                if (!isActive()) return;

                const message =
                    error?.message || 'Không thể tải kết quả phân tích';
                setAiResult(null);
                setErrorMessage(message);
                if (!silent) toast.error(message);
            } finally {
                if (isActive()) {
                    setLoading(false);
                }
            }
        },
        [statePayload],
    );

    useEffect(() => {
        let active = true;

        if (aiRunId) {
            loadResult(aiRunId, {
                silent: true,
                activeRef: () => active,
            });
        } else if (statePayload) {
            setAiResult(normalizeAiResult(statePayload));
            setErrorMessage('');
            setLoading(false);
        } else {
            setAiResult(null);
            setErrorMessage('Thiếu aiRunId để tải kết quả phân tích');
            setLoading(false);
        }

        return () => {
            active = false;
        };
    }, [aiRunId, loadResult, statePayload]);

    const resolvedTier = useMemo(() => {
        const state = location?.state ?? {};
        const tierFromState =
            state?.tier ??
            state?.planTier ??
            state?.packageTier ??
            state?.userTier;

        const planCurrent = user?.planCurrent || user?.plan_current;
        const tierFromUser =
            user?.tier ??
            user?.planTier ??
            user?.packageTier ??
            planCurrent?.tier ??
            planCurrent?.name ??
            planCurrent?.id ??
            (planCurrent?.view_full_ai_analysis ? 'premium' : 'free');

        const isUserPremium = normalizeTier(tierFromUser) === 'premium';
        const isStatePremium = normalizeTier(tierFromState) === 'premium';
        const isResultPremium = normalizeTier(aiResult?.tier) === 'premium';

        return isUserPremium || isStatePremium || isResultPremium ? 'premium' : 'free';
    }, [location?.state, user, aiResult?.tier]);

    const cvId = useMemo(() => {
        const state = location?.state ?? {};
        return (
            state?.cvId ??
            state?.selectedCV?.id ??
            state?.cv?.id ??
            state?.cv?.cvId ??
            null
        );
    }, [location?.state]);

    const editCvHref = useMemo(() => {
        const editRoute =
            config?.router?.editCv || config?.router?.cvEdit || '/edit-cv';

        if (cvId != null && String(cvId).trim() !== '') {
            if (editRoute.includes(':slug')) {
                return editRoute.replace(':slug', String(cvId));
            }
            return `${editRoute}/${cvId}`;
        }

        return editRoute.replace('/:slug', '');
    }, [cvId]);

    const editCvState = useMemo(
        () => ({
            from: 'ai-analysis-result',
            aiRunId: aiRunId ?? aiResult?.aiRunId ?? null,
            aiResult,
            cvId: cvId ?? null,
        }),
        [aiRunId, aiResult, cvId],
    );

    const isPremium = resolvedTier === 'premium';
    const strengths = useMemo(
        () => aiResult?.strengths ?? [],
        [aiResult?.strengths],
    );
    const weaknesses = useMemo(
        () => aiResult?.weaknesses ?? [],
        [aiResult?.weaknesses],
    );
    const suggestions = useMemo(
        () => aiResult?.suggestions ?? [],
        [aiResult?.suggestions],
    );

    const strengthsMeta = aiResult?.strengthsMeta ?? null;
    const weaknessesMeta = aiResult?.weaknessesMeta ?? null;
    const suggestionsMeta = aiResult?.suggestionsMeta ?? null;

    const structuredFeedbackEntries = useMemo(() => {
        const structured = aiResult?.structuredFeedback;
        if (
            !structured ||
            typeof structured !== 'object' ||
            Array.isArray(structured)
        ) {
            return [];
        }
        return Object.entries(structured);
    }, [aiResult?.structuredFeedback]);

    const strengthVisibleLimit = useMemo(() => {
        if (isPremium) return strengths.length;
        return strengthsMeta?.visibleCount ?? FREE_VISIBLE_COUNT;
    }, [isPremium, strengths.length, strengthsMeta?.visibleCount]);

    const weaknessVisibleLimit = useMemo(() => {
        if (isPremium) return weaknesses.length;
        return weaknessesMeta?.visibleCount ?? FREE_VISIBLE_COUNT;
    }, [isPremium, weaknesses.length, weaknessesMeta?.visibleCount]);

    const suggestionVisibleLimit = useMemo(() => {
        if (isPremium) return suggestions.length;
        return suggestionsMeta?.visibleCount ?? FREE_VISIBLE_COUNT;
    }, [isPremium, suggestions.length, suggestionsMeta?.visibleCount]);

    const visibleStrengths = useMemo(
        () => strengths.slice(0, Math.max(0, strengthVisibleLimit)),
        [strengths, strengthVisibleLimit],
    );

    const visibleWeaknesses = useMemo(
        () => weaknesses.slice(0, Math.max(0, weaknessVisibleLimit)),
        [weaknesses, weaknessVisibleLimit],
    );

    const visibleSuggestions = useMemo(
        () => suggestions.slice(0, Math.max(0, suggestionVisibleLimit)),
        [suggestions, suggestionVisibleLimit],
    );

    const visibleStructuredFeedback = useMemo(
        () =>
            isPremium
                ? structuredFeedbackEntries
                : structuredFeedbackEntries.slice(0, FREE_VISIBLE_COUNT),
        [isPremium, structuredFeedbackEntries],
    );

    const totalStrengthCount = strengthsMeta?.totalCount ?? strengths.length;
    const totalWeaknessCount = weaknessesMeta?.totalCount ?? weaknesses.length;
    const totalSuggestionCount =
        suggestionsMeta?.totalCount ?? suggestions.length;

    const hiddenStrengthCount = isPremium
        ? 0
        : Math.max(
              strengthsMeta?.hiddenCount ??
                  totalStrengthCount - visibleStrengths.length,
              0,
          );

    const hiddenWeaknessCount = isPremium
        ? 0
        : Math.max(
              weaknessesMeta?.hiddenCount ??
                  totalWeaknessCount - visibleWeaknesses.length,
              0,
          );

    const hiddenSuggestionCount = isPremium
        ? 0
        : Math.max(
              suggestionsMeta?.hiddenCount ??
                  totalSuggestionCount - visibleSuggestions.length,
              0,
          );

    const hiddenStructuredCount = Math.max(
        structuredFeedbackEntries.length - visibleStructuredFeedback.length,
        0,
    );

    const hiddenInsightCount =
        hiddenStrengthCount +
        hiddenWeaknessCount +
        hiddenSuggestionCount +
        hiddenStructuredCount;

    return (
        <div className={cx('wrapper')}>
            <div className={cx('pageShell')}>
                <HeroCard isPremium={isPremium} aiResult={aiResult} />

                {errorMessage ? (
                    <div className={cx('errorCard')}>
                        <div className={cx('errorIcon')}>
                            <FiAlertCircle />
                        </div>
                        <div className={cx('errorBody')}>
                            <div className={cx('errorTitle')}>
                                Không thể tải kết quả
                            </div>
                            <div className={cx('errorText')}>
                                {errorMessage}
                            </div>
                        </div>
                        <button
                            type="button"
                            className={cx('ghostBtn')}
                            onClick={() => loadResult(aiRunId)}
                        >
                            <FiRefreshCw />
                            <span>Thử lại</span>
                        </button>
                    </div>
                ) : null}

                {loading ? (
                    <div className={cx('grid')}>
                        <div className={cx('card', 'skeleton', 'wide')} />
                        <div className={cx('card', 'skeleton')} />
                        <div className={cx('card', 'skeleton')} />
                    </div>
                ) : aiResult ? (
                    <div className={cx('grid')}>
                        <SummaryCard aiResult={aiResult} />

                        <StrengthSection
                            visibleStrengths={visibleStrengths}
                            totalStrengthCount={totalStrengthCount}
                            hiddenStrengthCount={hiddenStrengthCount}
                            isPremium={isPremium}
                        />

                        <WeaknessSection
                            visibleWeaknesses={visibleWeaknesses}
                            totalWeaknessCount={totalWeaknessCount}
                            hiddenWeaknessCount={hiddenWeaknessCount}
                            isPremium={isPremium}
                        />

                        <SuggestionSection
                            visibleSuggestions={visibleSuggestions}
                            totalSuggestionCount={totalSuggestionCount}
                            hiddenSuggestionCount={hiddenSuggestionCount}
                            isPremium={isPremium}
                        />

                        <StructuredFeedbackSection
                            visibleStructuredFeedback={visibleStructuredFeedback}
                            structuredFeedbackEntries={structuredFeedbackEntries}
                            hiddenStructuredCount={hiddenStructuredCount}
                            isPremium={isPremium}
                        />

                        {!isPremium ? (
                            <UpsellCard hiddenInsightCount={hiddenInsightCount} />
                        ) : null}
                    </div>
                ) : (
                    <div className={cx('emptyCard')}>
                        <div className={cx('emptyIcon')}>
                            <FiAlertCircle />
                        </div>
                        <div>
                            <h3 className={cx('emptyTitle')}>
                                Chưa có dữ liệu kết quả
                            </h3>
                            <p className={cx('emptyText')}>
                                Hãy thực hiện phân tích CV để xem báo cáo tại
                                đây.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {aiResult ? (
                <div className={cx('floatingAction')}>
                    <Button
                        to={editCvHref}
                        state={editCvState}
                        className={cx('floatingBtn')}
                        primary
                        leftIcon={<FiZap />}
                    >
                        Tối ưu CV ngay
                    </Button>
                </div>
            ) : null}
        </div>
    );
}

export default ResultAiPremium;
