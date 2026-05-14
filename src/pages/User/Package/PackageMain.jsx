import { useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import { toast } from 'react-toastify';

import PackageCard from './components/PackageCard';
import styles from './PackageMain.module.scss';

import { getProfile } from '~/services/profile.service';

const cx = classNames.bind(styles);

function PackageMain() {
    const [planCurrent, setPlanCurrent] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        const fetchProfile = async () => {
            try {
                setIsLoading(true);

                const result = await getProfile();

                if (result?.status >= 400 || result?.success === false) {
                    throw new Error(
                        result?.message ||
                            result?.messsage ||
                            'Không thể tải thông tin gói dịch vụ',
                    );
                }

                const nextPlanCurrent = result?.data?.planCurrent || null;

                if (!nextPlanCurrent) {
                    throw new Error('Không tìm thấy thông tin gói hiện tại');
                }

                if (!cancelled) {
                    setPlanCurrent(nextPlanCurrent);
                }
            } catch (error) {
                if (!cancelled) {
                    setPlanCurrent(null);
                    toast.error(
                        error?.response?.data?.message ||
                            error?.response?.data?.messsage ||
                            error?.message ||
                            'Có lỗi xảy ra, vui lòng thử lại sau',
                    );
                }
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        };

        fetchProfile();

        return () => {
            cancelled = true;
        };
    }, []);

    if (isLoading) {
        return (
            <div className={cx('wrapper')}>
                <p className={cx('loading')}>
                    Đang tải thông tin gói dịch vụ...
                </p>
            </div>
        );
    }

    if (!planCurrent) {
        return (
            <div className={cx('wrapper')}>
                <p className={cx('empty')}>Không có dữ liệu gói dịch vụ.</p>
            </div>
        );
    }

    return (
        <div className={cx('wrapper')}>
            <PackageCard plan={planCurrent} />
        </div>
    );
}

export default PackageMain;