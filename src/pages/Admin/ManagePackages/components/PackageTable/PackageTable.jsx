import classNames from 'classnames/bind';
import styles from './PackageTable.module.scss';

const cx = classNames.bind(styles);

function PackageTable({
    loading,
    packages,
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
        <th>TÊN GÓI</th>
        <th>GIÁ (VND)</th>
        <th>THỜI HẠN</th>
        <th>QUYỀN LỢI</th>
        <th>NGƯỜI DÙNG</th>
        <th>TRẠNG THÁI</th>
        <th>HÀNH ĐỘNG</th>
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
                                <tr key={item.id}>
                                    <td className={cx('code')}>
                                        <span className={cx('codeText')}>
                                            {item.code}
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
                                                item.durationValue
                                            )}
                                        </span>
                                    </td>

                                    <td>
                                        <div className={cx('chipList')}>
                                            {item.benefits.length > 0 ? (
                                                item.benefits.map((benefit) => (
                                                    <span
                                                        key={`${item.id}-${benefit}`}
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
                                                    : 'statusPaused'
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