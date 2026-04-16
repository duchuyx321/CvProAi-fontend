import classNames from 'classnames/bind';
import styles from './CardItemCV.module.scss';
import Image from '~/components/Image';

import { Link } from 'react-router-dom';

const cx = classNames.bind(styles);

function CardItemCV({ data = {} }) {
    return (
        <div className={cx('wrapper')} key={data.id}>
            <div className={cx('image')}>
                <Image src="sdfasdf" alt="ảnh nền cv" />
            </div>
            <Link large className={cx('btn_next')}>
                <h3>CV của tôi 01dsfasbhjdfsdjfhhsadjfádfsadfsa</h3>
            </Link>
        </div>
    );
}

export default CardItemCV;
