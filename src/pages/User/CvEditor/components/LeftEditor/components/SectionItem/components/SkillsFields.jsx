import classNames from 'classnames/bind';
import styles from '../SectionItem.module.scss';
import { getRewriteProposalsForTarget } from '~/utils/ai-rewrite.utils';
import { uniqueFieldKeys } from './fieldConfig.utils';

const cx = classNames.bind(styles);

function ArrayEmptyState({ message }) {
    return (
        <div className={cx('emptyState')}>
            <p>{message}</p>
        </div>
    );
}

function ItemCard({ children, targeted = false }) {
    return <div className={cx('arrayItem', { aiTargetedItem: targeted })}>{children}</div>;
}

function ItemActions({ onRemove, removeLabel }) {
    return (
        <div className={cx('itemActions')}>
            <button
                type="button"
                className={cx('removeItemBtn')}
                onClick={onRemove}
            >
                {removeLabel}
            </button>
        </div>
    );
}

function AddItemButton({ onClick, children }) {
    return (
        <button type="button" className={cx('addItemBtn')} onClick={onClick}>
            {children}
        </button>
    );
}

function FieldGroup({ label, children, fullWidth = false }) {
    return (
        <div className={cx('fieldGroup', { fullWidth })}>
            {label ? <label className={cx('label')}>{label}</label> : null}
            {children}
        </div>
    );
}

function AiHint({ proposals = [], onClick }) {
    if (!proposals.length) return null;

    return (
        <button type="button" className={cx('aiFieldHint')} onClick={onClick}>
            <span>AI</span>
            <span>{proposals.length}</span>
        </button>
    );
}

function LabelWithHint({ label, proposals = [], onClick }) {
    return (
        <span className={cx('labelWithHint')}>
            <span>{label}</span>
            <AiHint proposals={proposals} onClick={onClick} />
        </span>
    );
}

function BaseInput({ value, onChange, type = 'text', disabled = false }) {
    return (
        <input
            className={cx('input')}
            type={type}
            value={value || ''}
            onChange={onChange}
            disabled={disabled}
        />
    );
}

function BaseTextarea({ value, onChange }) {
    return (
        <textarea
            className={cx('textarea')}
            value={value || ''}
            onChange={onChange}
        />
    );
}

function normalizeVariant(value = '') {
    return String(value).trim().toLowerCase();
}

function getSkillDisplay(section = {}) {
    const display = section?.options?.skill?.display;
    const variant = normalizeVariant(section?.variant);

    if (display) return String(display).toUpperCase();
    if (variant.includes('progress')) return 'PROGRESS_BAR';
    if (variant.includes('card') || variant.includes('text'))
        return 'CARD_TEXT';
    if (variant.includes('tag')) return 'TAG';
    if (variant.includes('two_column')) return 'TWO_COLUMN_BULLET';
    return 'BULLET';
}

function clampLevel(value, maxLevel) {
    const numericValue = Number(value);

    if (Number.isNaN(numericValue)) return 0;
    if (numericValue < 0) return 0;
    if (numericValue > maxLevel) return maxLevel;

    return numericValue;
}

