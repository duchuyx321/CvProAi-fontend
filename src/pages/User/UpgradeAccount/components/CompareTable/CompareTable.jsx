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

function CompareTable({ plans = [], currentPlanSlug = '' }) {
    const normalizedCurrentPlanSlug = normalizeSlug(currentPlanSlug);

    if (!plans.length) {
        return null;
    }

    return (
        <section className={cx('compareCard')}>
            <h2>So sánh các gói</h2>

            <div className={cx('compareTableWrap')}>
                <table className={cx('compareTable')}>
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
                                        {plan.name}
                                        {isCurrent ? ' (Hiện tại)' : ''}
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