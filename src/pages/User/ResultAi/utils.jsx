// xử lý số liệu, format ngày tháng và chứa Mock Data

export const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export const asNumber = (value) => {
    if (value == null) return null;
    const numberValue = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(numberValue) ? numberValue : null;
};

export const normalizeScore = (value) => {
    const rawNumber = asNumber(value);
    if (rawNumber == null) return null;
    if (rawNumber > 0 && rawNumber <= 1) return rawNumber * 100;
    if (rawNumber > 1 && rawNumber <= 10) return rawNumber * 10;
    return rawNumber;
};

export const formatScore = (value) => {
    const normalized = normalizeScore(value);
    if (normalized == null) return '--';
    return normalized.toFixed(1);
};

export const scoreToPercent = (value) => {
    const normalized = normalizeScore(value);
    if (normalized == null) return 0;
    return clamp(normalized, 0, 100);
};

export const normalizeArray = (value) => {
    if (Array.isArray(value)) return value;
    if (value == null) return [];
    return [value];
};

export const prettifyKey = (key) =>
    String(key || '')
        .replace(/_/g, ' ')
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/\s+/g, ' ')
        .trim()
        .replace(/^./, (c) => c.toUpperCase());

export const extractItemText = (item) => {
    if (item == null) return '';
    if (typeof item === 'string') return item;
    if (typeof item === 'number') return String(item);

    if (typeof item === 'object') {
        const title =
            item.title || item.name || item.point || item.summary || item.label;
        const detail =
            item.detail ||
            item.description ||
            item.reason ||
            item.explanation ||
            item.note;

        if (title && detail) return `${title}: ${detail}`;
        return title || detail || JSON.stringify(item);
    }
    return String(item);
};

const normalizeSeverity = (value) => {
    const normalized = String(value || '')
        .trim()
        .toLowerCase();
    if (['high', 'medium', 'low'].includes(normalized)) return normalized;
    return 'medium';
};

const normalizePriority = (value) => {
    const normalized = String(value || '')
        .trim()
        .toLowerCase();
    if (['high', 'medium', 'low'].includes(normalized)) return normalized;
    return 'medium';
};

const normalizeMetaCount = (value) => {
    const numberValue = asNumber(value);
    if (numberValue == null) return null;
    if (!Number.isFinite(numberValue)) return null;
    return Math.max(0, Math.floor(numberValue));
};

const normalizeInsightsMeta = (meta) => {
    if (!meta || typeof meta !== 'object' || Array.isArray(meta)) return null;

    const visibleCount = normalizeMetaCount(
        meta.visible_count ?? meta.visibleCount,
    );
    const totalCount = normalizeMetaCount(meta.total_count ?? meta.totalCount);
    const hiddenCount = normalizeMetaCount(
        meta.hidden_count ?? meta.hiddenCount,
    );
    const isPremiumLocked =
        typeof meta.is_premium_locked === 'boolean'
            ? meta.is_premium_locked
            : typeof meta.isPremiumLocked === 'boolean'
              ? meta.isPremiumLocked
              : null;

    return {
        visibleCount,
        totalCount,
        hiddenCount,
        isPremiumLocked,
    };
};

const normalizeWeakness = (item, index) => {
    if (typeof item === 'string') {
        return {
            id: `w_${index + 1}`,
            title: item,
            description: '',
            type: 'issue',
            severity: 'medium',
            impactScore: null,
            targetSection: '',
            evidence: null,
        };
    }

    return {
        id: item?.id ?? `w_${index + 1}`,
        title: item?.title ?? extractItemText(item),
        description: item?.description ?? item?.detail ?? '',
        type: item?.type ?? 'issue',
        severity: normalizeSeverity(item?.severity),
        impactScore: asNumber(item?.impact_score ?? item?.impactScore),
        targetSection: item?.target_section ?? item?.targetSection ?? '',
        evidence:
            item?.evidence && typeof item.evidence === 'object'
                ? item.evidence
                : null,
    };
};

const normalizeSuggestion = (item, index) => {
    if (typeof item === 'string') {
        return {
            id: `s_${index + 1}`,
            title: item,
            priority: 'medium',
            example: '',
            action: '',
        };
    }

    return {
        id: item?.id ?? `s_${index + 1}`,
        title: item?.title ?? extractItemText(item),
        priority: normalizePriority(item?.priority),
        action: item?.action ?? item?.recommendation ?? '',
        example:
            item?.example ??
            item?.action ??
            item?.detail ??
            item?.description ??
            '',
    };
};

const normalizeStrength = (item, index) => {
    if (typeof item === 'string') {
        return {
            id: `st_${index + 1}`,
            title: item,
            description: '',
        };
    }

    return {
        id: item?.id ?? `st_${index + 1}`,
        title: item?.title ?? item?.point ?? extractItemText(item),
        description: item?.description ?? item?.detail ?? '',
    };
};

