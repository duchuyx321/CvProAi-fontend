import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import classNames from 'classnames/bind';
import {
    FiAlertCircle,
    FiArrowRight,
    FiAward,
    FiCheckCircle,
    FiChevronDown,
    FiLock,
    FiRefreshCw,
    FiTrendingUp,
    FiZap,
} from 'react-icons/fi';
import { toast } from 'react-toastify';

import Button from '~/components/Button';
import { config } from '~/config';
import { useAuth } from '~/context/AuthContext';
import { getAiAnalysisResultByRunId } from '~/services/aiAnalysis.service';

import {
    formatDateTime,
    getPriorityMeta,
    getSeverityMeta,
    normalizeAiResult,
    normalizeTier,
    prettifyKey,
    stringifyValue,
} from './utils';
import FeedbackValue from './FeedbackValue';
import { ScoreBar, ScoreRing } from './ScoreIndicators';
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
        const tierFromUser = user?.tier ?? user?.planTier ?? user?.packageTier;

        return normalizeTier(aiResult?.tier || tierFromState || tierFromUser);
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
                <section className={cx('heroCard')}>
                    <div className={cx('topbar')}>
                        <div className={cx('titleBlock')}>
                            <div className={cx('titleIcon')}>
                                <FiAward />
                            </div>
                            <div>
                                <h2 className={cx('title')}>
                                    Báo cáo AI Analysis CV
                                </h2>
                                <p className={cx('subtitle')}>
                                    Tập trung vào đúng vấn đề khiến CV rớt
                                    ATS/recruiter và ưu tiên hành động theo tác
                                    động.
                                </p>
                            </div>
                        </div>

                        <div className={cx('metaBlock')}>
                            <span
                                className={cx(
                                    'tierPill',
                                    isPremium ? 'premium' : 'free',
                                )}
                            >
                                {isPremium ? 'PREMIUM' : 'FREE'}
                            </span>
                            {aiResult?.createdAt ? (
                                <span className={cx('metaText')}>
                                    Cập nhật:{' '}
                                    {formatDateTime(aiResult.createdAt)}
                                </span>
                            ) : null}
                        </div>
                    </div>

                    {isPremium ? (
                        <div className={cx('premiumBanner')}>
                            <FiCheckCircle />
                            <span>
                                Bạn đang xem đầy đủ toàn bộ phân tích Premium.
                            </span>
                        </div>
                    ) : (
                        <div className={cx('freeBanner')}>
                            <div className={cx('freeBannerLeft')}>
                                <FiLock />
                                <span>
                                    {aiResult?.upgradeHint ||
                                        'Bạn đang dùng gói FREE. Một phần insight chuyên sâu đang bị ẩn.'}
                                </span>
                            </div>
                            <Button
                                to={config.router.upgradePremium}
                                className={cx('upgradeBtn')}
                                primary
                            >
                                Mở khóa Premium
                            </Button>
                        </div>
                    )}
                </section>

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
                        <section className={cx('card', 'summaryCard', 'wide')}>
                            <div className={cx('cardHeader')}>
                                <div className={cx('cardTitle')}>
                                    Tổng quan điểm CV
                                </div>
                                <div className={cx('statusPill')}>
                                    <FiCheckCircle />
                                    <span>Hoàn tất</span>
                                </div>
                            </div>
                            <div className={cx('summaryBody')}>
                                <ScoreRing
                                    title="Overall Score"
                                    score={aiResult.overallScore}
                                    subtitle="Đánh giá tổng thể"
                                />
                                <div className={cx('bars')}>
                                    <ScoreBar
                                        label="Độ tương thích ATS (ATS Score)"
                                        score={aiResult.atsScore}
                                    />
                                    <ScoreBar
                                        label="Mạch lạc & rõ ràng (Clarity)"
                                        score={aiResult.clarityScore}
                                    />
                                    <ScoreBar
                                        label="Mức độ ấn tượng (Impact)"
                                        score={aiResult.impactScore}
                                    />
                                </div>
                            </div>
                        </section>

                        <section className={cx('card')}>
                            <div className={cx('cardHeader')}>
                                <div className={cx('cardTitle')}>
                                    Điểm mạnh nổi bật
                                </div>
                                <div className={cx('cardHint')}>
                                    {totalStrengthCount} mục
                                </div>
                            </div>
                            {visibleStrengths.length ? (
                                <ul className={cx('strengthList')}>
                                    {visibleStrengths.map((item) => (
                                        <li
                                            key={item.id}
                                            className={cx('strengthItem')}
                                        >
                                            <h4>{item.title}</h4>
                                            {item.description ? (
                                                <p>{item.description}</p>
                                            ) : null}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className={cx('emptyState')}>
                                    <span className={cx('muted')}>
                                        Chưa có dữ liệu
                                    </span>
                                </div>
                            )}
                            {!isPremium && hiddenStrengthCount > 0 ? (
                                <div className={cx('lockInline')}>
                                    <FiLock />
                                    <span>
                                        Còn {hiddenStrengthCount} điểm mạnh chưa
                                        mở khóa trong gói FREE.
                                    </span>
                                </div>
                            ) : null}
                        </section>

                        <section className={cx('card')}>
                            <div className={cx('cardHeader')}>
                                <div className={cx('cardTitle')}>
                                    Rủi ro chính cần xử lý
                                </div>
                                <div className={cx('cardHint')}>
                                    {totalWeaknessCount} mục
                                </div>
                            </div>
                            {visibleWeaknesses.length ? (
                                <ul className={cx('weaknessList')}>
                                    {visibleWeaknesses.map((item) => {
                                        const severityMeta = getSeverityMeta(
                                            item.severity,
                                        );
                                        return (
                                            <li
                                                key={item.id}
                                                className={cx('weaknessItem')}
                                            >
                                                <div className={cx('itemHead')}>
                                                    <h4>{item.title}</h4>
                                                    <span
                                                        className={cx(
                                                            'tag',
                                                            `tag-${severityMeta.className}`,
                                                        )}
                                                    >
                                                        {severityMeta.label}
                                                    </span>
                                                </div>
                                                {item.description ? (
                                                    <p>{item.description}</p>
                                                ) : null}
                                                <div className={cx('itemMeta')}>
                                                    {item.targetSection ? (
                                                        <span>
                                                            Section:{' '}
                                                            {item.targetSection}
                                                        </span>
                                                    ) : null}
                                                    {item.impactScore !=
                                                    null ? (
                                                        <span>
                                                            Impact:{' '}
                                                            {item.impactScore}
                                                            /100
                                                        </span>
                                                    ) : null}
                                                </div>
                                                {item.evidence ? (
                                                    <div
                                                        className={cx(
                                                            'evidenceBlock',
                                                        )}
                                                    >
                                                        {Object.entries(
                                                            item.evidence,
                                                        ).map(
                                                            ([key, value]) => (
                                                                <div key={key}>
                                                                    <strong>
                                                                        {prettifyKey(
                                                                            key,
                                                                        )}
                                                                        :
                                                                    </strong>{' '}
                                                                    {stringifyValue(
                                                                        value,
                                                                    )}
                                                                </div>
                                                            ),
                                                        )}
                                                    </div>
                                                ) : null}
                                            </li>
                                        );
                                    })}
                                </ul>
                            ) : (
                                <div className={cx('emptyState')}>
                                    <span className={cx('muted')}>
                                        Chưa có dữ liệu
                                    </span>
                                </div>
                            )}

                            {!isPremium && hiddenWeaknessCount > 0 ? (
                                <div className={cx('lockInline')}>
                                    <FiLock />
                                    <span>
                                        Còn {hiddenWeaknessCount} vấn đề chưa mở
                                        khóa trong gói FREE.
                                    </span>
                                </div>
                            ) : null}
                        </section>

                        <section className={cx('card', 'wide')}>
                            <div className={cx('cardHeader')}>
                                <div className={cx('cardTitle')}>
                                    Đề xuất hành động ưu tiên
                                </div>
                                <div className={cx('cardHint')}>
                                    {totalSuggestionCount} gợi ý
                                </div>
                            </div>
                            {visibleSuggestions.length ? (
                                <ol className={cx('suggestionList')}>
                                    {visibleSuggestions.map((item) => {
                                        const priorityMeta = getPriorityMeta(
                                            item.priority,
                                        );
                                        return (
                                            <li
                                                key={item.id}
                                                className={cx('suggestionItem')}
                                            >
                                                <div className={cx('itemHead')}>
                                                    <h4>{item.title}</h4>
                                                    <span
                                                        className={cx(
                                                            'tag',
                                                            `tag-${priorityMeta.className}`,
                                                        )}
                                                    >
                                                        {priorityMeta.label}
                                                    </span>
                                                </div>
                                                {item.action || item.example ? (
                                                    <div
                                                        className={cx(
                                                            'suggestionExample',
                                                        )}
                                                    >
                                                        Hành động:{' '}
                                                        {stringifyValue(
                                                            item.action ||
                                                                item.example,
                                                        )}
                                                    </div>
                                                ) : null}
                                            </li>
                                        );
                                    })}
                                </ol>
                            ) : (
                                <div className={cx('emptyState')}>
                                    <span className={cx('muted')}>
                                        Chưa có dữ liệu
                                    </span>
                                </div>
                            )}
                            {!isPremium && hiddenSuggestionCount > 0 ? (
                                <div className={cx('lockInline')}>
                                    <FiZap />
                                    <span>
                                        Còn {hiddenSuggestionCount} gợi ý nâng
                                        cấp CV chuyên sâu cho Premium.
                                    </span>
                                </div>
                            ) : null}
                        </section>

                        <section className={cx('card', 'wide')}>
                            <div className={cx('cardHeader')}>
                                <div className={cx('cardTitle')}>
                                    Structured Feedback (Recruiter View)
                                </div>
                                <div className={cx('cardHint')}>
                                    {structuredFeedbackEntries.length
                                        ? `${structuredFeedbackEntries.length} phần`
                                        : 'Chưa có'}
                                </div>
                            </div>

                            {visibleStructuredFeedback.length ? (
                                <div className={cx('accordion')}>
                                    {visibleStructuredFeedback.map(
                                        ([key, value]) => (
                                            <details
                                                key={key}
                                                className={cx('accordionItem')}
                                            >
                                                <summary
                                                    className={cx(
                                                        'accordionSummary',
                                                    )}
                                                >
                                                    <span>
                                                        {prettifyKey(key)}
                                                    </span>
                                                    <FiChevronDown
                                                        className={cx(
                                                            'accordionIcon',
                                                        )}
                                                    />
                                                </summary>
                                                <div
                                                    className={cx(
                                                        'accordionBody',
                                                    )}
                                                >
                                                    <FeedbackValue
                                                        value={value}
                                                    />
                                                </div>
                                            </details>
                                        ),
                                    )}
                                </div>
                            ) : (
                                <div className={cx('emptyState')}>
                                    <span className={cx('muted')}>
                                        Chưa có dữ liệu
                                    </span>
                                </div>
                            )}

                            {!isPremium && hiddenStructuredCount > 0 ? (
                                <div className={cx('lockInline')}>
                                    <FiTrendingUp />
                                    <span>
                                        Còn {hiddenStructuredCount} phân tích
                                        recruiter-view chỉ có ở Premium.
                                    </span>
                                </div>
                            ) : null}
                        </section>

                        {!isPremium ? (
                            <section
                                className={cx('card', 'wide', 'upsellCard')}
                            >
                                <div className={cx('upsellHeader')}>
                                    <div>
                                        <h3>
                                            Mở khóa toàn bộ insight chuyên sâu
                                        </h3>
                                        <p>
                                            Bạn đang bị ẩn{' '}
                                            <strong>
                                                {hiddenInsightCount}
                                            </strong>{' '}
                                            insight có thể cải thiện mạnh tỷ lệ
                                            qua vòng lọc.
                                        </p>
                                    </div>
                                    <Button
                                        to={config.router.upgradePremium}
                                        className={cx('upsellBtn')}
                                        primary
                                        rightIcon={<FiArrowRight />}
                                    >
                                        Nâng cấp Premium ngay
                                    </Button>
                                </div>

                                <div className={cx('upsellGrid')}>
                                    <div className={cx('upsellItem')}>
                                        <FiLock />
                                        <span>
                                            Full evidence theo từng điểm yếu
                                        </span>
                                    </div>
                                    <div className={cx('upsellItem')}>
                                        <FiZap />
                                        <span>
                                            Gợi ý viết lại bullet theo chuẩn
                                            recruiter
                                        </span>
                                    </div>
                                    <div className={cx('upsellItem')}>
                                        <FiTrendingUp />
                                        <span>
                                            Ưu tiên hành động theo Impact Score
                                        </span>
                                    </div>
                                </div>
                            </section>
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
