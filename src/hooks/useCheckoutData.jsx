//tải dữ liệu plan/add-on checkout.
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { config } from '~/config';
import { getUpgradeOptionsByPackageId } from '~/services/upgrade.service';

export default function useCheckoutData({ normalizedPackageId, checkoutAddOnId, navigate }) {
    const [isCheckoutLoading, setIsCheckoutLoading] = useState(true);
    const [checkoutData, setCheckoutData] = useState({
        plan: null,
        addOn: null,
    });

    useEffect(() => {
        let isMounted = true;

        const loadCheckoutData = async () => {
            if (!normalizedPackageId) {
                toast.error('Mã gói thanh toán không hợp lệ.');
                navigate(config.router.upgradePremium, { replace: true });
                return;
            }

            setIsCheckoutLoading(true);

            const result = await getUpgradeOptionsByPackageId(normalizedPackageId);

            if (!isMounted) {
                return;
            }

            const plan = result?.data?.plan || null;
            const addOns = Array.isArray(result?.data?.addOns) ? result.data.addOns : [];
            const selectedAddOn = checkoutAddOnId ? addOns.find((item) => item.id === checkoutAddOnId) || null : null;

            if (!plan?.id) {
                toast.error(result?.message || 'Không thể tải thông tin gói thanh toán.');
                navigate(config.router.upgradePremium, { replace: true });
                return;
            }

            if (checkoutAddOnId && !selectedAddOn) {
                toast.warning('Add-on đã chọn không còn khả dụng. Hệ thống sẽ thanh toán theo gói chính.');
            }

            if (!result?.success) {
                toast.warning(result?.message || 'Không lấy được dữ liệu mới nhất từ hệ thống, đang dùng dữ liệu dự phòng.');
            }

            setCheckoutData({
                plan,
                addOn: selectedAddOn,
            });
            setIsCheckoutLoading(false);
        };

        loadCheckoutData().catch((error) => {
            if (isMounted) {
                setIsCheckoutLoading(false);
                toast.error(error?.message || 'Không thể tải dữ liệu thanh toán.');
            }
        });

        return () => {
            isMounted = false;
        };
    }, [checkoutAddOnId, navigate, normalizedPackageId]);

    return {
        isCheckoutLoading,
        checkoutData,
    };
}
