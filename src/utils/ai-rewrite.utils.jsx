const SECTION_LABELS = {
    all: 'Tất cả',
    summary: 'Mục tiêu',
    experience: 'Kinh nghiệm',
    skills: 'Kỹ năng',
    education: 'Học vấn',
    contact: 'Liên hệ',
    profile: 'Hồ sơ',
    profile_header: 'Hồ sơ',
    projects: 'Dự án',
    certificates: 'Chứng chỉ',
    additional: 'Thông tin khác',
    additional_info: 'Thông tin khác',
};

const PATH_SECTION_MAP = {
    SUMMARY: 'summary',
    EXPERIENCE: 'experience',
    SKILLS: 'skills',
    EDUCATION: 'education',
    CONTACT: 'contact',
    profile_header: 'profile',
    PROFILE_HEADER: 'profile',
    PROJECTS: 'projects',
    CERTIFICATES: 'certificates',
    ADDITIONAL: 'additional',
    ADDITIONAL_INFO: 'additional',
};

const FIELD_LABELS = {
    full_name: 'Họ và tên',
    headline: 'Vị trí ứng tuyển',
    avatar_url: 'Ảnh đại diện',
    email: 'Email',
    phone: 'Số điện thoại',
    address: 'Địa chỉ',
    website: 'Website',
    github: 'GitHub',
    linkedin: 'LinkedIn',
    school: 'Trường học',
    degree: 'Bằng cấp',
    major: 'Chuyên ngành',
    name: 'Tên',
    description: 'Mô tả',
    role: 'Vị trí',
    company: 'Công ty',
    organization: 'Tổ chức',
    issuer: 'Đơn vị cấp',
    title: 'Tiêu đề',
    level: 'Cấp độ',
    category: 'Nhóm',
    start_date: 'Ngày bắt đầu',
    end_date: 'Ngày kết thúc',
    issue_date: 'Ngày cấp',
    date: 'Ngày',
    technologies: 'Công nghệ',
    tech_stack: 'Công nghệ',
    achievements: 'Thành tựu',
    content: 'Nội dung',
    summary: 'Mục tiêu nghề nghiệp',
};

const ITEM_LABELS = {
    experience: 'Kinh nghiệm',
    skills: 'Kỹ năng',
    education: 'Học vấn',
    projects: 'Dự án',
    certificates: 'Chứng chỉ',
    additional: 'Mục',
    contact: 'Thông tin',
    profile: 'Hồ sơ',
};

const VALID_SEVERITIES = new Set(['low', 'medium', 'high']);
const VALID_STATUSES = new Set(['pending', 'applied', 'rejected']);
const VALID_ACTIONS = new Set(['replace', 'add', 'remove']);

export function normalizePlanTier(value) {
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
}

export function resolveUserTier(user, fallbackTier) {
    const planCurrent = user?.planCurrent || user?.plan_current || {};
    const rawTier =
        user?.tier ??
        user?.planTier ??
        user?.packageTier ??
        planCurrent?.tier ??
        planCurrent?.name ??
        planCurrent?.slug ??
        planCurrent?.id ??
        fallbackTier ??
        (planCurrent?.view_full_ai_analysis ? 'premium' : 'free');

    if (planCurrent?.view_full_ai_analysis === true) return 'premium';

    return normalizePlanTier(rawTier);
}

export function resolveResultTier(result) {
    const source = unwrapAiResultSource(result);
    const rawTier =
        source?.ai_rewrite?.tier ??
        source?.aiRewrite?.tier ??
        source?.plan_tier ??
        source?.planTier ??
        source?.package_tier ??
        source?.packageTier ??
        source?.tier;

    if (source?.is_premium === true || source?.isPremium === true) {
        return 'premium';
    }

    if (source?.is_premium === false || source?.isPremium === false) {
        return 'free';
    }

    return normalizePlanTier(rawTier);
}

export function unwrapAiResultSource(raw) {
    const source = raw?.data?.dataValues ?? raw?.data ?? raw?.dataValues ?? raw;

    if (source?.dataValues) {
        return source.dataValues;
    }

    return source || {};
}

function normalizeString(value) {
    return String(value || '').trim();
}

function normalizeLower(value) {
    return normalizeString(value).toLowerCase();
}

export function inferSectionFromTargetPath(targetPath = '') {
    const rootKey = normalizeString(targetPath).split(/[.[\]]/).filter(Boolean)[0];

    if (!rootKey) return '';

    return PATH_SECTION_MAP[rootKey] || normalizeLower(rootKey);
}

