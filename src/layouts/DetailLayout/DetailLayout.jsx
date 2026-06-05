import { useNavigate, Link } from 'react-router-dom';
import classNames from 'classnames/bind';
import { FaArrowLeft } from 'react-icons/fa';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { config } from '~/config';
import images from '~/assets';
import styles from './DetailLayout.module.scss';

const cx = classNames.bind(styles);

function DetailLayout({ children }) {
    const navigate = useNavigate();

    const handleOnBack = () => {
        navigate(-1);
    };

    return (
        <div className={cx('wrapper')}>
            <ToastContainer position="top-right" autoClose={2500} />

            <header className={cx('header')}>
                <div className={cx('inner')}>
                    <button
                        type="button"
                        onClick={handleOnBack}
                        className={cx('btn-back')}
                    >
                        <FaArrowLeft className={cx('btn-icon')} />
                    </button>

                    <h1 className={cx('logo')}>
                        <Link to={config.router.home} className={cx('logo-link')}>
                            <img
                                src={images.logo}
                                alt="CvProAI Logo"
                                className={cx('logo-img')}
                            />
                            <div className={cx('logo-texts')}>
                                <span className={cx('logo-name')}>CvProAI</span>
                                <span className={cx('logo-sub')}>
                                    Hệ thống tạo CV bằng AI
                                </span>
                            </div>
                        </Link>
                    </h1>
                </div>
            </header>
            <main className={cx('content')}>{children}</main>
        </div>
    );
}

export default DetailLayout;