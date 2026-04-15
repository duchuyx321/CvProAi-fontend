import classNames from 'classnames/bind';
import {
    FiCheck,
    FiDownload,
    FiEye,
    FiFileText,
    FiMapPin,
} from 'react-icons/fi';

import styles from './SavedCVList.module.scss';

const cx = classNames.bind(styles);

const formatDisplayDate = (dateString) => {
    if (!dateString) return 'Chưa có dữ liệu';

    const [year, month, day] = dateString.split('-');

    if (!year || !month || !day) return dateString;

    return `${day}/${month}/${year}`;
};

function SavedCVList({
    savedCVs = [],
    loadingSavedCVs = false,
    selectedCV,
    onSelectSavedCV,
    onPreviewCV,
    onDownloadCV,
}) {
    return (
        <section className={cx('savedSection')}>
            <div className={cx('savedSectionHeader')}>
                <div>
                    <h2 className={cx('savedSectionTitle')}>
                        Danh sách CV của tôi
                    </h2>

                    <p className={cx('savedSectionDesc')}>
                        Chọn một CV đã lưu trong hệ thống để phân tích nhanh.
                    </p>
                </div>

                <span className={cx('savedSectionCount')}>
                    {savedCVs.length} CV
                </span>
            </div>

            <div className={cx('savedSectionBody')}>
                {loadingSavedCVs ? (
                    <p className={cx('savedMessage')}>
                        Đang tải danh sách CV...
                    </p>
                ) : savedCVs.length === 0 ? (
                    <p className={cx('savedMessage')}>
                        Bạn chưa có CV nào trong hệ thống.
                    </p>
                ) : (
                    <div className={cx('savedGrid')}>
                        {savedCVs.map((cv) => {
                            const cvId = cv?.id ?? cv?.cvId ?? cv?._id;
                            const cvName =
                                cv?.fileName ||
                                cv?.title ||
                                cv?.name ||
                                cv?.originalFileName ||
                                'CV chưa đặt tên';

                            const isActive =
                                selectedCV?.source === 'saved' &&
                                selectedCV?.id === cvId;

                            return (
                                <article
                                    key={cvId || cvName}
                                    className={cx('savedCard', {
                                        active: isActive,
                                    })}
                                >
                                    <div className={cx('savedCardTop')}>
                                        <span className={cx('savedCardIcon')}>
                                            <FiFileText />
                                        </span>

                                        {isActive ? (
                                            <span
                                                className={cx('savedCardCheck')}
                                            >
                                                <FiCheck />
                                            </span>
                                        ) : null}
                                    </div>

                                    <div className={cx('savedCardInfo')}>
                                        <h3 className={cx('savedCardName')}>
                                            {cvName}
                                        </h3>

                                        <div className={cx('savedCardTags')}>
                                            <span className={cx('savedCardTag')}>
                                                {cv.role}
                                            </span>

                                            <span
                                                className={cx(
                                                    'savedCardTag',
                                                    'muted',
                                                )}
                                            >
                                                {cv.level}
                                            </span>
                                        </div>

                                        <p className={cx('savedCardMeta')}>
                                            <FiMapPin />
                                            <span>{cv.location}</span>
                                        </p>

                                        <p className={cx('savedCardDate')}>
                                            Cập nhật:{' '}
                                            {formatDisplayDate(cv.updatedAt)}
                                        </p>
                                    </div>

                                    <div className={cx('savedCardActions')}>
                                        <button
                                            type="button"
                                            className={cx('ghostAction')}
                                            onClick={(e) =>
                                                onPreviewCV(cv, e)
                                            }
                                            aria-label={`Xem trước ${cvName}`}
                                        >
                                            <FiEye />
                                        </button>

                                        <button
                                            type="button"
                                            className={cx('ghostAction')}
                                            onClick={(e) =>
                                                onDownloadCV(cv, e)
                                            }
                                            aria-label={`Tải xuống ${cvName}`}
                                        >
                                            <FiDownload />
                                        </button>

                                        <button
                                            type="button"
                                            className={cx('primaryAction')}
                                            onClick={() => onSelectSavedCV(cv)}
                                        >
                                            Chọn CV này
                                        </button>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </div>
        </section>
    );
}

export default SavedCVList;