export function parseRewriteTargetPath(targetPath = '') {
    const normalizedPath = normalizeString(targetPath);
    const match = normalizedPath.match(
        /^([A-Za-z_]+)(?:\[(\d+)\])?(?:\.(.+))?$/,
    );

    if (!match) {
        return {
            rootKey: '',
            sectionKey: inferSectionFromTargetPath(normalizedPath),
            index: null,
            fieldKey: '',
        };
    }

    const rootKey = match[1];
    const index = match[2] !== undefined ? Number(match[2]) : null;
    const fieldKey = normalizeString(match[3] || '');

    return {
        rootKey,
        sectionKey: normalizeRewriteSectionKey(
            PATH_SECTION_MAP[rootKey] || rootKey,
        ),
        index: Number.isInteger(index) ? index : null,
        fieldKey,
    };
}

export function normalizeRewriteSectionKey(value = '') {
    const normalized = normalizeLower(value).replace(/-/g, '_');

    if (normalized === 'personal_info') return 'profile';
    if (normalized === 'profile_header') return 'profile';
    if (normalized === 'additional_info') return 'additional';

    return normalized;
}

function normalizeSeverity(value) {
    const normalized = normalizeLower(value);
    return VALID_SEVERITIES.has(normalized) ? normalized : 'medium';
}

function normalizeStatus(value) {
    const normalized = normalizeLower(value);
    return VALID_STATUSES.has(normalized) ? normalized : 'pending';
}

function normalizeAction(value) {
    const normalized = normalizeLower(value);
    return VALID_ACTIONS.has(normalized) ? normalized : 'replace';
}

export function normalizeRewriteProposal(item = {}, index = 0) {
    const targetPath =
        item.target_path ?? item.targetPath ?? item.path ?? item.field_path ?? '';
    const targetSection =
        item.target_section ??
        item.targetSection ??
        inferSectionFromTargetPath(targetPath);

    return {
        id: String(item.id ?? item.proposal_id ?? item.proposalId ?? `proposal_${index + 1}`),
        weaknessId: item.weakness_id ?? item.weaknessId ?? '',
        action: normalizeAction(item.action),
        targetSection: normalizeRewriteSectionKey(targetSection),
        targetPath: normalizeString(targetPath),
        targetMeta: parseRewriteTargetPath(targetPath),
        oldText: item.old_text ?? item.oldText ?? item.before ?? '',
        newText: item.new_text ?? item.newText ?? item.after ?? '',
        insertPosition: item.insert_position ?? item.insertPosition ?? '',
        reason: item.reason ?? item.description ?? item.explanation ?? '',
        severity: normalizeSeverity(item.severity),
        estimatedScoreGain:
            item.estimated_score_gain ?? item.estimatedScoreGain ?? null,
        status: normalizeStatus(item.status),
        proposalHash: item.proposal_hash ?? item.proposalHash ?? '',
        appliedAt: item.applied_at ?? item.appliedAt ?? '',
        appliedBy: item.applied_by ?? item.appliedBy ?? '',
        requiresConfirmation: Boolean(
            item.requires_confirmation ?? item.requiresConfirmation,
        ),
    };
}

export function extractRewriteProposals(rawResult) {
    const source = unwrapAiResultSource(rawResult);
    const aiRewrite = source?.ai_rewrite ?? source?.aiRewrite ?? {};
    const structured =
        source?.structured_feedback ?? source?.structuredFeedback ?? {};
    const proposals =
        aiRewrite?.rewrite_proposals ??
        aiRewrite?.rewriteProposals ??
        source?.rewrite_proposals ??
        source?.rewriteProposals ??
        structured?.rewrite_proposals ??
        structured?.rewriteProposals ??
        [];

    return Array.isArray(proposals)
        ? proposals.map((item, index) => normalizeRewriteProposal(item, index))
        : [];
}

export function extractAiRunMeta(rawResult) {
    const source = unwrapAiResultSource(rawResult);
    const aiRewrite = source?.ai_rewrite ?? source?.aiRewrite ?? {};
    const aiRun = source?.ai_run ?? source?.aiRun ?? source?.run ?? {};
    const cvId =
        aiRewrite?.cv_id ??
        aiRewrite?.cvId ??
        source?.cv_id ??
        source?.cvId ??
        source?.detailCv ??
        aiRun?.cv_id ??
        aiRun?.cvId ??
        null;
    const cvSourceType =
        aiRewrite?.cv_source_type ??
        aiRewrite?.cvSourceType ??
        source?.cv_source_type ??
        source?.cvSourceType ??
        aiRun?.cv_source_type ??
        aiRun?.cvSourceType ??
        '';

    return {
        cvId,
        cvSourceType: normalizeLower(cvSourceType),
        isConverted:
            normalizeLower(cvSourceType) === 'uploaded' ? Boolean(cvId) : true,
    };
}

function getProposalPathMeta(proposal = {}) {
    return proposal?.targetMeta || parseRewriteTargetPath(proposal?.targetPath);
}

