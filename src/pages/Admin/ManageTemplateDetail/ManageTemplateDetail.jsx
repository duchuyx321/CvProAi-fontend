import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import classNames from 'classnames/bind';
import {
    ArrowLeft,
    ChevronRight,
    Info,
    Maximize2,
    Minus,
    Pencil,
    Plus,
    SlidersHorizontal,
    TrendingUp,
} from 'lucide-react';
import { toast } from 'react-toastify';

import Button from '~/components/Button';
import CvPreview from '~/components/CvPreview/CvPreview';
import { config } from '~/config';
import { getTemplateByCode } from '~/services/admin-template.service';

import styles from './ManageTemplateDetail.module.scss';

const cx = classNames.bind(styles);
const ZOOM_STEP = 0.1;
const MIN_ZOOM = 0.55;
const MAX_ZOOM = 1.15;
const DEFAULT_ZOOM = 0.68;

function getApiMessage(response, fallback) {
    return response?.message || response?.messsage || fallback;
}

function formatNumber(value) {
    return new Intl.NumberFormat('vi-VN').format(Number(value) || 0);
}

function getDisplayId(template = {}) {
    const codeNumber = String(template?.code || '').match(/(\d+)$/)?.[1];

    if (codeNumber) {
        return `#CV-${String(Number(codeNumber)).padStart(3, '0')}`;
    }

    return template?.id ? `#${String(template.id).slice(0, 8)}` : '#CV----';
}

function getLayoutLabel(template = {}) {
    const body = template?.config?.layout?.body || {};
    const layout = String(body?.layout || '').toUpperCase();
    const columns = Array.isArray(body?.columns) ? body.columns : [];

    if (layout === 'SPLIT' && columns.length >= 2) return 'Two Column';
    if (layout === 'SPLIT') return 'Split';
    if (layout === 'STACK') return 'Single Column';
    if (layout === 'BANNER') return 'Banner';

    return body?.layout || 'Default';
}

function getSpacingLabel(template = {}) {
    const spacing = Number(template?.config?.theme?.spacing?.sectionGap);

    if (!spacing || spacing <= 18) return 'Nhỏ Gọn';
    if (spacing <= 26) return 'Cân Bằng';

    return 'Rộng Rãi';
}

function getSectionCount(template = {}) {
    return Object.keys(template?.config?.sections || {}).length;
}

