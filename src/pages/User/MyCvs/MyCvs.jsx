import classNames from 'classnames/bind';
import styles from '~/pages/User/MyCvs/MyCvs.module.scss';
import CardItemCV from './components/CardItemCV';
import { useState } from 'react';

const cx = classNames.bind(styles);
function MyCvs() {
    const [resultMyCV, setResultMyCv] = useState([1, 1, 1, 1, 1, 1, 1, 1]);
    return (
        <div className={cx('wrapper')}>
            <header>
                <h3>CV của tôi</h3>
                <p>Quản lý và tối ưu hóa các bản CV chuyên nghiệp của bạn</p>
            </header>
            <div className={cx('body')}>
                {resultMyCV.map((item, index) => (
                    <CardItemCV key={index} />
                ))}
            </div>
        </div>
    );
}

export default MyCvs;
