import classNames from 'classnames/bind';
import { MdAutorenew, MdOutlineSave } from 'react-icons/md';
import Button from '~/components/Button';
import { BasicInfoSection, UsageSettingsSection } from './components';
import { useCreatePackageForm } from './hooks/useCreatePackageForm';
import styles from './CreatePackage.module.scss';

const cx = classNames.bind(styles);

function CreatePackage() {
    const {
        formData,
        errors,
        submitting,
        submitError,
        handleChangeField,
        handleToggleField,
        handleBack,
        handleSubmit,
    } = useCreatePackageForm();

    return (
        <div className={cx('wrapper')}>
            <div className={cx('heading')}>
                <h1 className={cx('title')}>Thêm gói dịch vụ mới</h1>
                <p className={cx('description')}>
                    Thiết lập các thông số và tính năng cho gói dịch vụ dành cho người dùng.
                </p>
            </div>

            <form className={cx('form')} onSubmit={handleSubmit} noValidate>
                <div className={cx('contentGrid')}>
                    <BasicInfoSection
                        formData={formData}
                        errors={errors}
                        disabled={submitting}
                        onChangeField={handleChangeField}
                    />

                    <UsageSettingsSection
                        formData={formData}
                        errors={errors}
                        disabled={submitting}
                        onChangeField={handleChangeField}
                        onToggleField={handleToggleField}
                    />
                </div>

                <div className={cx('footer')}>
                    <div className={cx('feedbackWrap')} aria-live="polite">
                        {submitError && (
                            <p className={cx('feedback', 'errorFeedback')}>{submitError}</p>
                        )}
                    </div>

                    <div className={cx('actionGroup')}>
                        <Button
                            type="button"
                            outlineText
                            onClick={handleBack}
                            disabled={submitting}
                        >
                            Hủy
                        </Button>

                        <Button
                            primary
                            type="submit"
                            leftIcon={submitting ? <MdAutorenew className={cx('loadingIcon')} /> : <MdOutlineSave />}
                            disabled={submitting}
                        >
                            {submitting ? 'Đang lưu...' : 'Lưu gói dịch vụ'}
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
}

export default CreatePackage;