function ManageTemplateDetail() {
    const { code } = useParams();
    const navigate = useNavigate();

    const [template, setTemplate] = useState(null);
    const [loading, setLoading] = useState(false);
    const [zoom, setZoom] = useState(DEFAULT_ZOOM);

    useEffect(() => {
        let ignore = false;

        const fetchTemplateDetail = async () => {
            try {
                setLoading(true);

                const response = await getTemplateByCode(code);

                if (!response?.success) {
                    toast.warning(
                        getApiMessage(response, 'Không thể tải mẫu CV'),
                    );
                    navigate(config.router.manageTemplates, { replace: true });
                    return;
                }

                if (!ignore) {
                    setTemplate(response.data || null);
                }
            } catch (error) {
                toast.error(error?.message || 'Có lỗi xảy ra khi tải mẫu CV');
                navigate(config.router.manageTemplates, { replace: true });
            } finally {
                if (!ignore) {
                    setLoading(false);
                }
            }
        };

        if (code) {
            fetchTemplateDetail();
        }

        return () => {
            ignore = true;
        };
    }, [code, navigate]);

    const previewTemplate = useMemo(() => {
        if (!template) return null;

        const templateCode = template?.code || code || 'DEV_01';
        const previewContent = template?.content || {};

        return {
            ...template,
            title: template?.name || 'Mẫu CV',
            template_id: template?.id || '',
            template_code: templateCode,
            code: templateCode,
            content: previewContent,
            template_content: previewContent,
        };
    }, [code, template]);

    const primaryColor =
        template?.config?.theme?.colors?.primary ||
        template?.config?.theme?.colors?.text ||
        '#4f46e5';
    const fontFamily = template?.config?.theme?.fontFamily || 'Inter';
    const displayId = getDisplayId(template);
    const layoutLabel = getLayoutLabel(template);
    const spacingLabel = getSpacingLabel(template);
    const sectionCount = getSectionCount(template);
    const usedCount = formatNumber(template?.used_count);

    const handleBack = () => {
        navigate(config.router.manageTemplates);
    };

    const handleEdit = () => {
        if (!template?.code) return;
        navigate(config.router.editTemplate.replace(':code', template.code));
    };

    const handleZoom = (nextZoom) => {
        setZoom(Math.min(Math.max(nextZoom, MIN_ZOOM), MAX_ZOOM));
    };

    if (loading && !template) {
        return (
            <section className={cx('wrapper')}>
                <div className={cx('inner')}>
                    <div className={cx('loading')}>Đang tải mẫu CV...</div>
                </div>
            </section>
        );
    }

    if (!template) {
        return (
            <section className={cx('wrapper')}>
                <div className={cx('inner')}>
                    <div className={cx('loading')}>Không tìm thấy mẫu CV.</div>
                </div>
            </section>
        );
    }

    return (
        <section className={cx('wrapper')}>
            <div className={cx('inner')}>
                <header className={cx('header')}>
                    <div>
                        <h1>Peview mẫu CV: {template?.name || 'Mẫu CV01'}</h1>
                        <p>
                            Xem trước chi tiết giao diện và nội dung mẫu CV
                            trước khi chỉnh sửa hoặc xuất bản.
                        </p>
                    </div>

                    <div className={cx('headerActions')}>
                        <Button
                            outlineText
                            leftIcon={<ArrowLeft aria-hidden="true" />}
                            onClick={handleBack}
                        >
                            Quay lại
                        </Button>
                        <Button
                            primary
                            leftIcon={<Pencil aria-hidden="true" />}
                            onClick={handleEdit}
                        >
                            Chỉnh sửa mẫu
                        </Button>
                    </div>
                </header>

                <div className={cx('content')}>
                    <div className={cx('previewPanel')}>
                        <div className={cx('previewViewport')}>
                            <div
                                className={cx('previewScale')}
                                style={{
                                    '--preview-scale': zoom,
                                    '--preview-height': `${1123 * zoom}px`,
                                }}
                            >
                                <CvPreview
                                    cv={previewTemplate}
                                    template={{
                                        id: template?.id,
                                        code: previewTemplate?.template_code,
                                        name: template?.name,
                                        content: template?.content || {},
                                        config: template?.config || {},
                                    }}
                                />
                            </div>
                        </div>

                        <div className={cx('zoomControls')}>
                            <button
                                type="button"
                                aria-label="Thu nhỏ"
                                onClick={() => handleZoom(zoom - ZOOM_STEP)}
                                disabled={zoom <= MIN_ZOOM}
                            >
                                <Minus />
                            </button>
                            <span>{Math.round(zoom * 100)}%</span>
                            <button
                                type="button"
                                aria-label="Phóng to"
                                onClick={() => handleZoom(zoom + ZOOM_STEP)}
                                disabled={zoom >= MAX_ZOOM}
                            >
                                <Plus />
                            </button>
                            <button
                                type="button"
                                aria-label="Vừa khung"
                                onClick={() => handleZoom(DEFAULT_ZOOM)}
                            >
                                <Maximize2 />
                            </button>
                        </div>
                    </div>

                    <aside className={cx('sidebar')}>
                        <section className={cx('card')}>
                            <h2>
                                <Info />
                                Thông tin mẫu
                            </h2>

                            <div className={cx('infoList')}>
                                <div className={cx('infoRow')}>
                                    <span>ID</span>
                                    <strong>{displayId}</strong>
                                </div>
                                <div className={cx('infoRow', 'nameRow')}>
                                    <span>Tên</span>
                                    <strong>
                                        {template?.name || 'Mẫu CV'}
                                    </strong>
                                </div>

                                <div className={cx('infoRow')}>
                                    <span>Trạng thái</span>
                                    <strong
                                        className={cx('statusBadge', {
                                            active: template?.is_active,
                                            inactive: !template?.is_active,
                                        })}
                                    >
                                        {template?.is_active
                                            ? 'Hoạt động'
                                            : 'Tạm ngưng'}
                                    </strong>
                                </div>
                                <div className={cx('infoRow')}>
                                    <span>Lượt dùng</span>
                                    <strong className={cx('usage')}>
                                        <TrendingUp />
                                        {usedCount}
                                    </strong>
                                </div>
                            </div>
                        </section>

                        <section className={cx('card')}>
                            <h2>
                                <SlidersHorizontal />
                                Thuộc tính
                            </h2>

                            <div className={cx('propertyGrid')}>
                                <div className={cx('propertyItem')}>
                                    <span>Layout</span>
                                    <strong>{layoutLabel}</strong>
                                </div>
                                <div className={cx('propertyItem')}>
                                    <span>Primary color</span>
                                    <strong>
                                        <i
                                            style={{
                                                backgroundColor: primaryColor,
                                            }}
                                        />
                                        {primaryColor}
                                    </strong>
                                </div>
                                <div className={cx('propertyItem')}>
                                    <span>Font</span>
                                    <strong>{fontFamily}</strong>
                                </div>
                                <div className={cx('propertyItem')}>
                                    <span>Spacing</span>
                                    <strong>{spacingLabel}</strong>
                                </div>
                                <div className={cx('propertyItem')}>
                                    <span>Sections</span>
                                    <strong>{sectionCount}</strong>
                                </div>
                                <div className={cx('propertyItem')}>
                                    <span>Version</span>
                                    <strong>
                                        v
                                        {template?.config?.version ||
                                            template?.config?.rendererVersion ||
                                            1}
                                    </strong>
                                </div>
                            </div>
                        </section>
                    </aside>
                </div>
            </div>
        </section>
    );
}

export default ManageTemplateDetail;
