import React from 'react';
import classNames from 'classnames/bind';
import {
    FiAward,
    FiCheckCircle,
    FiLock,
    FiZap,
    FiChevronDown,
    FiTrendingUp,
    FiArrowRight,
} from 'react-icons/fi';

import Button from '~/components/Button';
import { config } from '~/config';
import {
    formatDateTime,
    scoreToPercent,
    formatScore,
    extractItemText,
    prettifyKey,
    getSeverityMeta,
    stringifyValue,
    getPriorityMeta,
} from './utils';
import styles from './ResultAi.module.scss';

const cx = classNames.bind(styles);

// ========================
// 1. Score Indicators
// ========================

export function ScoreRing({ title, score, subtitle }) {
    const percent = scoreToPercent(score);

    return (
        <div className={cx('ringCard')}>
            <div className={cx('ring')} style={{ '--p': `${percent}%` }}>
                <div className={cx('ringInner')}>
                    <div className={cx('ringValue')}>{formatScore(score)}</div>
                    <div className={cx('ringUnit')}>/ 100</div>
                </div>
            </div>
            <div className={cx('ringMeta')}>
                <div className={cx('ringTitle')}>{title}</div>
                {subtitle ? (
                    <div className={cx('ringSubtitle')}>{subtitle}</div>
                ) : null}
            </div>
        </div>
    );
}

export function ScoreBar({ label, score }) {
    const percent = scoreToPercent(score);
    const displayValue = formatScore(score);

    return (
        <div className={cx('barRow')}>
            <div className={cx('barTop')}>
                <span className={cx('barLabel')}>{label}</span>
                <span className={cx('barValue')}>{displayValue}</span>
            </div>
            <div className={cx('barTrack')}>
                <div
                    className={cx('barFill')}
                    style={{ width: `${percent}%` }}
                />
            </div>
        </div>
    );
}

// ========================
// 2. Feedback Value Renderer
// ========================