function getFriendlyFieldLabel(fieldKey = '') {
    const normalizedFieldKey = normalizeString(fieldKey);
    const lastSegment = normalizedFieldKey.split('.').filter(Boolean).pop() || '';
    const cleanFieldKey = lastSegment.replace(/\[\d+\]/g, '');

    if (!cleanFieldKey) return '';

    return (
        FIELD_LABELS[cleanFieldKey] ||
        cleanFieldKey
            .replace(/_/g, ' ')
            .replace(/([a-z])([A-Z])/g, '$1 $2')
            .replace(/^./, (char) => char.toUpperCase())
    );
}

export function getRewriteTargetLabel(proposal = {}) {
    const meta = getProposalPathMeta(proposal);
    const sectionKey = normalizeRewriteSectionKey(
        proposal?.targetSection || meta.sectionKey,
    );
    const sectionLabel = getRewriteSectionLabel(sectionKey);
    const parts = [sectionLabel];

    if (meta.index !== null) {
        parts.push(`${ITEM_LABELS[sectionKey] || 'Mục'} ${meta.index + 1}`);
    }

    if (meta.fieldKey) {
        parts.push(getFriendlyFieldLabel(meta.fieldKey));
    }

    return parts.filter(Boolean).join(' / ');
}

export function getRewriteProposalsForTarget(
    proposals = [],
    {
        sectionKey = '',
        sectionType = '',
        index,
        fieldKey,
        includeItemLevel = true,
    } = {},
) {
    const normalizedSectionKeys = [
        normalizeRewriteSectionKey(sectionKey),
        normalizeRewriteSectionKey(sectionType),
    ].filter(Boolean);
    const normalizedFieldKey =
        typeof fieldKey === 'string' ? normalizeString(fieldKey) : null;
    const normalizedIndex = Number.isInteger(index) ? index : null;

    return getPendingRewriteProposals(proposals).filter((proposal) => {
        const meta = getProposalPathMeta(proposal);
        const proposalSection = normalizeRewriteSectionKey(
            proposal?.targetSection || meta.sectionKey,
        );

        if (
            normalizedSectionKeys.length > 0 &&
            !normalizedSectionKeys.includes(proposalSection)
        ) {
            return false;
        }

        if (normalizedIndex !== null && meta.index !== normalizedIndex) {
            return false;
        }

        if (normalizedFieldKey === null) {
            return true;
        }

        if (proposalSection === 'summary' && normalizedFieldKey === 'summary') {
            return !meta.fieldKey || meta.fieldKey === normalizedFieldKey;
        }

        if (meta.fieldKey === normalizedFieldKey) {
            return true;
        }

        return includeItemLevel && !meta.fieldKey;
    });
}

export function getPendingRewriteProposals(proposals = []) {
    return proposals.filter((proposal) => proposal?.status === 'pending');
}

export function countPendingProposalsBySection(proposals = []) {
    return getPendingRewriteProposals(proposals).reduce((result, proposal) => {
        const sectionKey = proposal?.targetSection || 'additional';
        result[sectionKey] = (result[sectionKey] || 0) + 1;
        return result;
    }, {});
}

export function buildApplyAllSummary(proposals = []) {
    const counts = countPendingProposalsBySection(proposals);

    return Object.entries(counts).map(([sectionKey, count]) => ({
        sectionKey,
        label: getRewriteSectionLabel(sectionKey),
        count,
    }));
}

export function getRewriteSectionLabel(sectionKey = '') {
    const normalized = normalizeRewriteSectionKey(sectionKey);
    return SECTION_LABELS[normalized] || SECTION_LABELS[sectionKey] || 'Khác';
}

export function getSeverityMeta(severity = '') {
    const normalized = normalizeSeverity(severity);

    if (normalized === 'high') {
        return { label: 'Mức độ cao', shortLabel: 'Cao', className: 'high' };
    }

    if (normalized === 'low') {
        return { label: 'Mức độ thấp', shortLabel: 'Thấp', className: 'low' };
    }

    return {
        label: 'Mức độ trung bình',
        shortLabel: 'Trung bình',
        className: 'medium',
    };
}

export function filterRewriteProposals({
    proposals = [],
    section = 'all',
    severity = 'all',
} = {}) {
    const normalizedSection = normalizeRewriteSectionKey(section);
    const normalizedSeverity = normalizeLower(severity);

    return getPendingRewriteProposals(proposals).filter((proposal) => {
        const matchesSection =
            normalizedSection === 'all' ||
            normalizeRewriteSectionKey(proposal?.targetSection) ===
                normalizedSection;
        const matchesSeverity =
            normalizedSeverity === 'all' ||
            proposal?.severity === normalizedSeverity;

        return matchesSection && matchesSeverity;
    });
}