function SkillsFields({
    data = [],
    onChangeArrayField,
    onChangeObjectInArray,
    onAddSectionItem,
    section = {},
    sectionKey,
    aiRewrite,
}) {
    const items = Array.isArray(data) ? data : [];
    const fieldKeys = uniqueFieldKeys(section?.fields);
    const display = getSkillDisplay(section);
    const skillOptions = section?.options?.skill || {};
    const maxLevel = Number(skillOptions?.maxLevel || 100) || 100;

    const handleAdd = () => {
        onAddSectionItem?.(sectionKey);
    };

    const handleRemove = (index) => {
        onChangeArrayField?.(
            sectionKey,
            items.filter((_, itemIndex) => itemIndex !== index),
        );
    };

    const hasConfiguredField = (fieldKey) => fieldKeys.includes(fieldKey);

    return (
        <div className={cx('arraySection')}>
            {!items.length && (
                <ArrayEmptyState message="Chưa có kỹ năng nào." />
            )}

            {items.map((item, index) => {
                const itemProposals = getRewriteProposalsForTarget(
                    aiRewrite?.proposals,
                    {
                        sectionKey,
                        sectionType: 'skills',
                        index,
                    },
                );
                const nameProposals = getRewriteProposalsForTarget(
                    aiRewrite?.proposals,
                    {
                        sectionKey,
                        sectionType: 'skills',
                        index,
                        fieldKey: 'name',
                    },
                );
                const descriptionProposals = getRewriteProposalsForTarget(
                    aiRewrite?.proposals,
                    {
                        sectionKey,
                        sectionType: 'skills',
                        index,
                        fieldKey: 'description',
                        includeItemLevel: false,
                    },
                );
                const handleHintClick = (proposals) => (event) => {
                    event.stopPropagation();
                    aiRewrite?.onViewProposal?.(proposals[0]);
                };
                const showLevel =
                    display === 'PROGRESS_BAR' ||
                    hasConfiguredField('level') ||
                    item?.level !== undefined;
                const showDescription =
                    display === 'CARD_TEXT' ||
                    hasConfiguredField('description') ||
                    skillOptions?.showDescription ||
                    item?.description !== undefined;
                const level = clampLevel(item?.level ?? 0, maxLevel);

                return (
                    <ItemCard
                        key={`${sectionKey}-${index}`}
                        targeted={itemProposals.length > 0}
                    >
                        <FieldGroup
                            label={
                                <LabelWithHint
                                    label="Tên kỹ năng"
                                    proposals={nameProposals}
                                    onClick={handleHintClick(nameProposals)}
                                />
                            }
                        >
                            <BaseInput
                                value={item?.name}
                                onChange={(e) =>
                                    onChangeObjectInArray?.(
                                        sectionKey,
                                        index,
                                        'name',
                                        e.target.value,
                                    )
                                }
                            />
                        </FieldGroup>

                        {showLevel && (
                            <FieldGroup label="Cấp độ kỹ năng">
                                <div className={cx('rangeField')}>
                                    <input
                                        className={cx('rangeInput')}
                                        type="range"
                                        min="0"
                                        max={maxLevel}
                                        step="1"
                                        value={level}
                                        onChange={(e) =>
                                            onChangeObjectInArray?.(
                                                sectionKey,
                                                index,
                                                'level',
                                                clampLevel(
                                                    e.target.value,
                                                    maxLevel,
                                                ),
                                            )
                                        }
                                    />
                                    <input
                                        className={cx('levelInput')}
                                        type="number"
                                        min="0"
                                        max={maxLevel}
                                        value={level}
                                        onChange={(e) =>
                                            onChangeObjectInArray?.(
                                                sectionKey,
                                                index,
                                                'level',
                                                clampLevel(
                                                    e.target.value,
                                                    maxLevel,
                                                ),
                                            )
                                        }
                                    />
                                    <span className={cx('levelSuffix')}>
                                        / {maxLevel}
                                    </span>
                                </div>
                            </FieldGroup>
                        )}

                        {showDescription && (
                            <FieldGroup
                                label={
                                    <LabelWithHint
                                        label="Mô tả"
                                        proposals={descriptionProposals}
                                        onClick={handleHintClick(
                                            descriptionProposals,
                                        )}
                                    />
                                }
                                fullWidth
                            >
                                <BaseTextarea
                                    value={item?.description}
                                    onChange={(e) =>
                                        onChangeObjectInArray?.(
                                            sectionKey,
                                            index,
                                            'description',
                                            e.target.value,
                                        )
                                    }
                                />
                            </FieldGroup>
                        )}

                        {hasConfiguredField('category') && (
                            <FieldGroup label="Nhóm kỹ năng">
                                <BaseInput
                                    value={item?.category}
                                    onChange={(e) =>
                                        onChangeObjectInArray?.(
                                            sectionKey,
                                            index,
                                            'category',
                                            e.target.value,
                                        )
                                    }
                                />
                            </FieldGroup>
                        )}

                        <ItemActions
                            removeLabel="Xóa kỹ năng"
                            onRemove={() => handleRemove(index)}
                        />
                    </ItemCard>
                );
            })}

            <AddItemButton onClick={handleAdd}>+ Thêm kỹ năng</AddItemButton>
        </div>
    );
}

export default SkillsFields;
