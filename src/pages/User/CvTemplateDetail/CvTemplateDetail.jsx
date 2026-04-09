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
import CvPreview from '~/components/CvPreview/CvPreview';
import { getMockContent } from '~/components/CvPreview/utils/mockContent';

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

                // const result = await getCvTemplateDetail(templateId);

                // if (!result?.success) {
                //     throw new Error(
                //         result?.message || 'Không thể tải chi tiết mẫu CV',
                //     );
                // }
                const result = {
                   
                        "success": true,
                        "messsage": "Lấy dữ liệu CV thành công.",
                        "data": {
                            "id": "8d416d05-abab-4fed-a868-249e994bec4d",
                            "user_id": "c0ca274b-2722-4755-99bb-9e249b3d3dce",
                            "template_id": "29713ded-64c6-4af0-b11a-1323f3a51eb3",
                            "title": "CV Backend Developer Intern - Lê Đức Huy",
                            "language": "vi",
                            "preview_url": "http://res.cloudinary.com/djzsbcrk9/image/upload/v1775665562/cvproai/lbglt6pqbmazd9thj3jf.webp",
                            "status": "DRAFT",
                            "visibility": "PRIVATE",
                            "slug": "cv-backend-developer-intern-le-duc-huy",
                            "content": {
                                "profile_header": {
                                    "headline": "",
                                    "full_name": "",
                                    "avatar_url": "http://res.cloudinary.com/djzsbcrk9/image/upload/v1775665562/cvproai/gk3gemyc8ydzzvcm4epa.jpg"
                                }
                            },
                            "createdAt": "2026-04-08T15:40:37.727Z",
                            "updatedAt": "2026-04-08T17:05:23.219Z",
                            "config": {
                                "theme": {
                                    "colors": {
                                        "accent": "#4fd1c5",
                                        "primary": "#008080"
                                    },
                                    "spacing": {
                                        "itemGap": 12,
                                        "sectionGap": 25
                                    },
                                    "fontFamily": "Inter"
                                },
                                "zones": {
                                    "main_col": [
                                        "EXPERIENCE",
                                        "EDUCATION",
                                        "PROJECTS"
                                    ],
                                    "side_col": [
                                        "profile_header",
                                        "CONTACT",
                                        "SKILLS"
                                    ]
                                },
                                "layout": {
                                    "key": "SPLIT",
                                    "body": {
                                        "layout": "SPLIT",
                                        "columns": [
                                            {
                                                "id": "side_col",
                                                "width": 30
                                            },
                                            {
                                                "id": "main_col",
                                                "width": 70
                                            }
                                        ]
                                    },
                                    "page": {
                                        "size": "A4",
                                        "margin": {
                                            "top": 20,
                                            "left": 20,
                                            "right": 20,
                                            "bottom": 20
                                        }
                                    }
                                },
                                "version": 1,
                                "sections": {
                                    "SKILLS": {
                                        "type": "SKILLS",
                                        "title": "Kỹ năng",
                                        "variant": "progress_bar"
                                    },
                                    "CONTACT": {
                                        "type": "CONTACT",
                                        "title": "Liên hệ",
                                        "variant": "icon_list"
                                    },
                                    "EXPERIENCE": {
                                        "type": "EXPERIENCE",
                                        "title": "Kinh nghiệm",
                                        "variant": "timeline"
                                    },
                    "profile_header": {
                                        "type": "profile_header",
                                        "title": "Thông tin cá nhân",
                                        "fields": [
                                            {
                                                "items": [
                                                    "avatar_url",
                                                    {
                                                        "items": [
                                                            "full_name",
                                                            "headline"
                                                        ],
                                                        "layout": "COLUMN"
                                                    }
                                                ],
                                                "layout": "ROW"
                                            }
                                        ],
                                        "styles": "text-align-left"
                                    }
                                }
                            }
                       
                        }
                }

                setTemplateDetail(result);
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
                        {/* <Preview
                            resumeData={templateDetail?.sample_data || {}}
                            templateConfig={templateDetail?.template_config || {}}
                        /> */}
                       <CvPreview
                        cv={templateDetail}
                        template={{
                            id: templateDetail.template_id,
                            code: 'DEV_01',
                            name: templateDetail.title,
                            config: templateDetail.config,
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