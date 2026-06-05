import classNames from 'classnames/bind';
import { useNavigate } from 'react-router-dom';

import Button from '~/components/Button';
import { config } from '~/config';
import styles from './TemplateInfoPanel.module.scss';

const cx = classNames.bind(styles);

function TemplateInfoPanel({
    templateDetail = {},
    submitting = false,
    onCreateCv,
}) {
    const navigate = useNavigate();

    const {
        name = 'Mẫu CV',
        description = 'Xem trước mẫu CV và bắt đầu tạo CV theo phong cách bạn đã chọn.',
        category = 'Chưa phân loại',
        layout_key = '',
    } = templateDetail;

    return (
        <aside className={cx('wrapper')}>
            <div className={cx('box')}>
                <h1 className={cx('title')}>{name}</h1>

                {description ? (
                    <p className={cx('desc')}>{description}</p>
                ) : null}

                <div className={cx('meta')}>
                    <span className={cx('tag')}>{category}</span>

                    {layout_key ? (
                        <span className={cx('tag')}>{layout_key}</span>
                    ) : null}
                </div>
            </div>

            <div className={cx('box')}>
                <h2 className={cx('subTitle')}>Tạo CV từ</h2>

                <div className={cx('option', 'active')}>
                    <span className={cx('dot')}></span>

                    <div>
                        <p className={cx('optionTitle')}>
                            Nội dung CV mẫu gợi ý
                        </p>

                        <p className={cx('optionText')}>
                            Khởi tạo nhanh dữ liệu mẫu để bạn chỉnh sửa ngay.
                        </p>
                    </div>
                </div>

                <div className={cx('option')}>
                    <span className={cx('dot')}></span>

                    <div>
                        <p className={cx('optionTitle')}>Tạo CV từ đầu</p>

                        <p className={cx('optionText')}>
                            Bắt đầu với khung CV trắng không có nội dung.
                        </p>
                    </div>
                </div>
            </div>

            <div className={cx('actions')}>
                <Button
                    primary
                    type="button"
                    className={cx('btnPrimary')}
                    onClick={onCreateCv}
                    disabled={submitting}
                >
                    {submitting ? 'Đang tạo CV...' : 'Tạo CV'}
                </Button>

                <Button
                    outline
                    type="button"
                    className={cx('btnSecondary')}
                    onClick={() => navigate(config.router.cvTemplates)}
                >
                    Quay lại danh sách mẫu
                </Button>
            </div>
        </aside>
    );
}
export default TemplateInfoPanel;