import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import classNames from 'classnames/bind';
import { toast } from 'react-toastify';
import {
    FiArrowLeft,
    FiEdit2,
    FiInfo,
    FiMaximize2,
    FiMinus,
    FiPlus,
    FiSliders,
    FiUploadCloud,
} from 'react-icons/fi';

import Button from '~/components/Button';
import CvPreview from '~/components/CvPreview';
import { config } from '~/config';
import {
    getCvTemplateById,
    getCvTemplateDetail,
    updateCvTemplate,
} from '~/services/cv-teamplate.service';

import {
    formatNumber,
    getTemplateAdminConfig,
    getTemplateCreatedDate,
    getTemplateIdLabel,
    getTemplateRecordId,
    getTemplateUsageCount,
} from '../utils';
import { TEMPLATE_PREVIEW_CONTENT } from '../TemplateEditor/RightPreview/templateSchema';

import styles from './TemplatePreview.module.scss';

const cx = classNames.bind(styles);

const getResponseTemplate = (response) => {
    if (!response || response?.success === false) return null;
    const data = response?.data || response;
    if (data?.template) return data.template;
    if (data?.item) return data.item;
    if (data?.data) return data.data;
    return data;
};

const fetchTemplateByIdentifier = async (identifier) => {
    try {
        const byId = await getCvTemplateById(identifier);
        const template = getResponseTemplate(byId);
        if (template) return template;
    } catch (error) {
        console.warn('Cannot fetch template by id, fallback to code', error);
    }

    const byCode = await getCvTemplateDetail(identifier);
    const template = getResponseTemplate(byCode);
    if (!template) throw new Error('Không tìm thấy mẫu CV');
    return template;
};

