import { useMemo } from 'react';
import classNames from 'classnames/bind';
import {
    FiAlertTriangle,
    FiCheck,
    FiEye,
    FiLock,
    FiRefreshCw,
    FiX,
    FiZap,
} from 'react-icons/fi';

import {
    filterRewriteProposals,
    getPendingRewriteProposals,
    getRewriteSectionLabel,
    getRewriteTargetLabel,
    getSeverityMeta,
} from '~/utils/ai-rewrite.utils';

import styles from './AiRewritePanel.module.scss';

const cx = classNames.bind(styles);

const SECTION_FILTERS = [
    'all',
    'summary',
    'experience',
    'skills',
    'education',
    'contact',
];

const SEVERITY_FILTERS = [
    { key: 'all', label: 'Tất cả mức độ' },
    { key: 'high', label: 'Cao' },
    { key: 'medium', label: 'Trung bình' },
    { key: 'low', label: 'Thấp' },
];

function TextBlock({ label, value, locked = false }) {
    return (
        <div className={cx('textBlock', { locked })}>
            <span>{label}</span>
            <p>{value || 'Chưa có nội dung'}</p>
        </div>
    );
}

function SuggestionCard({
    proposal,
    isPremium,
    isBusy,
    onApply,
    onReject,
    onView,
    onUpgrade,
}) {
    const severityMeta = getSeverityMeta(proposal?.severity);

    return (
        <article className={cx('card', { freeLocked: !isPremium })}>
            <div className={cx('cardHeader')}>
                <div>
                    <div className={cx('sectionName')}>
                        {getRewriteSectionLabel(proposal?.targetSection)}
                    </div>
                    <div className={cx('targetPath')}>
                        {getRewriteTargetLabel(proposal)}
                    </div>
                </div>

                <span className={cx('severity', severityMeta.className)}>
                    {severityMeta.shortLabel}
                </span>
            </div>

            <p className={cx('reason')}>
                {proposal?.reason || 'AI đề xuất tối ưu nội dung này.'}
            </p>

            <div className={cx('compareGrid')}>
                <TextBlock
                    label="Nội dung hiện tại"
                    value={proposal?.oldText}
                    locked={!isPremium}
                />
                <TextBlock
                    label="Nội dung đề xuất"
                    value={proposal?.newText}
                    locked={!isPremium}
                />
            </div>

            {proposal?.requiresConfirmation ? (
                <div className={cx('confirmNote')}>
                    <FiAlertTriangle />
                    <span>Cần người dùng xác nhận trước khi áp dụng.</span>
                </div>
            ) : null}

            <div className={cx('cardActions')}>
                {isPremium ? (
                    <>
                        <button
                            type="button"
                            className={cx('primaryAction')}
                            onClick={() => onApply?.(proposal)}
                            disabled={isBusy}
                        >
                            <FiCheck />
                            <span>{isBusy ? 'Đang áp dụng' : 'Áp dụng'}</span>
                        </button>
                        <button
                            type="button"
                            className={cx('ghostAction')}
                            onClick={() => onReject?.(proposal)}
                            disabled={isBusy}
                        >
                            <FiX />
                            <span>Bỏ qua</span>
                        </button>
                        <button
                            type="button"
                            className={cx('iconAction')}
                            onClick={() => onView?.(proposal)}
                            title="Xem vị trí"
                            disabled={isBusy}
                        >
                            <FiEye />
                        </button>
                    </>
                ) : (
                    <button
                        type="button"
                        className={cx('upgradeAction')}
                        onClick={onUpgrade}
                    >
                        <FiLock />
                        <span>Nâng cấp để xem</span>
                    </button>
                )}
            </div>
        </article>
    );
}

