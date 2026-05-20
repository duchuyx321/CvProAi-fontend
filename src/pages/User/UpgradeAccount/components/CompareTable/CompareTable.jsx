import classNames from 'classnames/bind';

import styles from './CompareTable.module.scss';

const cx = classNames.bind(styles);

const COMPARE_ROWS = [
    {
        label: 'Số lượng CV',
        key: 'cv_limit',
    },
    {
        label: 'Lượt phân tích AI',
        key: 'ai_limit',
    },
    {
        label: 'Lượt xuất PDF',
        key: 'export_limit',
    },
    {
        label: 'Mẫu Premium',
        key: 'premium_template',
        format: (value) => (value ? 'Có' : 'Không'),
    },
    {
        label: 'Watermark',
        key: 'remove_watermark',
        format: (value) => (value ? 'Không' : 'Có'),
    },
    {
        label: 'Xem full phân tích AI',
        key: 'view_full_ai_analysis',
        format: (value) => (value ? 'Có' : 'Không'),
    },
    {
        label: 'Mua thêm AI',
        key: 'can_purchase_ai_addon',
        format: (value) => (value ? 'Có' : 'Không'),
    },
    {
        label: 'Hỗ trợ ưu tiên',
        key: 'priority_support',
        format: (value) => (value ? 'Có' : 'Không'),
    },
];

function normalizeSlug(value = '') {
    return String(value).trim().toLowerCase();
}

function getFeatureColumnWidth(planCount) {
    if (planCount <= 2) return '42%';
    if (planCount === 3) return '34%';

    return '30%';
}

function CompareTable({ plans = [], currentPlanSlug = '' }) {
    const normalizedCurrentPlanSlug = normalizeSlug(currentPlanSlug);
    const planCount = plans.length;
    const featureColumnWidth = getFeatureColumnWidth(planCount);

    if (!planCount) {
        return null;
    }

    return (
        <section
            className={cx('compareCard', {
                twoPlans: planCount === 2,
                threePlans: planCount === 3,
                manyPlans: planCount >= 4,
            })}
        >
            <h2>So sánh các gói</h2>

            <div className={cx('compareTableWrap')}>
                <table className={cx('compareTable')}>
                    <colgroup>
                        <col style={{ width: featureColumnWidth }} />
                        {plans.map((plan) => (
                            <col
                                key={plan.id}
                                style={{
                                    width: `calc((100% - ${featureColumnWidth}) / ${planCount})`,
                                }}
                            />
                        ))}
                    </colgroup>

                    <thead>
                        <tr>
                            <th>Tính năng</th>

                            {plans.map((plan) => {
                                const isCurrent =
                                    normalizeSlug(plan?.slug) ===
                                    normalizedCurrentPlanSlug;

                                return (
                                    <th
                                        key={plan.id}
                                        className={cx({
                                            currentCol: isCurrent,
                                        })}
                                    >
                                        <span className={cx('planName')}>
                                            {plan.name || '--'}
                                        </span>

                                        {isCurrent ? (
                                            <span className={cx('currentText')}>
                                                Hiện tại
                                            </span>
                                        ) : null}
                                    </th>
                                );
                            })}
                        </tr>
                    </thead>

                    <tbody>
                        {COMPARE_ROWS.map((row) => (
                            <tr key={row.key}>
                                <td>{row.label}</td>

                                {plans.map((plan) => {
                                    const isCurrent =
                                        normalizeSlug(plan?.slug) ===
                                        normalizedCurrentPlanSlug;

                                    const value = plan?.[row.key];

                                    return (
                                        <td
                                            key={`${plan.id}-${row.key}`}
                                            className={cx({
                                                currentCol: isCurrent,
                                            })}
                                        >
                                            {row.format
                                                ? row.format(value)
                                                : value ?? '--'}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}

export default CompareTable;