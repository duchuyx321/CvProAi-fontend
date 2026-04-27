import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { toBlob } from 'html-to-image';

import CvEditor from '~/pages/User/CvEditor';
import { config } from '~/config';
import {
    buildCreateCvFormData,
    createCv,
    getCvTemplateDetail,
} from '~/services/cv-teamplate.service';
import { normalizeTemplateToCreateCv } from '~/utils/cv-editor.bootstrap';
import { validateTemplateConfig } from '~/utils/cv-section.schema';
import { buildCreateSubmitPreview } from '~/utils/cv-submit-preview.utils';
import { getApiMessage, unwrapApiResponse } from '~/utils/api-response.utils';
import useCvEditorState from '../CvEditor/hooks/useCvEditorState';

const FALLBACK_IMAGE_DATA_URL = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300">
    <rect width="300" height="300" fill="#f3f4f6"/>
    <circle cx="150" cy="112" r="52" fill="#cbd5e1"/>
    <path d="M58 270c12-62 54-98 92-98s80 36 92 98" fill="#cbd5e1"/>
</svg>
`)}`;

const waitNextFrame = () =>
    new Promise((resolve) => {
        requestAnimationFrame(() => {
            requestAnimationFrame(resolve);
        });
    });

const normalizeImageUrl = (src) => {
    if (!src) return FALLBACK_IMAGE_DATA_URL;

    return src.replace(
        /^http:\/\/res\.cloudinary\.com/i,
        'https://res.cloudinary.com',
    );
};

const setImageSource = (img, src) => {
    img.crossOrigin = 'anonymous';
    img.referrerPolicy = 'no-referrer';
    img.src = src;
};

const isImageLoadedSuccessfully = (img) => {
    return img.complete && img.naturalWidth > 0 && img.naturalHeight > 0;
};

const waitForSingleImage = async (img) => {
    if (isImageLoadedSuccessfully(img)) return true;

    try {
        if (typeof img.decode === 'function') {
            await img.decode();

            return isImageLoadedSuccessfully(img);
        }
    } catch {
        // decode fail thì fallback xuống onload/onerror bên dưới
    }

    return new Promise((resolve) => {
        const cleanup = () => {
            img.onload = null;
            img.onerror = null;
        };

        img.onload = () => {
            cleanup();
            resolve(isImageLoadedSuccessfully(img));
        };

        img.onerror = () => {
            cleanup();
            resolve(false);
        };
    });
};

const waitForImagesLoaded = async (rootElement) => {
    if (!rootElement) return;

    const images = Array.from(rootElement.querySelectorAll('img'));

    await Promise.all(
        images.map(async (img) => {
            const currentSrc = img.currentSrc || img.src;
            const normalizedSrc = normalizeImageUrl(currentSrc);

            if (!currentSrc || currentSrc !== normalizedSrc) {
                setImageSource(img, normalizedSrc);
            } else {
                img.crossOrigin = 'anonymous';
                img.referrerPolicy = 'no-referrer';
            }

            const isLoaded = await waitForSingleImage(img);

            if (!isLoaded) {
                console.warn('Image failed before capture:', {
                    src: img.src,
                    complete: img.complete,
                    naturalWidth: img.naturalWidth,
                    naturalHeight: img.naturalHeight,
                });

                setImageSource(img, FALLBACK_IMAGE_DATA_URL);
                await waitForSingleImage(img);
            }
        }),
    );
};

const prepareElementBeforeCapture = async (previewElement) => {
    await document.fonts?.ready;
    await waitForImagesLoaded(previewElement);
    await waitNextFrame();

    const images = Array.from(previewElement.querySelectorAll('img'));

    images.forEach((img) => {
        if (!isImageLoadedSuccessfully(img)) {
            console.warn('Replace broken image before toBlob:', {
                src: img.src,
                complete: img.complete,
                naturalWidth: img.naturalWidth,
                naturalHeight: img.naturalHeight,
            });

            setImageSource(img, FALLBACK_IMAGE_DATA_URL);
        }
    });

    await waitForImagesLoaded(previewElement);
    await waitNextFrame();
};

const buildSafeFileName = (cvName) => {
    const safeName = String(cvName || '')
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'd')
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-_]/g, '')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');

    return safeName || 'cv';
};

