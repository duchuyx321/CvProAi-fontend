import { useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

import Preview from '~/components/CvTemplate/Preview';
import { config } from '~/config';
import { createCvFromTemplate } from '~/services/cv-editor.service';
import { getCvTemplateDetail } from '~/services/cv-teamplate.service';
import TemplateInfoPanel from './components/TemplateInfoPanel';
import styles from './CvTemplateDetail.module.scss';

const cx = classNames.bind(styles);

function CvTemplateDetail() {
    const navigate = useNavigate();
    const { templateId } = useParams();

    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [templateDetail, setTemplateDetail] = useState(null);

    useEffect(() => {
        const fetchTemplateDetail = async () => {
            try {
                setLoading(true);

                const result = await getCvTemplateDetail(templateId);

                if (!result?.success) {
                    throw new Error(
                        result?.message || 'Không thể tải chi tiết mẫu CV',
                    );
                }

                setTemplateDetail(result?.data || null);
            } catch (error) {
                toast.error(
                    error?.message || 'Có lỗi xảy ra, vui lòng thử lại sau',
                );
            } finally {
                setLoading(false);
            }
        };

        if (templateId) {
            fetchTemplateDetail();
        }
    }, [templateId]);

    const handleCreateCv = async () => {
        const isLoggedIn = Boolean(localStorage.getItem('accessToken'));

        if (!isLoggedIn) {
            navigate(config.router.login);
            return;
        }

        try {
            setSubmitting(true);

            const result = await createCvFromTemplate(templateId);

            if (!result?.success) {
                throw new Error(result?.message || 'Không thể tạo CV');
            }

            const cvId = result?.data?.cv_id || result?.data?.id;

            if (!cvId) {
                throw new Error('Không nhận được mã CV');
            }

            navigate(config.router.cvEditor.replace(':cvId', cvId));
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
                <div className={cx('inner')}><p className={cx('empty')}>Không tìm thấy mẫu CV</p>
                </div>
            </section>
        );
    }

    return (
        <section className={cx('wrapper')}>
            <div className={cx('inner')}>
                <div className={cx('main')}>
                    <div className={cx('preview')}>
                        <Preview
                            resumeData={templateDetail?.sample_data || {}}
                            templateConfig={templateDetail?.template_config || {}}
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