function TemplatePreview() {
    const navigate = useNavigate();
    const location = useLocation();
    const { templateId } = useParams();

    const routeTemplate = location.state?.template || null;
    const [template, setTemplate] = useState(routeTemplate);
    const [loading, setLoading] = useState(!routeTemplate);
    const [loadError, setLoadError] = useState('');
    const [zoom, setZoom] = useState(85);
    const [publishing, setPublishing] = useState(false);

    useEffect(() => {
        if (routeTemplate) {
            setTemplate(routeTemplate);
            setLoading(false);
            setLoadError('');
            return undefined;
        }

        if (!templateId) {
            setLoading(false);
            setLoadError('Không tìm thấy ID mẫu CV');
            return undefined;
        }

        let active = true;

        const loadTemplate = async () => {
            try {
                setLoading(true);
                setLoadError('');
                const nextTemplate = await fetchTemplateByIdentifier(
                    templateId,
                );
                if (!active) return;
                setTemplate(nextTemplate);
            } catch (error) {
                console.error(error);
                if (!active) return;
                setLoadError(
                    error?.message || 'Không thể tải thông tin mẫu CV',
                );
                toast.error(
                    error?.message || 'Không thể tải thông tin mẫu CV',
                );
            } finally {
                if (active) setLoading(false);
            }
        };

        loadTemplate();

        return () => {
            active = false;
        };
    }, [routeTemplate, templateId]);

    const realTemplateId = useMemo(() => {
        return getTemplateRecordId(template) || templateId;
    }, [template, templateId]);

    const adminConfig = useMemo(
        () => getTemplateAdminConfig(template),
        [template],
    );

    const previewTemplate = useMemo(
        () => ({
            id: template?.template_id || getTemplateRecordId(template),
            code: template?.template_code || template?.code || 'DEV_01',
            name: template?.title || template?.name || 'Preview CV Template',
            content:
                template?.template_content ||
                template?.content ||
                TEMPLATE_PREVIEW_CONTENT,
            config: template?.config,
        }),
        [template],
    );

    const previewCv = useMemo(
        () => ({
            ...template,
            id: getTemplateRecordId(template) || 'admin-template-preview',
            title: template?.title || template?.name || 'Preview CV Template',
            template_id:
                template?.template_id || getTemplateRecordId(template),
            template_code: template?.template_code || template?.code || 'DEV_01',
            template_content:
                template?.template_content ||
                template?.content ||
                TEMPLATE_PREVIEW_CONTENT,
            content:
                template?.content ||
                template?.template_content ||
                TEMPLATE_PREVIEW_CONTENT,
            config: template?.config,
        }),
        [template],
    );

    const handleBack = () => {
        navigate(config.router.manageTemplates);
    };

    const handleEdit = () => {
        if (!realTemplateId) {
            toast.warning('Không tìm thấy ID mẫu CV cần chỉnh sửa');
            return;
        }
        navigate(
            `/admin/templates/${encodeURIComponent(realTemplateId)}/edit`,
            { state: { template } },
        );
    };

    const handlePublish = async () => {
        if (!realTemplateId || publishing) return;

        try {
            setPublishing(true);
            const result = await updateCvTemplate(realTemplateId, {
                is_active: true,
            });

            if (result?.success === false) {
                toast.error(result?.message || 'Xuất bản thất bại');
                return;
            }

            setTemplate((prev) => ({ ...(prev || {}), is_active: true }));
            toast.success('Đã xuất bản mẫu CV');
        } catch (error) {
            console.error(error);
            toast.error('Có lỗi xảy ra khi xuất bản');
        } finally {
            setPublishing(false);
        }
    };

    const handleZoomOut = () => setZoom((p) => Math.max(50, p - 5));
    const handleZoomIn = () => setZoom((p) => Math.min(150, p + 5));
    const handleResetZoom = () => setZoom(85);

    const isActive = template?.is_active !== false;

    if (loading) {
        return (
            <section className={cx('wrapper')}>
                <div className={cx('stateBox')}>
                    Đang tải thông tin mẫu CV...
                </div>
            </section>
        );
    }

    if (loadError) {
        return (
            <section className={cx('wrapper')}>
                <div className={cx('stateBox', 'error')}>{loadError}</div>
            </section>
        );
    }

    return (
        <section className={cx('wrapper')}>
            <div className={cx('topBar')}>
                <div className={cx('breadcrumbWrap')}>
                    <p className={cx('breadcrumbs')}>
                        Quản lý mẫu CV <span>›</span>{' '}
                        <strong>Preview mẫu CV</strong>
                    </p>

                    <h1>Preview mẫu CV</h1>
                    <p className={cx('subtitle')}>
                        Xem trước giao diện thật mà người dùng sẽ nhận được
                        trước khi chỉnh sửa hoặc xuất bản.
                    </p>
                </div>

                <div className={cx('topActions')}>
                    <Button
                        outline
                        type="button"
                        leftIcon={<FiArrowLeft />}
                        onClick={handleBack}
                    >
                        Quay lại
                    </Button>

                    <Button
                        outline
                        type="button"
                        leftIcon={<FiEdit2 />}
                        onClick={handleEdit}
                    >
                        Chỉnh sửa mẫu
                    </Button>

                    <Button
                        primary
                        type="button"
                        leftIcon={<FiUploadCloud />}
                        onClick={handlePublish}
                        disabled={publishing || isActive}
                        className={cx('publishBtn')}
                    >
                        {publishing
                            ? 'Đang xuất bản...'
                            : isActive
                              ? 'Đã xuất bản'
                              : 'Xuất bản'}
                    </Button>
                </div>
            </div>

            <div className={cx('mainGrid')}>
                <div className={cx('previewArea')}>
                    <div className={cx('zoomBar')}>
                        <button type="button" onClick={handleZoomOut}>
                            <FiMinus />
                        </button>
                        <span>{zoom}%</span>
                        <button type="button" onClick={handleZoomIn}>
                            <FiPlus />
                        </button>
                        <i />
                        <button type="button" onClick={handleResetZoom}>
                            <FiMaximize2 />
                        </button>
                    </div>

                    <div className={cx('canvas')}>
                        <div
                            className={cx('renderedPreview')}
                            style={{ transform: `scale(${zoom / 100})` }}
                        >
                            <CvPreview
                                template={previewTemplate}
                                cv={previewCv}
                            />
                        </div>
                    </div>
                </div>

                <aside className={cx('infoPanel')}>
                    <div className={cx('card')}>
                        <div className={cx('cardTitle')}>
                            <FiInfo />
                            <h3>Thông tin mẫu</h3>
                        </div>

                        <div className={cx('infoRow')}>
                            <span>ID</span>
                            <strong>{getTemplateIdLabel(template)}</strong>
                        </div>

                        <div className={cx('infoRow')}>
                            <span>Tên</span>
                            <strong>{template?.name || '—'}</strong>
                        </div>

                        <div className={cx('infoRow')}>
                            <span>Danh mục</span>
                            <span className={cx('chip')}>
                                {template?.category || 'IT & Software'}
                            </span>
                        </div>

                        <div className={cx('infoRow')}>
                            <span>Trạng thái</span>
                            <span
                                className={cx('statusBadge', {
                                    inactive: !isActive,
                                })}
                            >
                                {isActive ? 'Hoạt động' : 'Tạm ngưng'}
                            </span>
                        </div>

                        <div className={cx('infoRow')}>
                            <span>Loại mẫu</span>
                            <span
                                className={cx('typeBadge', {
                                    premium: template?.is_premium,
                                })}
                            >
                                {template?.is_premium ? 'Premium' : 'Free'}
                            </span>
                        </div>

                        <div className={cx('infoRow')}>
                            <span>Lượt dùng</span>
                            <strong className={cx('usage')}>
                                ↗ {formatNumber(getTemplateUsageCount(template))}
                            </strong>
                        </div>

                        <div className={cx('infoRow')}>
                            <span>Ngày tạo</span>
                            <strong>{getTemplateCreatedDate(template)}</strong>
                        </div>
                    </div>

                    <div className={cx('card')}>
                        <div className={cx('cardTitle')}>
                            <FiSliders />
                            <h3>Thuộc tính</h3>
                        </div>

                        <div className={cx('attrGrid')}>
                            <div className={cx('attrCell')}>
                                <span>Layout</span>
                                <strong>{adminConfig.layout}</strong>
                            </div>

                            <div className={cx('attrCell')}>
                                <span>Màu chính</span>
                                <div className={cx('colorChip')}>
                                    <i
                                        style={{
                                            background:
                                                adminConfig.primaryColor,
                                        }}
                                    />
                                    <strong>{adminConfig.primaryColor}</strong>
                                </div>
                            </div>

                            <div className={cx('attrCell')}>
                                <span>Font</span>
                                <strong>{adminConfig.fontFamily}</strong>
                            </div>

                            <div className={cx('attrCell')}>
                                <span>Spacing</span>
                                <strong>{adminConfig.spacing}</strong>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </section>
    );
}

export default TemplatePreview;