function CreateCv() {
    const { code } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [isNameModalOpen, setIsNameModalOpen] = useState(false);
    const [cvNameDraft, setCvNameDraft] = useState('');

    const {
        cvData,
        handleChangeArrayField,
        handleChangeConfig,
        handleChangeCvName,
        handleChangeField,
        handleChangeObjectInArray,
        handleDownloadPdf,
        handleGeneratePreview,
        handleRemoveSection,
        handleResetData,
        isDirty,
        markDirtyField,
        originalData,
        pageRef,
        resumeData,
        setSubmitting,
        submitting,
        syncPersistedData,
    } = useCvEditorState();

    useEffect(() => {
        let isCancelled = false;

        const fetchCreateTemplate = async () => {
            try {
                setLoading(true);

                const result = await getCvTemplateDetail(code);

                if (!result?.success) {
                    throw new Error(getApiMessage(result, 'Không thể tải CV'));
                }

                const template = unwrapApiResponse(result);
                const nextCvData = normalizeTemplateToCreateCv(template);
                const validation = validateTemplateConfig(nextCvData?.config);

                if (!validation?.isValid) {
                    throw new Error(
                        validation?.message || 'Cấu hình CV không hợp lệ',
                    );
                }

                if (isCancelled) return;

                syncPersistedData(nextCvData);
                setCvNameDraft('');
            } catch (error) {
                if (!isCancelled) {
                    toast.error(error?.message || 'Lỗi load CV');
                }
            } finally {
                if (!isCancelled) {
                    setLoading(false);
                }
            }
        };

        if (!code) {
            toast.error('Thiếu mã template để tạo CV');
            navigate(config.router.cvSample, { replace: true });

            return undefined;
        }

        fetchCreateTemplate();

        return () => {
            isCancelled = true;
        };
    }, [code, navigate, syncPersistedData]);

    const captureCvPreviewFile = async (previewElement, cvName) => {
        if (!previewElement) {
            throw new Error('Không tìm thấy vùng Preview CV để chụp ảnh');
        }

        await prepareElementBeforeCapture(previewElement);

        const width = previewElement.scrollWidth || previewElement.offsetWidth;
        const height =
            previewElement.scrollHeight || previewElement.offsetHeight;

        const blob = await toBlob(previewElement, {
            cacheBust: false,
            pixelRatio: 2,
            backgroundColor: '#ffffff',
            width,
            height,
            canvasWidth: width,
            canvasHeight: height,
            imagePlaceholder: FALLBACK_IMAGE_DATA_URL,
        });

        if (!blob) {
            throw new Error('Không thể tạo ảnh preview cho CV');
        }

        const safeName = buildSafeFileName(cvName);

        return new File([blob], `${safeName}-preview.png`, {
            type: 'image/png',
        });
    };

    const getAvatarFileFromCvData = (cvData) => {
        const avatar = cvData?.avatar || cvData?.personal?.avatar;

        if (avatar instanceof File) {
            return avatar;
        }

        return null;
    };

    const submitCreateCv = useCallback(
        async (finalCvName) => {
            const trimmedName = (finalCvName || '').trim();

            if (!trimmedName) {
                toast.error('Vui lòng nhập tên CV');
                return;
            }

            setSubmitting(true);

            try {
                const preview = buildCreateSubmitPreview({
                    originalData,
                    currentData: {
                        ...cvData,
                        name: trimmedName,
                        title: trimmedName,
                    },
                    finalCvName: trimmedName,
                });

                const avatarFile = getAvatarFileFromCvData(cvData);

                const previewFile = await captureCvPreviewFile(
                    pageRef?.current,
                    trimmedName,
                );
                const formData = buildCreateCvFormData({
                    payload: preview.payload,
                    avatarFile,
                    previewFile,
                });
                const response = await createCv(formData);

                if (!response?.success) {
                    throw new Error(
                        response?.message ||
                            'Tạo CV thất bại, vui lòng thử lại',
                    );
                }

                toast.success('Tạo CV thành công');

                navigate(
                    config.router.editCv.replace(':slug', response?.data?.slug),
                    {
                        replace: true,
                    },
                );
            } catch (error) {
                console.log(error);
                toast.error(error?.message || 'Lỗi lưu CV');
            } finally {
                setSubmitting(false);
            }
        },
        [cvData, originalData, pageRef, setSubmitting, navigate],
    );

    const handleSaveCv = useCallback(async () => {
        if (submitting) return;

        if (!isDirty) {
            toast.info('Bạn chưa thay đổi nội dung CV');
            return;
        }

        const currentName = (cvData?.name || '').trim();

        if (!currentName) {
            setCvNameDraft(cvData?.name || '');
            setIsNameModalOpen(true);
            return;
        }

        await submitCreateCv(currentName);
    }, [cvData?.name, isDirty, submitCreateCv, submitting]);

    const handleCloseNameModal = useCallback(() => {
        if (submitting) return;

        setCvNameDraft(cvData?.name || '');
        setIsNameModalOpen(false);
    }, [cvData?.name, submitting]);

    const handleConfirmCvName = useCallback(async () => {
        const trimmedName = cvNameDraft.trim();

        if (!trimmedName) {
            toast.error('Vui lòng nhập tên CV');
            return;
        }

        markDirtyField('name');
        handleChangeCvName(trimmedName);
        setIsNameModalOpen(false);

        await submitCreateCv(trimmedName);
    }, [cvNameDraft, handleChangeCvName, markDirtyField, submitCreateCv]);

    return (
        <CvEditor
            loading={loading}
            submitting={submitting}
            cvData={cvData}
            resumeData={resumeData}
            isDirty={isDirty}
            canDownloadPdf={false}
            onChangeField={handleChangeField}
            onChangeArrayField={handleChangeArrayField}
            onChangeObjectInArray={handleChangeObjectInArray}
            onRemoveSection={handleRemoveSection}
            onChangeConfig={handleChangeConfig}
            onResetData={handleResetData}
            onSaveCv={handleSaveCv}
            onDownloadPdf={handleDownloadPdf}
            onGeneratePreview={handleGeneratePreview}
            onChangeCvName={handleChangeCvName}
            pageRef={pageRef}
            namePrompt={{
                isOpen: isNameModalOpen,
                onClose: handleCloseNameModal,
                onConfirm: handleConfirmCvName,
                onChange: (valueOrEvent) =>
                    setCvNameDraft(
                        valueOrEvent?.target?.value ?? valueOrEvent ?? '',
                    ),
                value: cvNameDraft,
            }}
        />
    );
}

export default CreateCv;
