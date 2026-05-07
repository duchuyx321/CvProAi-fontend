// src/pages/Admin/ManageTemplates/TemplateEditor/useTemplateEditor.jsx

import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

import { config } from '~/config';
import {
    createCvTemplate,
    getCvTemplateById,
    getCvTemplateDetail,
    updateCvTemplate,
} from '~/services/cv-teamplate.service';

import { getTemplateRecordId } from '../utils';
import { DEFAULT_EDITOR, STARTER_PRESETS } from './LeftPanel/constants';
import {
    buildEditorTemplateConfig,
    getEditorSectionsFromConfig,
} from './RightPreview/templateSchema';

const buildInitialEditor = (template, templateId) => {
    if (!template) {
        return {
            ...DEFAULT_EDITOR,
            code: templateId || '',
        };
    }

    const adminEditor = template?.config?.admin_editor || {};
    const configSections = getEditorSectionsFromConfig(template?.config || {});

    return {
        ...DEFAULT_EDITOR,
        name: template?.name || DEFAULT_EDITOR.name,
        code: template?.code || templateId || '',
        description: template?.description || '',
        category: template?.category || DEFAULT_EDITOR.category,
        is_active: template?.is_active ?? true,
        is_premium: Boolean(template?.is_premium),
        layout: adminEditor?.layout || DEFAULT_EDITOR.layout,
        primaryColor:
            adminEditor?.primaryColor ||
            template?.config?.theme?.colors?.primary ||
            DEFAULT_EDITOR.primaryColor,
        fontFamily:
            adminEditor?.fontFamily ||
            template?.config?.theme?.fontFamily ||
            DEFAULT_EDITOR.fontFamily,
        spacing: adminEditor?.spacing || DEFAULT_EDITOR.spacing,
        sections: {
            ...DEFAULT_EDITOR.sections,
            ...configSections,
            ...(adminEditor?.sections || {}),
        },
    };
};

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

