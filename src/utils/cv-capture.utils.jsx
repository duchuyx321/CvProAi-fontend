import { toBlob } from 'html-to-image';

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

export const captureCvPreviewFile = async (previewElement, cvName) => {
    if (!previewElement) {
        throw new Error('Không tìm thấy vùng Preview CV để chụp ảnh');
    }

    await prepareElementBeforeCapture(previewElement);

    const width = previewElement.scrollWidth || previewElement.offsetWidth;
    const height = previewElement.scrollHeight || previewElement.offsetHeight;

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
