import classNames from 'classnames/bind';
import SidebarDefault from '~/layouts/components/SidebarDefault';
import HeaderDefault from '../components/HeaderDefault';
import styles from './DefaultLayout.module.scss';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const cx = classNames.bind(styles);

function DefaultLayout({ children }) {
  return (
    <div className={cx('wrapper')}>
      <SidebarDefault className={cx('sidebar')} />
      
  
      <div className={cx('container')}>
        <HeaderDefault className={cx('header')} />
        <ToastContainer position="top-right" autoClose={2500} />
        <main className={cx('content')}>
          {children} 
        </main>
      </div>
    </div>
  );
}

export default DefaultLayout;