export const normalizeAiResult = (raw) => {
    const source = raw?.data ?? raw ?? {};
    const aiRun = source.ai_run ?? source.aiRun ?? source.run ?? {};
    const structuredFeedback =
        source.structured_feedback ?? source.structuredFeedback ?? null;
    const cvId =
        source.cv_id ??
        source.cvId ??
        source.detailCv ??
        aiRun.cv_id ??
        aiRun.cvId ??
        null;
    const cvSourceType = String(
        source.cv_source_type ??
            source.cvSourceType ??
            aiRun.cv_source_type ??
            aiRun.cvSourceType ??
            '',
    )
        .trim()
        .toLowerCase();
    const strengthsMeta = normalizeInsightsMeta(
        source.strengths_meta ?? source.strengthsMeta,
    );
    const weaknessesMeta = normalizeInsightsMeta(
        source.weaknesses_meta ?? source.weaknessesMeta,
    );
    const suggestionsMeta = normalizeInsightsMeta(
        source.suggestions_meta ?? source.suggestionsMeta,
    );
    const rawTier =
        source.plan_tier ??
        source.planTier ??
        source.package_tier ??
        source.packageTier ??
        source.tier;
    const tier =
        typeof source.is_premium === 'boolean'
            ? source.is_premium
                ? 'premium'
                : 'free'
            : typeof source.isPremium === 'boolean'
              ? source.isPremium
                  ? 'premium'
                  : 'free'
              : strengthsMeta?.isPremiumLocked === true ||
                  weaknessesMeta?.isPremiumLocked === true ||
                  suggestionsMeta?.isPremiumLocked === true
                ? 'free'
                : normalizeTier(rawTier);
    const isConverted =
        typeof source.is_converted === 'boolean'
            ? source.is_converted
            : typeof source.isConverted === 'boolean'
              ? source.isConverted
              : false;

    return {
        id: source.id ?? source.resultId ?? source.result_id ?? null,
        aiRunId:
            source.ai_run_id ??
            source.aiRunId ??
            source.runId ??
            source.run_id ??
            null,
        overallScore:
            source.overall_score ?? source.overallScore ?? source.score ?? null,
        atsScore: source.ats_score ?? source.atsScore ?? null,
        clarityScore: source.clarity_score ?? source.clarityScore ?? null,
        impactScore: source.impact_score ?? source.impactScore ?? null,
        strengths: normalizeArray(source.strengths).map(normalizeStrength),
        weaknesses: normalizeArray(source.weaknesses).map(normalizeWeakness),
        suggestions: normalizeArray(source.suggestions).map(
            normalizeSuggestion,
        ),
        structuredFeedback,
        rewriteProposals: normalizeArray(
            source.rewrite_proposals ??
                source.rewriteProposals ??
                structuredFeedback?.rewrite_proposals ??
                structuredFeedback?.rewriteProposals,
        ),
        cvId,
        detailCv: cvId,
        cvSourceType,
        isConverted,
        createdAt: source.created_at ?? source.createdAt ?? null,
        upgradeHint: source.upgrade_hint ?? source.upgradeHint ?? '',
        strengthsMeta,
        weaknessesMeta,
        suggestionsMeta,
        tier,
    };
};

export const formatDateTime = (value) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    });
};

// file: utils.jsx

export const normalizeTier = (value) => {
    const normalized = String(value || '')
        .trim()
        .toLowerCase();
    if (
        normalized.includes('premium') ||
        normalized.includes('pro') ||
        normalized.includes('paid') ||
        normalized.includes('plus') ||
        normalized.includes('vip') ||
        normalized.includes('gold')
    ) {
        return 'premium';
    }
    return 'free';
};

export const getSeverityMeta = (severity) => {
    const normalized = normalizeSeverity(severity);
    if (normalized === 'high') return { label: 'Cao', className: 'high' };
    if (normalized === 'low') return { label: 'Thấp', className: 'low' };
    return { label: 'Trung bình', className: 'medium' };
};

export const getPriorityMeta = (priority) => {
    const normalized = normalizePriority(priority);
    if (normalized === 'high')
        return { label: 'Ưu tiên cao', className: 'high' };
    if (normalized === 'low')
        return { label: 'Ưu tiên thấp', className: 'low' };
    return { label: 'Ưu tiên vừa', className: 'medium' };
};

export const stringifyValue = (value) => {
    if (value == null) return '';
    if (typeof value === 'string' || typeof value === 'number') {
        return String(value);
    }
    if (Array.isArray(value)) {
        return value.map((item) => extractItemText(item)).join(' • ');
    }
    if (typeof value === 'object') {
        return Object.entries(value)
            .map(([key, val]) => `${prettifyKey(key)}: ${stringifyValue(val)}`)
            .join(' | ');
    }
    return String(value);
};
