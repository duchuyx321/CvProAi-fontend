import classNames from 'classnames/bind';
import HeaderDefault from '../components/HeaderDefault';
import styles from './PublicLayout.module.scss';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import FooterDefault from '../components/FooterDefault';
const cx = classNames.bind(styles);

function PublicLayout({ children, hideHeader = false, hideFooter = false }) {
    return (
        <div className={cx('wrapper')}>
            {!hideHeader && <HeaderDefault />}
            <ToastContainer position="top-right" autoClose={2500} />
            <main className={cx('content', { 'content--full': hideHeader })}>
                {children}
            </main>
            {!hideFooter && <FooterDefault />}
        </div>
    );
}

export default PublicLayout;