function AiRewritePanel({
    isPremium = false,
    loading = false,
    errorMessage = '',
    proposals = [],
    activeSectionFilter = 'all',
    activeSeverityFilter = 'all',
    actionLoadingId = '',
    applyingAll = false,
    onApplyProposal,
    onRejectProposal,
    onViewProposal,
    onApplyAllClick,
    onChangeSectionFilter,
    onChangeSeverityFilter,
    onRefresh,
    onTogglePanel,
    onUpgrade,
}) {
    const pendingProposals = useMemo(
        () => getPendingRewriteProposals(proposals),
        [proposals],
    );
    const filteredProposals = useMemo(
        () =>
            filterRewriteProposals({
                proposals,
                section: activeSectionFilter,
                severity: activeSeverityFilter,
            }),
        [activeSectionFilter, activeSeverityFilter, proposals],
    );
    const visibleProposals = isPremium
        ? filteredProposals
        : filteredProposals.slice(0, 3);

    return (
        <aside className={cx('wrapper')}>
            <div className={cx('header')}>
                <div>
                    <div className={cx('eyebrow')}>
                        <FiZap />
                        <span>AI Rewrite Mode</span>
                    </div>
                    <h2>Gợi ý tối ưu CV</h2>
                    <p>{pendingProposals.length} gợi ý đang chờ xử lý</p>
                </div>

                <div className={cx('headerActions')}>
                    <button
                        type="button"
                        className={cx('iconBtn')}
                        onClick={onRefresh}
                        title="Tải lại gợi ý"
                        disabled={
                            loading || applyingAll || Boolean(actionLoadingId)
                        }
                    >
                        <FiRefreshCw />
                    </button>
                    <button
                        type="button"
                        className={cx('iconBtn')}
                        onClick={onTogglePanel}
                        title="Ẩn bảng gợi ý"
                    >
                        <FiX />
                    </button>
                </div>
            </div>

            {!isPremium ? (
                <div className={cx('upgradeBox')}>
                    <div className={cx('upgradeIcon')}>
                        <FiLock />
                    </div>
                    <div>
                        <h3>Nâng cấp Premium AI</h3>
                        <p>
                            Free chỉ xem phân tích giới hạn. Premium mới có thể
                            xem đầy đủ rewrite proposal và áp dụng vào CV.
                        </p>
                    </div>
                    <button
                        type="button"
                        className={cx('upgradeBtn')}
                        onClick={onUpgrade}
                    >
                        Mở khóa Premium
                    </button>
                </div>
            ) : null}

            <div className={cx('filters')}>
                <div className={cx('filterRow')}>
                    {SECTION_FILTERS.map((sectionKey) => (
                        <button
                            type="button"
                            key={sectionKey}
                            className={cx('chip', {
                                active:
                                    activeSectionFilter === sectionKey ||
                                    (!activeSectionFilter &&
                                        sectionKey === 'all'),
                            })}
                            onClick={() => onChangeSectionFilter?.(sectionKey)}
                        >
                            {getRewriteSectionLabel(sectionKey)}
                        </button>
                    ))}
                </div>

                <div className={cx('filterRow')}>
                    {SEVERITY_FILTERS.map((item) => (
                        <button
                            type="button"
                            key={item.key}
                            className={cx('chip', {
                                active:
                                    activeSeverityFilter === item.key ||
                                    (!activeSeverityFilter &&
                                        item.key === 'all'),
                            })}
                            onClick={() => onChangeSeverityFilter?.(item.key)}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>
            </div>

            {isPremium ? (
                <button
                    type="button"
                    className={cx('applyAllBtn')}
                    onClick={onApplyAllClick}
                    disabled={
                        !pendingProposals.length ||
                        loading ||
                        applyingAll ||
                        Boolean(actionLoadingId)
                    }
                >
                    <FiCheck />
                    <span>
                        {applyingAll
                            ? 'Đang áp dụng'
                            : 'Áp dụng tất cả gợi ý'}
                    </span>
                </button>
            ) : null}

            <div className={cx('body')}>
                {loading ? (
                    <div className={cx('stateCard')}>Đang tải gợi ý AI...</div>
                ) : null}

                {!loading && errorMessage ? (
                    <div className={cx('errorCard')}>
                        <FiAlertTriangle />
                        <span>{errorMessage}</span>
                    </div>
                ) : null}

                {!loading && !errorMessage && !visibleProposals.length ? (
                    <div className={cx('stateCard')}>
                        Chưa có proposal pending cho bộ lọc hiện tại.
                    </div>
                ) : null}

                {!loading && !errorMessage
                    ? visibleProposals.map((proposal) => (
                          <SuggestionCard
                              key={proposal.id}
                              proposal={proposal}
                              isPremium={isPremium}
                              isBusy={
                                  applyingAll ||
                                  actionLoadingId === proposal.id
                              }
                              onApply={onApplyProposal}
                              onReject={onRejectProposal}
                              onView={onViewProposal}
                              onUpgrade={onUpgrade}
                          />
                      ))
                    : null}
            </div>
        </aside>
    );
}

export default AiRewritePanel;
