import { useEffect, useMemo, useState } from 'react';
import classNames from 'classnames/bind';
import { MdVerified } from 'react-icons/md';
import { IoCheckmarkCircleOutline } from 'react-icons/io5';
import { toast } from 'react-toastify';

import Button from '~/components/Button';
import { getCurrentPackage, cancelPackageRenew } from '~/services/package.service';
import styles from './PackageMain.module.scss';

const cx = classNames.bind(styles);
// mock data, sẽ xóa khi có API
const MOCK_PACKAGE = {
    name: 'Gói Premium',
    desc: 'Bạn đang tận hưởng toàn bộ tính năng cao cấp của hệ thống CvProAI',
    price: '199.000đ',
    unit: '/ tháng',
    renewDate: '15/06/2026',
    status: 'active',
    benefits: [
        'Phân tích AI không giới hạn',
        'Xuất PDF không watermark',
        'Gợi ý nâng cao từ AI',
        'Hỗ trợ ưu tiên 24/7',
        'Truy cập tất cả các mẫu thiết kế',
    ],
};

function PackageMain() {
    const [packageInfo, setPackageInfo] = useState(MOCK_PACKAGE); 
    const [submitting, setSubmitting] = useState(false);

    const {
        name = '',
        desc = '',
        price = '',
        unit = '',
        renewDate = '',
        benefits = [],
        status = '',
    } = packageInfo || {};

    const benefitList = useMemo(() => {
        if (Array.isArray(benefits) && benefits.length) {
            return benefits;
        }
        return [];
    }, [benefits]);

    useEffect(() => {
        const fetchCurrentPackage = async () => {
            try {
                const result = await getCurrentPackage();

                if (!result?.success) {
                    throw new Error(
                        result?.message || 'Không thể tải thông tin gói dịch vụ',
                    );
                }

                setPackageInfo(result?.data || null);
            } catch (error) {
                toast.error(
                    error?.message || 'Có lỗi xảy ra, vui lòng thử lại sau',
                );
            }
        };

        fetchCurrentPackage();
    }, []);

    const handleCancelRenew = async () => {
        if (submitting) return;

        try {
            setSubmitting(true);

            const cancelPromise = cancelPackageRenew().then((result) => {
                if (!result?.success) {
                    throw new Error(
                        result?.message || 'Hủy gia hạn thất bại',
                    );
                }

                return result;
            });

            await toast.promise(cancelPromise, {
                pending: 'Đang xử lý...',
                success: {
                    render({ data }) {
                        return data?.message || 'Hủy gia hạn thành công';
                    },
                },
                error: {
                    render({ data }) {
                        return (
                            data?.message ||
                            'Có lỗi xảy ra, vui lòng thử lại sau'
                        );
                    },
                },
            });

            setPackageInfo((prev) => ({
                ...prev,
                status: 'cancelled',
            }));
        } catch {
            // toast.promise đã hiển thị lỗi rồi, không cần xử lý thêm
        } finally {
            setSubmitting(false);
        }
    };

    if (packageInfo === null) {
        return null;
    }

    if (!packageInfo?.name) {
        return (
            <div className={cx('wrapper')}>
                <section className={cx('card')}>
                    <p className={cx('empty')}>
                        Bạn chưa đăng ký gói dịch vụ nào
                    </p>
                </section>
            </div>
        );
    }

    return (
        <div className={cx('wrapper')}>
            <section className={cx('card')}>
                <div className={cx('head')}>
                    <div className={cx('titleWrap')}>
                        <h1 className={cx('title')}>{name}</h1>
                        <span className={cx('icon')}>
                            <MdVerified />
                        </span>
                    </div>

                    <p className={cx('desc')}>{desc}</p>
                </div>

                <div className={cx('priceBox')}>
                    <span className={cx('price')}>{price}</span>
                    <span className={cx('unit')}>{unit}</span>
                </div>

                <div className={cx('meta')}>
                    <span className={cx('metaLabel')}>Gia hạn tiếp theo :</span>
                    <span className={cx('metaValue')}>
                        {renewDate || 'Chưa cập nhật'}
                    </span>
                </div>

                {benefitList.length > 0 && (
                    <div className={cx('section')}>
                        <h2 className={cx('sectionTitle')}>Quyền lợi của bạn</h2>

                        <div className={cx('list')}>
                            {benefitList.map((item, index) => (
                                <div
                                    key={`${item}-${index}`}
                                    className={cx('item')}
                                >
                                    <span className={cx('itemIcon')}>
                                        <IoCheckmarkCircleOutline />
                                    </span>
                                    <span className={cx('itemText')}>{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className={cx('actions')}>
                    <Button
                        type="button"
                        className={cx('btnCancel', {
                            disabled: status === 'cancelled',
                        })}
                        onClick={handleCancelRenew}
                        disabled={submitting || status === 'cancelled'}
                    >
                        {status === 'cancelled' ? 'Đã hủy gia hạn' : 'Hủy gia hạn'}
                    </Button>
                </div>
            </section>
        </div>
    );
}

export default PackageMain;