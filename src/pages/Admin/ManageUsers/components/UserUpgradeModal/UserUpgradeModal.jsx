import { useEffect, useMemo, useState } from 'react';
import classNames from 'classnames/bind';
import { Check, LoaderCircle, Sparkles, UserRound } from 'lucide-react';
import { toast } from 'react-toastify';

import Modal from '~/components/Modal';
import {
    getAdminAddonPackages,
    getAdminPlans,
    updateAdminUserSubscription,
} from '~/services/admin-user.service';
import { formatCurrency } from '../../manageUsers.utils';
import {
    buildUpgradePayload,
    getApiErrorMessage,
    getCurrentPlanInfo,
    getPlanFeatureList,
    getResultArray,
    isApiError,
    isCurrentPlan,
    normalizeAddon,
    normalizePlan,
} from './userUpgradeModal.utils';
import styles from './UserUpgradeModal.module.scss';

const cx = classNames.bind(styles);

function UserUpgradeModal({ isOpen, onClose, user, onSuccess }) {
    const [plans, setPlans] = useState([]);
    const [addons, setAddons] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedPlanId, setSelectedPlanId] = useState('');
    const [selectedAddonId, setSelectedAddonId] = useState('');
    const [providerTransactionId, setProviderTransactionId] = useState('');
    const [reason, setReason] = useState('');

    const currentPlan = useMemo(() => getCurrentPlanInfo(user), [user]);

    const selectedPlan = useMemo(
        () => plans.find((plan) => plan.id === selectedPlanId) || null,
        [plans, selectedPlanId],
    );

    const selectedAddon = useMemo(
        () => addons.find((addon) => addon.id === selectedAddonId) || null,
        [addons, selectedAddonId],
    );

    const canSubmit =
        Boolean(selectedPlanId) && !loading && !isSubmitting;

    useEffect(() => {
        if (!isOpen) {
            setPlans([]);
            setAddons([]);
            setSelectedPlanId('');
            setSelectedAddonId('');
            setProviderTransactionId('');
            setReason('');
            return;
        }

        let ignore = false;

        const fetchPackages = async () => {
            try {
                setLoading(true);

                const [plansResult, addonsResult] = await Promise.all([
                    getAdminPlans(),
                    getAdminAddonPackages({
                        page: 1,
                        limit: 20,
                        search: '',
                        sort_by: 'createdAt',
                        sort_order: 'ASC',
                    }),
                ]);

                if (ignore) return;

                if (isApiError(plansResult)) {
                    throw new Error(
                        getApiErrorMessage(
                            plansResult,
                            'Không thể tải danh sách gói dịch vụ',
                        ),
                    );
                }

                const nextPlans = getResultArray(plansResult)
                    .map(normalizePlan)
                    .filter((plan) => plan.id && plan.isActive);

                let nextAddons = [];

                if (isApiError(addonsResult)) {
                    toast.warn(
                        getApiErrorMessage(
                            addonsResult,
                            'Không thể tải danh sách gói mua thêm',
                        ),
                    );
                } else {
                    nextAddons = getResultArray(addonsResult)
                        .map(normalizeAddon)
                        .filter((addon) => addon.id && addon.isActive);
                }

                setPlans(nextPlans);
                setAddons(nextAddons);
                setSelectedPlanId('');
                setSelectedAddonId('');
            } catch (error) {
                if (!ignore) {
                    setPlans([]);
                    setAddons([]);
                    toast.error(
                        error?.message || 'Không thể tải danh sách gói',
                    );
                }
            } finally {
                if (!ignore) {
                    setLoading(false);
                }
            }
        };

        fetchPackages();

        return () => {
            ignore = true;
        };
    }, [isOpen]);

    const handleSelectPlan = (plan) => {
        if (!plan?.id || isCurrentPlan(plan, currentPlan) || isSubmitting) {
            return;
        }

        setSelectedPlanId(plan.id);
        setSelectedAddonId('');
    };

    const handleSubmit = async (event) => {
        event?.preventDefault?.();

        if (!user?.id || !selectedPlanId || isSubmitting) {
            return;
        }

        try {
            setIsSubmitting(true);

            const response = await updateAdminUserSubscription(
                user.id,
                buildUpgradePayload({
                    selectedPlanId,
                    selectedAddonId,
                    providerTransactionId: selectedPlan?.isFree ? undefined : providerTransactionId,
                    reason,
                }),
            );

            if (isApiError(response)) {
                throw new Error(
                    getApiErrorMessage(
                        response,
                        'Không thể cập nhật gói cho người dùng',
                    ),
                );
            }

            toast.success(`Đã cập nhật gói cho ${user?.fullName}`);
            onSuccess?.(user, response);
            onClose?.();
        } catch (error) {
            toast.error(
                error?.message || 'Không thể cập nhật gói cho người dùng',
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const footer = (
        <div className={cx('footerActions')}>
            <button
                type="button"
                className={cx('cancelBtn')}
                onClick={onClose}
                disabled={isSubmitting}
            >
                Hủy
            </button>
            <button
                type="button"
                className={cx('submitBtn')}
                onClick={handleSubmit}
                disabled={!canSubmit}
            >
                {isSubmitting ? <LoaderCircle className={cx('spinning')} /> : null}
                Cấp gói cho người dùng
            </button>
        </div>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={isSubmitting ? undefined : onClose}
            title="Cấp gói dịch vụ"
            size="xl"
            footer={footer}
            closeOnEsc={!isSubmitting}
            closeOnOverlayClick={!isSubmitting}
        >
            <div className={cx('body')}>
                {loading ? (
                    <div className={cx('loadingContainer')}>
                        <LoaderCircle className={cx('spinning')} />
                        <span>Đang tải danh sách gói...</span>
                    </div>
                ) : (
                    <form className={cx('form')} onSubmit={handleSubmit}>
                        <section className={cx('heroCard')}>
                            <div className={cx('userChip')}>
                                <span className={cx('userAvatar')}>
                                    <UserRound aria-hidden="true" />
                                </span>
                                <div className={cx('userText')}>
                                    <strong>{user?.fullName}</strong>
                                    <span>{user?.email}</span>
                                </div>
                            </div>

                            <div className={cx('heroMeta')}>
                                <span className={cx('metaLabel')}>
                                    Gói hiện tại
                                </span>
                                <strong>
                                    {currentPlan?.name || user?.planName || 'Chưa có'}
                                </strong>
                                <p>
                                    Không thể cấp lại đúng gói người dùng đang sử dụng.
                                </p>
                            </div>
                        </section>

                        <section className={cx('sectionCard')}>
                            <div className={cx('sectionHeading')}>
                                <div>
                                    <h3>Gói dịch vụ</h3>
                                    <p>
                                        Hiển thị tất cả gói đang hoạt động. Chọn một
                                        gói để cấp cho người dùng.
                                    </p>
                                </div>
                                {selectedPlan ? (
                                    <span className={cx('selectedBadge')}>
                                        Đã chọn {selectedPlan.name}
                                    </span>
                                ) : null}
                            </div>

                            {!plans.length ? (
                                <div className={cx('emptyState')}>
                                    Không có gói dịch vụ khả dụng.
                                </div>
                            ) : (
                                <div className={cx('planGrid')}>
                                    {plans.map((plan) => {
                                        const isCurrent = isCurrentPlan(
                                            plan,
                                            currentPlan,
                                        );
                                        const isSelected =
                                            selectedPlanId === plan.id;

                                        return (
                                            <button
                                                key={plan.id}
                                                type="button"
                                                className={cx('planCard', {
                                                    selected: isSelected,
                                                    current: isCurrent,
                                                })}
                                                onClick={() =>
                                                    handleSelectPlan(plan)
                                                }
                                                disabled={isCurrent || isSubmitting}
                                            >
                                                <div className={cx('cardTop')}>
                                                    <div>
                                                        <strong>{plan.name}</strong>
                                                        <span>
                                                            {plan.isFree
                                                                ? 'Miễn phí'
                                                                : formatCurrency(
                                                                    plan.price,
                                                                    plan.currency,
                                                                )}
                                                        </span>
                                                    </div>

                                                    {isSelected ? (
                                                        <span
                                                            className={cx(
                                                                'statePill',
                                                                'selectedPill',
                                                            )}
                                                        >
                                                            <Check size={14} />
                                                            Đã chọn
                                                        </span>
                                                    ) : null}

                                                    {isCurrent ? (
                                                        <span
                                                            className={cx(
                                                                'statePill',
                                                                'currentPill',
                                                            )}
                                                        >
                                                            Gói hiện tại
                                                        </span>
                                                    ) : null}
                                                </div>

                                                {plan.description ? (
                                                    <p className={cx('cardDescription')}>
                                                        {plan.description}
                                                    </p>
                                                ) : (
                                                    <p className={cx('cardDescription')}>
                                                        Cấp thủ công gói này cho
                                                        người dùng.
                                                    </p>
                                                )}

                                                <div className={cx('featureRow')}>
                                                    {getPlanFeatureList(plan).map(
                                                        (feature) => (
                                                            <span
                                                                key={`${plan.id}-${feature}`}
                                                                className={cx('featureChip')}
                                                            >
                                                                {feature}
                                                            </span>
                                                        ),
                                                    )}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </section>

                        <section className={cx('sectionCard', 'addonSection')}>
                            <div className={cx('sectionHeading')}>
                                <div>
                                    <h3>Gói mua thêm</h3>
                                    <p>
                                        Sau khi chọn gói dịch vụ, bạn có thể cấp
                                        thêm add-on AI hoặc bỏ qua phần này.
                                    </p>
                                </div>

                                {selectedPlan ? (
                                    <button
                                        type="button"
                                        className={cx('skipAddonBtn', {
                                            active: !selectedAddonId,
                                        })}
                                        onClick={() => setSelectedAddonId('')}
                                        disabled={isSubmitting}
                                    >
                                        Không cấp add-on
                                    </button>
                                ) : null}
                            </div>

                            {!selectedPlan ? (
                                <div className={cx('emptyState', 'waitingState')}>
                                    Chọn một gói dịch vụ trước để hiển thị danh sách
                                    add-on.
                                </div>
                            ) : selectedPlan.isFree ? (
                                <div className={cx('emptyState', 'waitingState')}>
                                    Gói Miễn phí không hỗ trợ mua thêm add-on.
                                </div>
                            ) : !addons.length ? (
                                <div className={cx('emptyState')}>
                                    Không có gói mua thêm khả dụng.
                                </div>
                            ) : (
                                <div className={cx('addonGrid')}>
                                    {addons.map((addon) => {
                                        const isSelected =
                                            selectedAddonId === addon.id;

                                        return (
                                            <button
                                                key={addon.id}
                                                type="button"
                                                className={cx('addonCard', {
                                                    selected: isSelected,
                                                })}
                                                onClick={() =>
                                                    setSelectedAddonId(
                                                        isSelected ? '' : addon.id,
                                                    )
                                                }
                                                disabled={isSubmitting}
                                            >
                                                <div className={cx('cardTop')}>
                                                    <div>
                                                        <strong>{addon.name}</strong>
                                                        <span>
                                                            {formatCurrency(
                                                                addon.price,
                                                                addon.currency,
                                                            )}
                                                        </span>
                                                    </div>

                                                    {isSelected ? (
                                                        <span
                                                            className={cx(
                                                                'statePill',
                                                                'selectedPill',
                                                            )}
                                                        >
                                                            <Sparkles size={14} />
                                                            Đã chọn
                                                        </span>
                                                    ) : null}
                                                </div>

                                                <p className={cx('cardDescription')}>
                                                    {addon.description ||
                                                        `Cộng thêm ${addon.runs} lượt phân tích AI.`}
                                                </p>

                                                <div className={cx('featureRow')}>
                                                    <span className={cx('featureChip')}>
                                                        +{addon.runs} lượt AI
                                                    </span>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </section>

                        <section className={cx('metaRow')}>
                            {!selectedPlan?.isFree ? (
                                <div className={cx('field')}>
                                    <label htmlFor="provider_transaction_id">
                                        Mã giao dịch
                                    </label>
                                    <input
                                        id="provider_transaction_id"
                                        className={cx('input')}
                                        placeholder="Tùy chọn"
                                        value={providerTransactionId}
                                        onChange={(event) =>
                                            setProviderTransactionId(
                                                event.target.value,
                                            )
                                        }
                                        disabled={isSubmitting}
                                    />
                                </div>
                            ) : null}

                            <div className={cx('field')}>
                                <label htmlFor="reason">Ghi chú</label>
                                <input
                                    id="reason"
                                    className={cx('input')}
                                    placeholder="Cấp gói thủ công từ admin"
                                    value={reason}
                                    onChange={(event) =>
                                        setReason(event.target.value)
                                    }
                                    disabled={isSubmitting}
                                />
                            </div>
                        </section>

                        {!selectedPlanId ? (
                            <p className={cx('formError')}>
                                Vui lòng chọn một gói dịch vụ để tiếp tục.
                            </p>
                        ) : null}

                        {selectedAddon ? (
                            <p className={cx('summaryText')}>
                                Sẽ cấp <strong>{selectedPlan?.name}</strong> kèm{' '}
                                <strong>{selectedAddon.name}</strong>.
                            </p>
                        ) : selectedPlan ? (
                            <p className={cx('summaryText')}>
                                Sẽ cấp <strong>{selectedPlan.name}</strong> cho
                                người dùng.
                            </p>
                        ) : null}
                    </form>
                )}
            </div>
        </Modal>
    );
}

export default UserUpgradeModal;
