import { useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

import { config } from '~/config';

import { getCvTemplateDetail } from '~/services/cv-teamplate.service';
import TemplateInfoPanel from './components/TemplateInfoPanel';
import styles from './CvTemplateDetail.module.scss';
import CvPreview from '~/components/CvPreview/CvPreview';

const cx = classNames.bind(styles);

function CvTemplateDetail() {
    const navigate = useNavigate();
    const { code } = useParams();

    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [templateDetail, setTemplateDetail] = useState(null);

    useEffect(() => {
        const fetchTemplateDetail = async () => {
            try {
                setLoading(true);

                const result = await getCvTemplateDetail(code);

                setTemplateDetail(result.data);
            } catch (error) {
                toast.error(
                    error?.message || 'Có lỗi xảy ra, vui lòng thử lại sau',
                );
            } finally {
                setLoading(false);
            }
        };

        if (code) {
            fetchTemplateDetail();
        }
    }, [code]);

    const handleCreateCv = async () => {
        const isLoggedIn = Boolean(localStorage.getItem('accessToken'));

        if (!isLoggedIn) {
            navigate(config.router.login);
            return;
        }

        try {
            setSubmitting(true);

            navigate(
                config.router.cvEditor.replace(':code', templateDetail?.code),
            );
        } catch (error) {
            toast.error(
                error?.message || 'Có lỗi xảy ra, vui lòng thử lại sau',
            );
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <section className={cx('wrapper')}>
                <div className={cx('inner')}>
                    <p className={cx('empty')}>Đang tải dữ liệu...</p>
                </div>
            </section>
        );
    }

    if (!templateDetail) {
        return (
            <section className={cx('wrapper')}>
                <div className={cx('inner')}>
                    <p className={cx('empty')}>Không tìm thấy mẫu CV</p>
                </div>
            </section>
        );
    }

    return (
        <section className={cx('wrapper')}>
            <div className={cx('inner')}>
                <div className={cx('main')}>
                    <div className={cx('preview')}>
                        <CvPreview
                            cv={templateDetail}
                            template={{
                                id: templateDetail?.template_id,
                                code:
                                    templateDetail?.template_code ||
                                    templateDetail?.code ||
                                    'DEV_01',
                                name: templateDetail?.title,
                                config: templateDetail?.config,
                            }}
                        />
                    </div>

                    <TemplateInfoPanel
                        templateDetail={templateDetail}
                        submitting={submitting}
                        onCreateCv={handleCreateCv}
                    />
                </div>
            </div>
        </section>
    );
}

export default CvTemplateDetail;
