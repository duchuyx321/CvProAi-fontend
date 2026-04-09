import classNames from 'classnames/bind';
import { useNavigate } from 'react-router-dom';

import { config } from '~/config';
import styles from './TemplateCard.module.scss';

const cx = classNames.bind(styles);

function TemplateCard({ template = {} }) {
    const navigate = useNavigate();

    const {
        code = '',
        name = 'Mẫu CV',
        category = 'Chưa phân loại',
        layout_key = '',
        preview_url = '',
        is_new = false,
        description = '',
    } = template;

    const handleViewDetail = () => {
        navigate(config.router.CvTemplateDetail.replace(':code', code));
    };

    return (
        <article className={cx('wrapper')}>
            <div className={cx('thumbWrap')}>
                {is_new ? <span className={cx('badge')}>Mới</span> : null}
                <div className={cx('thumb')}>
                    <img src={preview_url} alt={name} />
                </div>

                <div className={cx('overlay')}>
                    <button
                        type="button"
                        className={cx('viewBtn')}
                        onClick={handleViewDetail}
                    >
                        Xem mẫu
                    </button>
                </div>
            </div>

            <div className={cx('content')}>
                <h2 className={cx('name')}>{name}</h2>

                {description ? (
                    <p className={cx('description')}>{description}</p>
                ) : null}

                <div className={cx('meta')}>
                    <span className={cx('tag')}>{category}</span>

                    {layout_key ? (
                        <span className={cx('tag')}>{layout_key}</span>
                    ) : null}
                </div>
            </div>
        </article>
    );
}

export default TemplateCard;
