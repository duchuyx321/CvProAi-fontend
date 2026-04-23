import classNames from 'classnames/bind';
import styles from './ActivePackageList.module.scss';

const cx = classNames.bind(styles);

function getStatusMeta(status) {
    if (status === 'PAUSED') {
        return {
            label: 'Tạm ngưng',
            tone: 'warning',
        };
    }

    if (status === 'DRAFT') {
        return {
            label: 'Chờ xử lý',
            tone: 'neutral',
        };
    }

    return {
        label: 'Đang hoạt động',
        tone: 'success',
    };
}

function ActivePackageList({ items = [] }) {
    const hasItems = items.length > 0;

    return (
        <section className={cx('wrapper')}>
            <h3 className={cx('title')}>DANH SÁCH GÓI ĐANG HOẠT ĐỘNG</h3>

            {hasItems ? (
                <div className={cx('list')}>
                    {items.map((item) => {
                        const statusMeta = getStatusMeta(item.status);

                        return (
                            <div key={item.id} className={cx('item')}>
                                <span className={cx('avatar')}>
                                    {String(item.name || '')
                                        .charAt(0)
                                        .toUpperCase()}
                                </span>

                                <strong className={cx('name')}>
                                    {item.name}
                                </strong>

                                <span
                                    className={cx(
                                        'status',
                                        `status${statusMeta.tone}`
                                    )}
                                >
                                    {statusMeta.label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className={cx('emptyState')}>
                    Chưa có gói dịch vụ nào để hiển thị.
                </div>
            )}
        </section>
    );
}

export default ActivePackageList;