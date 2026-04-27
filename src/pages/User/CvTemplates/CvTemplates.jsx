import { useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import { toast } from 'react-toastify';

import { getCvTemplates } from '~/services/cv-teamplate.service';
import {
    getApiMessage,
    unwrapApiResponse,
} from '~/utils/api-response.utils';
import TemplateCard from './components/TemplateCard';
import styles from './CvTemplates.module.scss';

const cx = classNames.bind(styles);

function CvTemplates() {
    const [loading, setLoading] = useState(false);
    const [templateList, setTemplateList] = useState([]);

    useEffect(() => {
        const fetchTemplates = async () => {
            try {
                setLoading(true);

                const result = await getCvTemplates();

                if (!result?.success) {
                    throw new Error(
                        getApiMessage(result, 'Không thể tải danh sách mẫu CV'),
                    );
                }

                const templates = unwrapApiResponse(result, []);
                setTemplateList(
                    Array.isArray(templates)
                        ? templates
                        : templates?.items || templates?.data || [],
                );
            } catch (error) {
                toast.error(
                    error?.message || 'Có lỗi xảy ra, vui lòng thử lại sau',
                );
            } finally {
                setLoading(false);
            }
        };

        fetchTemplates();
    }, []);

    return (
        <section className={cx('wrapper')}>
            <div className={cx('inner')}>
                <div className={cx('header')}>
                    <h1 className={cx('title')}>Mẫu CV xin việc</h1>
                    <p className={cx('desc')}>
                        Chọn mẫu CV phù hợp để bắt đầu tạo hồ sơ chuyên nghiệp.
                    </p>
                </div>

                <div className={cx('grid')}>
                    {loading ? (
                        <p className={cx('empty')}>Đang tải dữ liệu...</p>
                    ) : null}

                    {!loading && !templateList.length ? (
                        <p className={cx('empty')}>Chưa có mẫu CV nào</p>
                    ) : null}

                    {!loading &&
                        templateList.map((template) => (
                            <TemplateCard
                                key={template.id}
                                template={template}
                            />
                        ))}
                </div>
            </div>
        </section>
    );
}

export default CvTemplates;