export function FeedbackValue({ value }) {
    if (value == null) return <span className={cx('muted')}>Chưa có</span>;

    if (typeof value === 'string' || typeof value === 'number') {
        return <p className={cx('feedbackText')}>{String(value)}</p>;
    }

    if (Array.isArray(value)) {
        if (value.length === 0)
            return <span className={cx('muted')}>Chưa có</span>;
        return (
            <ul className={cx('bulletList')}>
                {value.map((item, index) => (
                    <li key={`${index}-${extractItemText(item)}`}>
                        {extractItemText(item)}
                    </li>
                ))}
            </ul>
        );
    }

    if (typeof value === 'object') {
        const entries = Object.entries(value);
        if (entries.length === 0)
            return <span className={cx('muted')}>Chưa có</span>;
        return (
            <div className={cx('kvGrid')}>
                {entries.map(([key, item]) => (
                    <div key={key} className={cx('kvItem')}>
                        <div className={cx('kvKey')}>{prettifyKey(key)}</div>
                        <div className={cx('kvValue')}>
                            <FeedbackValue value={item} />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return <p className={cx('feedbackText')}>{String(value)}</p>;
}

// ========================
// 3. UI Sections
// ========================

export function HeroCard({ isPremium, aiResult }) {
    return (
        <section className={cx('heroCard')}>
            <div className={cx('topbar')}>
                <div className={cx('titleBlock')}>
                    <div className={cx('titleIcon')}>
                        <FiAward />
                    </div>
                    <div>
                        <h2 className={cx('title')}>Báo cáo AI Analysis CV</h2>
                        <p className={cx('subtitle')}>
                            Tập trung vào đúng vấn đề khiến CV rớt ATS/recruiter
                            và ưu tiên hành động theo tác động.
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
                            Cập nhật: {formatDateTime(aiResult.createdAt)}
                        </span>
                    ) : null}
                </div>
            </div>

            {isPremium ? (
                <div className={cx('premiumBanner')}>
                    <FiCheckCircle />
                    <span>Bạn đang xem đầy đủ toàn bộ phân tích Premium.</span>
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
    );
}

export function SummaryCard({ aiResult }) {
    return (
        <section className={cx('card', 'summaryCard', 'wide')}>
            <div className={cx('cardHeader')}>
                <div className={cx('cardTitle')}>Tổng quan điểm CV</div>
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
    );
}

export function StrengthSection({
    visibleStrengths,
    totalStrengthCount,
    hiddenStrengthCount,
    isPremium,
}) {
    return (
        <section className={cx('card')}>
            <div className={cx('cardHeader')}>
                <div className={cx('cardTitle')}>Điểm mạnh nổi bật</div>
                <div className={cx('cardHint')}>{totalStrengthCount} mục</div>
            </div>
            {visibleStrengths.length ? (
                <ul className={cx('strengthList')}>
                    {visibleStrengths.map((item) => (
                        <li key={item.id} className={cx('strengthItem')}>
                            <h4>{item.title}</h4>
                            {item.description ? (
                                <p>{item.description}</p>
                            ) : null}
                        </li>
                    ))}
                </ul>
            ) : (
                <div className={cx('emptyState')}>
                    <span className={cx('muted')}>Chưa có dữ liệu</span>
                </div>
            )}
            {!isPremium && hiddenStrengthCount > 0 ? (
                <div className={cx('lockInline')}>
                    <FiLock />
                    <span>
                        Còn {hiddenStrengthCount} điểm mạnh chưa mở khóa trong
                        gói FREE.
                    </span>
                </div>
            ) : null}
        </section>
    );
}

export function WeaknessSection({
    visibleWeaknesses,
    totalWeaknessCount,
    hiddenWeaknessCount,
    isPremium,
}) {
    return (
        <section className={cx('card')}>
            <div className={cx('cardHeader')}>
                <div className={cx('cardTitle')}>Rủi ro chính cần xử lý</div>
                <div className={cx('cardHint')}>{totalWeaknessCount} mục</div>
            </div>
            {visibleWeaknesses.length ? (
                <ul className={cx('weaknessList')}>
                    {visibleWeaknesses.map((item) => {
                        const severityMeta = getSeverityMeta(item.severity);
                        return (
                            <li key={item.id} className={cx('weaknessItem')}>
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
                                            Section: {item.targetSection}
                                        </span>
                                    ) : null}
                                    {item.impactScore != null ? (
                                        <span>
                                            Impact: {item.impactScore}/100
                                        </span>
                                    ) : null}
                                </div>
                                {item.evidence ? (
                                    <div className={cx('evidenceBlock')}>
                                        {Object.entries(item.evidence).map(
                                            ([key, value]) => (
                                                <div key={key}>
                                                    <strong>
                                                        {prettifyKey(key)}:
                                                    </strong>{' '}
                                                    {stringifyValue(value)}
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
                    <span className={cx('muted')}>Chưa có dữ liệu</span>
                </div>
            )}

            {!isPremium && hiddenWeaknessCount > 0 ? (
                <div className={cx('lockInline')}>
                    <FiLock />
                    <span>
                        Còn {hiddenWeaknessCount} vấn đề chưa mở khóa trong gói
                        FREE.
                    </span>
                </div>
            ) : null}
        </section>
    );
}

export function SuggestionSection({
    visibleSuggestions,
    totalSuggestionCount,
    hiddenSuggestionCount,
    isPremium,
}) {
    return (
        <section className={cx('card', 'wide')}>
            <div className={cx('cardHeader')}>
                <div className={cx('cardTitle')}>Đề xuất hành động ưu tiên</div>
                <div className={cx('cardHint')}>{totalSuggestionCount} gợi ý</div>
            </div>
            {visibleSuggestions.length ? (
                <ol className={cx('suggestionList')}>
                    {visibleSuggestions.map((item) => {
                        const priorityMeta = getPriorityMeta(item.priority);
                        return (
                            <li key={item.id} className={cx('suggestionItem')}>
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
                                    <div className={cx('suggestionExample')}>
                                        Hành động:{' '}
                                        {stringifyValue(
                                            item.action || item.example,
                                        )}
                                    </div>
                                ) : null}
                            </li>
                        );
                    })}
                </ol>
            ) : (
                <div className={cx('emptyState')}>
                    <span className={cx('muted')}>Chưa có dữ liệu</span>
                </div>
            )}
            {!isPremium && hiddenSuggestionCount > 0 ? (
                <div className={cx('lockInline')}>
                    <FiZap />
                    <span>
                        Còn {hiddenSuggestionCount} gợi ý nâng cấp CV chuyên sâu
                        cho Premium.
                    </span>
                </div>
            ) : null}
        </section>
    );
}

export function StructuredFeedbackSection({
    visibleStructuredFeedback,
    structuredFeedbackEntries,
    hiddenStructuredCount,
    isPremium,
}) {
    return (
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
                    {visibleStructuredFeedback.map(([key, value]) => (
                        <details key={key} className={cx('accordionItem')}>
                            <summary className={cx('accordionSummary')}>
                                <span>{prettifyKey(key)}</span>
                                <FiChevronDown
                                    className={cx('accordionIcon')}
                                />
                            </summary>
                            <div className={cx('accordionBody')}>
                                <FeedbackValue value={value} />
                            </div>
                        </details>
                    ))}
                </div>
            ) : (
                <div className={cx('emptyState')}>
                    <span className={cx('muted')}>Chưa có dữ liệu</span>
                </div>
            )}

            {!isPremium && hiddenStructuredCount > 0 ? (
                <div className={cx('lockInline')}>
                    <FiTrendingUp />
                    <span>
                        Còn {hiddenStructuredCount} phân tích recruiter-view chỉ
                        có ở Premium.
                    </span>
                </div>
            ) : null}
        </section>
    );
}

export function UpsellCard({ hiddenInsightCount }) {
    return (
        <section className={cx('card', 'wide', 'upsellCard')}>
            <div className={cx('upsellHeader')}>
                <div>
                    <h3>Mở khóa toàn bộ insight chuyên sâu</h3>
                    <p>
                        Bạn đang bị ẩn <strong>{hiddenInsightCount}</strong>{' '}
                        insight có thể cải thiện mạnh tỷ lệ qua vòng lọc.
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
                    <span>Full evidence theo từng điểm yếu</span>
                </div>
                <div className={cx('upsellItem')}>
                    <FiZap />
                    <span>Gợi ý viết lại bullet theo chuẩn recruiter</span>
                </div>
                <div className={cx('upsellItem')}>
                    <FiTrendingUp />
                    <span>Ưu tiên hành động theo Impact Score</span>
                </div>
            </div>
        </section>
    );
}
