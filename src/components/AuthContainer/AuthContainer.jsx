import classNames from 'classnames/bind';

import styles from './AuthContainer.module.scss';
import Left from './components/Left';
import Right from './components/Right';


const cx = classNames.bind(styles);

function AuthContainer({
    id,
    title,
    textMenuAuth,
    desc,
    childrenLeft,
    childrenRight,
}) {
    return (
        <section className={cx('wrapper')}>
            <div className={cx('container')}>
                <Left
                    id={id}
                    title={title}
                    textMenuAuth={textMenuAuth}
                    desc={desc}
                    className={cx('left')}
                >
                    {childrenLeft}
                </Left>

                <Right
                    className={"right"}
                >
                    {childrenRight}
                </Right>

            </div>
        </section>
    );
}

export default AuthContainer;