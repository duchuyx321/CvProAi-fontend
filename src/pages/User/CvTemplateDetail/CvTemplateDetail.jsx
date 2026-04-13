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

                // const result = await getCvTemplateDetail(code);
                const result = {
                    success: true,
                    messsage: 'Lấy mẫu cv thành công',
                    data: {
                        id: '29713ded-64c6-4af0-b11a-1323f3a51eb3',
                        code: 'DEV_01',
                        name: 'Mẫu CV đơn giản cho Dev 01',
                        preview_url:
                            'https://res.cloudinary.com/djzsbcrk9/image/upload/v1775665562/cvproai/lbglt6pqbmazd9thj3jf.webp',
                        is_premium: false,
                        config: {
                            theme: {
                                colors: {
                                    accent: '#EAF3FC',
                                    primary: '#3F73A7',
                                },
                                prefix: '//',
                                spacing: {
                                    itemGap: 12,
                                    sectionGap: 24,
                                },
                                fontFamily: 'Inter',
                            },
                            zones: {
                                left_col: [
                                    'profile',
                                    'contact',
                                    'skills',
                                    'additional',
                                ],
                                right_col: [
                                    'summary',
                                    'education',
                                    'experience',
                                ],
                            },
                            layout: {
                                key: 'split_blue_dev',
                                body: {
                                    layout: 'SPLIT',
                                    columns: [
                                        {
                                            id: 'left_col',
                                            width: 33,
                                        },
                                        {
                                            id: 'right_col',
                                            width: 67,
                                        },
                                    ],
                                },
                                page: {
                                    size: 'A4',
                                    margin: {
                                        top: 12,
                                        left: 12,
                                        right: 12,
                                        bottom: 12,
                                    },
                                },
                            },
                            version: 1,
                            sections: {
                                skills: {
                                    type: 'SKILLS',
                                    title: 'Các Kỹ Năng',
                                    fields: ['name', 'description'],
                                    variant: 'sidebar_box_richtext',
                                },
                                contact: {
                                    type: 'CONTACT',
                                    title: 'Thông Tin Liên Hệ',
                                    fields: [
                                        'birth_date',
                                        'email',
                                        'website',
                                        'phone',
                                        'address',
                                    ],
                                    variant: 'icon_list',
                                },
                                profile: {
                                    type: 'profile_header',
                                    title: '',
                                    fields: [
                                        'avatar_url',
                                        'headline',
                                        'full_name',
                                    ],
                                    variant: 'sidebar_avatar_badge_name',
                                },
                                summary: {
                                    type: 'SUMMARY',
                                    title: 'Mục Tiêu Nghề Nghiệp',
                                    fields: ['SUMMARY'],
                                    variant: 'content_box_richtext',
                                },
                                education: {
                                    type: 'EDUCATION',
                                    title: 'Học Vấn',
                                    fields: [
                                        {
                                            items: [
                                                {
                                                    items: [
                                                        'degree',
                                                        'school',
                                                        'description',
                                                    ],
                                                    layout: 'STACK',
                                                },
                                                {
                                                    items: [
                                                        'start_date',
                                                        'end_date',
                                                        'is_current',
                                                    ],
                                                    layout: 'STACK',
                                                },
                                            ],
                                            layout: 'SPLIT',
                                        },
                                    ],
                                    variant: 'card_right_date_badge',
                                },
                                additional: {
                                    type: 'ADDITIONAL',
                                    title: 'Thông Tin Thêm',
                                    fields: ['content'],
                                    variant: 'sidebar_box_richtext',
                                },
                                experience: {
                                    type: 'EXPERIENCE',
                                    title: 'Kinh Nghiệm Làm Việc',
                                    fields: [
                                        {
                                            items: [
                                                {
                                                    items: [
                                                        'role',
                                                        'company',
                                                        'description',
                                                    ],
                                                    layout: 'STACK',
                                                },
                                                {
                                                    items: [
                                                        'start_date',
                                                        'end_date',
                                                        'is_current',
                                                    ],
                                                    layout: 'STACK',
                                                },
                                            ],
                                            layout: 'SPLIT',
                                        },
                                    ],
                                    variant: 'card_right_date_badge',
                                },
                            },
                        },
                        created_at: '2026-04-08T03:42:24.278Z',
                    },
                    date: '09:17:01 13/4/2026',
                    path: '/api/v1/cv-templates/code/DEV_01',
                };
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
