import classNames from 'classnames/bind';
import styles from './PackageTable.module.scss';

const cx = classNames.bind(styles);

function PackageTable({
    loading,
    packages = [],
    formatCurrency,
    formatDuration,
    renderActions,
}) {
    return (
        <div className={cx('tableShell')}>
            <div className={cx('wrapper')}>
                <table className={cx('table')}>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Tên gói</th>
                            <th>Giá</th>
                            <th>Thời hạn</th>
                            <th>Quyền lợi</th>
                            <th>Người dùng</th>
                            <th>Trạng thái</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>

                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={8} className={cx('placeholder')}>
                                    Đang tải danh sách gói dịch vụ...
                                </td>
                            </tr>
                        ) : packages.length === 0 ? (
                            <tr>
                                <td colSpan={8} className={cx('placeholder')}>
                                    Không có dữ liệu phù hợp.
                                </td>
                            </tr>
                        ) : (
                            packages.map((item) => (
                                <tr key={item.id || item.slug || item.code}>
                                    <td className={cx('idCell')}>
                                        <span
                                            className={cx('idText')}
                                            title={item.id || ''}
                                        >
                                            {item.displayId}
                                        </span>
                                    </td>

                                    <td className={cx('name')}>
                                        <span className={cx('nameText')}>
                                            {item.name}
                                        </span>
                                    </td>

                                    <td>{formatCurrency(item.price)}</td>

                                    <td className={cx('duration')}>
                                        <span className={cx('durationText')}>
                                            {formatDuration(
                                                item.durationUnit,
                                                item.durationValue,
                                            )}
                                        </span>
                                    </td>

                                    <td>
                                        <div className={cx('chipList')}>
                                            {item.benefits.length > 0 ? (
                                                item.benefits.map((benefit) => (
                                                    <span
                                                        key={`${item.code}-${benefit}`}
                                                        className={cx('chip')}
                                                    >
                                                        {benefit}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className={cx('emptyValue')}>
                                                    -
                                                </span>
                                            )}
                                        </div>
                                    </td>

                                    <td>
                                        {item.totalUsers.toLocaleString('vi-VN')}
                                    </td>

                                    <td>
                                        <span
                                            className={cx(
                                                'status',
                                                item.status === 'ACTIVE'
                                                    ? 'statusActive'
                                                    : 'statusPaused',
                                            )}
                                        >
                                            {item.status === 'ACTIVE'
                                                ? 'Hoạt động'
                                                : 'Tạm ngưng'}
                                        </span>
                                    </td>

                                    <td>
                                        <div className={cx('actions')}>
                                            {renderActions(item)}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default PackageTable;
