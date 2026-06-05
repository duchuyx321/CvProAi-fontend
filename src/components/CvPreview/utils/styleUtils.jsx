import { getAvatarBorderRadius } from './previewHelpers';

const CSS_LENGTH_KEYS = new Set([
    'borderRadius',
    'fontSize',
    'gap',
    'height',
    'letterSpacing',
    'margin',
    'padding',
    'width',
]);

export function toCssLength(value) {
    if (value === null || value === undefined || value === '') return undefined;
    if (typeof value === 'number') return `${value}px`;
    return value;
}

export function normalizeBoxStyle(style = {}) {
    if (!style || typeof style !== 'object' || Array.isArray(style)) return {};

    return Object.entries(style).reduce((result, [key, value]) => {
        if (value === null || value === undefined || value === '') return result;

        result[key] = CSS_LENGTH_KEYS.has(key) ? toCssLength(value) : value;
        return result;
    }, {});
}

export function getCardStyle(card = {}) {
    if (!card?.enabled) return {};

    return normalizeBoxStyle({
        background: card.background,
        borderRadius: card.borderRadius,
        padding: card.padding,
        boxShadow: card.shadow,
        border: card.border,
    });
}

export function getAvatarStyle(avatarOptions = {}) {
    const shape = avatarOptions?.shape || 'square';

    return normalizeBoxStyle({
        width: avatarOptions?.width,
        height: avatarOptions?.height || avatarOptions?.width,
        borderRadius: getAvatarBorderRadius(shape),
        objectFit: avatarOptions?.objectFit || 'cover',
    });
}

export function getTitleBarStyle(titleBar = {}) {
    return normalizeBoxStyle({
        background: titleBar.background,
        minHeight: titleBar.height,
        justifyContent:
            titleBar.align === 'right'
                ? 'flex-end'
                : titleBar.align === 'center'
                  ? 'center'
                  : 'flex-start',
        textAlign: titleBar.align,
        letterSpacing: titleBar.letterSpacing,
    });
}
