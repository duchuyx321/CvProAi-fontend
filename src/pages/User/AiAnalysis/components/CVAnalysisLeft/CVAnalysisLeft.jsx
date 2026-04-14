import classNames from 'classnames/bind';

import CVUploadCard from '../CVUploadCard';
import styles from './CVAnalysisLeft.module.scss';

const cx = classNames.bind(styles);

function CVAnalysisLeft({
    selectedCV,
    savedCVs,
    loadingSavedCVs,
    onSelectSavedCV,
    onUploadLocalCV,
}) {
    return (
        <div className={cx('wrapper')}>
            <CVUploadCard
                selectedCV={selectedCV}
                savedCVs={savedCVs}
                loadingSavedCVs={loadingSavedCVs}
                onSelectSavedCV={onSelectSavedCV}
                onUploadLocalCV={onUploadLocalCV}
            />

            <div className={cx('tipCard')}>
                <h2 className={cx('title')}>Mẹo từ chuyên gia</h2>

                <p className={cx('description')}>
                    Đảm bảo CV của bạn ở định dạng PDF và văn bản có thể quét được
                    để AI đạt kết quả chính xác nhất.
                </p>
            </div>
        </div>
    );
}

export default CVAnalysisLeft;