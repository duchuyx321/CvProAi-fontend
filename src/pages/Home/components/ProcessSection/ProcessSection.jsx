import classNames from 'classnames/bind';
import styles from './ProcessSection.module.scss';

const cx = classNames.bind(styles);

const STEPS = [
    { id: 1, label: 'Tạo CV', desc: 'Điền thông tin vào các mẫu có sẵn' },
    { id: 2, label: 'Nhập JD', desc: 'Dán mô tả công việc đang ứng tuyển' },
    { id: 3, label: 'AI phân tích', desc: 'Nhận kết quả đánh giá trong vài giây' },
    { id: 4, label: 'Xuất CV', desc: 'Tải file PDF và ứng tuyển' },
];

function ProcessSection() {
    const lastIndex = STEPS.length - 1;

    return (
        <section className={cx('wrapper')}>
            <div className={cx('inner')}>
                <div className={cx('header')}>
                    <h2 className={cx('title')}>Quy trình 4 bước đơn giản</h2>
                </div>

                <div className={cx('steps')}>
                    {STEPS.map((step, index) => (
                        <div key={step.id} className={cx('step')}>
                            <div className={cx('top')}>
                                <div className={cx('line', { lineInvisible: index === 0 })} />

                                <div className={cx('circle')}>{step.id}</div>

                                <div className={cx('line', { lineInvisible: index === lastIndex })} />
                            </div>

                            <p className={cx('label')}>{step.label}</p>
                            <p className={cx('note')}>{step.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default ProcessSection;