const generateCodeFromName = (name) => {
    if (!name) return '';
    const slug = name
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/gi, 'd')
        .toUpperCase()
        .replace(/[^A-Z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    const random = String(Math.floor(Math.random() * 900) + 100);
    return slug ? `CV-${slug}-${random}` : `CV-${random}`;
};

const escapeHtml = (value) =>
    String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');

const collectReadableStyles = () => {
    let cssText = '';

    for (const sheet of Array.from(document.styleSheets)) {
        try {
            const rules = Array.from(sheet.cssRules || []);
            cssText += `${rules.map((rule) => rule.cssText).join('\n')}\n`;
        } catch (error) {
            console.warn('Cannot read stylesheet', sheet.href, error);
        }
    }

    return cssText;
};

function useTemplateEditor({ previewRef } = {}) {
    const navigate = useNavigate();
    const location = useLocation();
    const { templateId } = useParams();

    const mode = location.pathname.endsWith('/new') ? 'create' : 'edit';
    const isCreate = mode === 'create';
    const routeTemplate = isCreate ? null : location.state?.template;

    const [remoteTemplate, setRemoteTemplate] = useState(null);
    const [editor, setEditor] = useState(() =>
        buildInitialEditor(routeTemplate, isCreate ? '' : templateId),
    );
    const [zoom, setZoom] = useState(100);
    const [saving, setSaving] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [loadingTemplate, setLoadingTemplate] = useState(
        !isCreate && !routeTemplate,
    );
    const [loadError, setLoadError] = useState('');

    const autoSaveRef = useRef(null);
    const template = isCreate ? null : remoteTemplate || routeTemplate;

    useEffect(() => {
        if (isCreate) {
            setRemoteTemplate(null);
            setEditor(buildInitialEditor(null, ''));
            setIsDirty(false);
            setLoadingTemplate(false);
            setLoadError('');
            return undefined;
        }

        if (routeTemplate) {
            setRemoteTemplate(null);
            setEditor(buildInitialEditor(routeTemplate, templateId));
            setIsDirty(false);
            setLoadingTemplate(false);
            setLoadError('');
            return undefined;
        }

        if (!templateId) {
            setLoadingTemplate(false);
            setLoadError('Không tìm thấy ID mẫu CV');
            return undefined;
        }

        let active = true;

        const fetchTemplate = async () => {
            try {
                setLoadingTemplate(true);
                setLoadError('');

                const nextTemplate = await fetchTemplateByIdentifier(
                    templateId,
                );

                if (!active) return;
                setRemoteTemplate(nextTemplate);
                setEditor(buildInitialEditor(nextTemplate, templateId));
                setIsDirty(false);
            } catch (error) {
                console.error(error);
                if (!active) return;
                setLoadError(
                    error?.message || 'Không thể tải dữ liệu mẫu CV',
                );
                toast.error(
                    error?.message || 'Không thể tải dữ liệu mẫu CV',
                );
            } finally {
                if (active) setLoadingTemplate(false);
            }
        };

        fetchTemplate();

        return () => {
            active = false;
        };
    }, [isCreate, routeTemplate, templateId]);

    const realTemplateId = useMemo(() => {
        if (isCreate) return null;
        return getTemplateRecordId(template) || templateId || editor.code;
    }, [template, templateId, editor.code, isCreate]);

    const enabledSectionCount = useMemo(() => {
        return Object.values(editor.sections).filter(Boolean).length;
    }, [editor.sections]);

    useEffect(() => {
        if (!isDirty) return undefined;

        const handler = (event) => {
            event.preventDefault();
            event.returnValue = '';
        };

        window.addEventListener('beforeunload', handler);
        return () => window.removeEventListener('beforeunload', handler);
    }, [isDirty]);

    const handleChange = (field, value) => {
        setEditor((prev) => ({ ...prev, [field]: value }));
        setIsDirty(true);
    };

    const handleAutoGenerateCode = () => {
        if (!editor.name.trim()) {
            toast.warning('Vui lòng nhập tên mẫu CV trước');
            return;
        }
        const newCode = generateCodeFromName(editor.name);
        setEditor((prev) => ({ ...prev, code: newCode }));
        setIsDirty(true);
        toast.success('Đã tạo mã tự động');
    };

    const handleApplyPreset = (presetKey) => {
        const preset = STARTER_PRESETS.find((p) => p.key === presetKey);
        if (!preset) return;

        setEditor((prev) => ({
            ...prev,
            ...preset.config,
        }));
        setIsDirty(true);
        toast.info(`Đã áp dụng preset "${preset.label}"`);
    };

    const handleToggleSection = (key) => {
        setEditor((prev) => ({
            ...prev,
            sections: { ...prev.sections, [key]: !prev.sections[key] },
        }));
        setIsDirty(true);
    };

    const handleToggleActive = () => {
        setEditor((prev) => ({ ...prev, is_active: !prev.is_active }));
        setIsDirty(true);
    };

    const handleTogglePremium = () => {
        setEditor((prev) => ({ ...prev, is_premium: !prev.is_premium }));
        setIsDirty(true);
    };

    const handleZoomIn = () => setZoom((p) => Math.min(150, p + 5));
    const handleZoomOut = () => setZoom((p) => Math.max(50, p - 5));

    const handleDownloadPdf = async () => {
        const paper = previewRef?.current;
        if (!paper) {
            toast.error('Không tìm thấy vùng preview CV');
            return;
        }

        await document.fonts?.ready;

        const clone = paper.cloneNode(true);
        clone.style.transform = 'none';
        clone.style.transformOrigin = 'top center';
        clone.style.boxShadow = 'none';
        clone.style.margin = '0 auto';

        const printWindow = window.open('', '_blank', 'width=900,height=1100');
        if (!printWindow) {
            toast.error('Trình duyệt đã chặn cửa sổ tải PDF');
            return;
        }

        const title = escapeHtml(editor.name || editor.code || 'CV Template');
        const cssText = collectReadableStyles();

        printWindow.document.open();
        printWindow.document.write(`<!doctype html>
<html>
<head>
    <meta charset="utf-8" />
    <title>${title}</title>
    <style>
        ${cssText}
        @page { size: A4; margin: 0; }
        html, body {
            width: 100%;
            min-height: 100%;
            margin: 0;
            background: #ffffff !important;
        }
        body {
            display: flex;
            justify-content: center;
            align-items: flex-start;
        }
        * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
        }
        article {
            transform: none !important;
            box-shadow: none !important;
        }
    </style>
</head>
<body>
    ${clone.outerHTML}
    <script>
        window.onload = function () {
            setTimeout(function () {
                window.focus();
                window.print();
            }, 150);
        };
        window.onafterprint = function () {
            setTimeout(function () {
                window.close();
            }, 100);
        };
    </script>
</body>
</html>`);
        printWindow.document.close();
        toast.success('Đã mở hộp thoại tải PDF');
    };

    const buildPayload = () => ({
        name: editor.name.trim(),
        code: editor.code.trim(),
        description: editor.description,
        category: editor.category,
        is_active: editor.is_active,
        is_premium: editor.is_premium,
        config: buildEditorTemplateConfig(editor, template?.config || {}),
    });

    const validate = ({ silent = false } = {}) => {
        if (!editor.name.trim()) {
            if (!silent) toast.warning('Vui lòng nhập tên mẫu CV');
            return false;
        }
        if (isCreate && !editor.code.trim()) {
            if (!silent) toast.warning('Vui lòng nhập mã mẫu CV');
            return false;
        }
        if (!isCreate && !realTemplateId) {
            if (!silent) toast.error('Không tìm thấy ID mẫu CV cần cập nhật');
            return false;
        }
        return true;
    };

    const performSaveRef = useRef(null);
    performSaveRef.current = async ({ silent = false } = {}) => {
        if (loadingTemplate || saving || !validate({ silent })) return;

        try {
            setSaving(true);
            const payload = buildPayload();

            const result = isCreate
                ? await createCvTemplate(payload)
                : await updateCvTemplate(realTemplateId, payload);

            if (result?.success === false) {
                if (!silent) {
                    toast.error(
                        result?.message ||
                            (isCreate
                                ? 'Tạo mẫu CV thất bại'
                                : 'Cập nhật mẫu CV thất bại'),
                    );
                }
                return;
            }

            if (!silent) {
                toast.success(
                    isCreate
                        ? 'Tạo mẫu CV thành công'
                        : 'Cập nhật thay đổi thành công',
                );
            }
            setIsDirty(false);

            if (!isCreate) {
                setRemoteTemplate((prev) => ({
                    ...(template || prev || {}),
                    ...payload,
                }));
            }

            if (isCreate) {
                setTimeout(() => navigate(config.router.manageTemplates), 600);
            }
        } catch (error) {
            console.error(error);
            if (!silent) toast.error('Có lỗi xảy ra, vui lòng thử lại');
        } finally {
            setSaving(false);
        }
    };

    useEffect(() => {
        if (isCreate || loadingTemplate || !isDirty) return undefined;

        if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
        autoSaveRef.current = setTimeout(() => {
            performSaveRef.current({ silent: true });
        }, 2000);

        return () => clearTimeout(autoSaveRef.current);
    }, [editor, isCreate, isDirty, loadingTemplate]);

    const handleSave = () => performSaveRef.current({ silent: false });

    const handleCancel = () => {
        if (isDirty) {
            const ok = window.confirm(
                'Bạn có thay đổi chưa lưu. Vẫn rời trang?',
            );
            if (!ok) return;
        }
        navigate(-1);
    };

    return {
        mode,
        isCreate,
        template,
        editor,
        zoom,
        saving,
        isDirty,
        loadingTemplate,
        loadError,
        enabledSectionCount,
        handleChange,
        handleAutoGenerateCode,
        handleApplyPreset,
        handleToggleSection,
        handleToggleActive,
        handleTogglePremium,
        handleZoomIn,
        handleZoomOut,
        handleDownloadPdf,
        handleSave,
        handleCancel,
    };
}

export default useTemplateEditor;
