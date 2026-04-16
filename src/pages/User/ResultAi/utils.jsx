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

export const MOCK_DB_RESULT_Free = {
    success: true,
    data: {
        id: 'mock_result_002',
        ai_run_id: 'run_9999',
        cv_id: 'cv_123',
        overall_score: 75,
        ats_score: 70,
        clarity_score: 80,
        impact_score: 70,
        tier: 'free', // Đang set free để test hiển thị khóa
        created_at: new Date().toISOString(),
        upgrade_hint: 'Nâng cấp Premium để xem toàn bộ phân tích chi tiết.',
        weaknesses: [
            {
                id: 'W1',
                type: 'experience_gap',
                title: 'Thiếu kinh nghiệm làm việc trong môi trường thực tế',
                description:
                    'CV thể hiện ứng viên có các dự án cá nhân nhưng chưa có kinh nghiệm làm việc thực tế tại các công ty.',
                severity: 'high',
                impact_score: 65,
                evidence: {
                    jd: 'Đây là cơ hội để bạn làm việc trong môi trường thực tế...',
                    cv: 'Các dự án SrcPlace và LearnEnglish đều là project tự học cá nhân.',
                    reason: 'Thiếu kinh nghiệm thực tế có thể ảnh hưởng đến khả năng thích ứng với môi trường làm việc chuyên nghiệp.',
                },
                target_section: 'experience',
            },
            {
                id: 'W3',
                type: 'missing_skill',
                title: 'Thiếu kinh nghiệm về thiết kế và duy trì API RESTful/GraphQL',
                description: 'CV chưa nêu bật kinh nghiệm cụ thể về API.',
                severity: 'medium',
                impact_score: 65,
                evidence: {
                    jd: 'Hỗ trợ thiết kế, phát triển và duy trì các API...',
                    cv: 'Backend: Node.js Framework: Express.js',
                    reason: 'Có làm backend nhưng chưa mô tả rõ phần API.',
                },
                target_section: 'experience',
            },
        ],
        weaknesses_meta: {
            visible_count: 2,
            total_count: 6,
            hidden_count: 4,
            is_premium_locked: true,
        },
        suggestions: [
            {
                title: 'Bổ sung kinh nghiệm thực tế',
                action: 'Tìm kiếm cơ hội thực tập tại các công ty có dự án thực tế.',
            },
            {
                title: 'Chi tiết hóa kinh nghiệm API',
                action: 'Mô tả rõ hơn cách đã thiết kế và phát triển API trong các dự án cá nhân.',
            },
        ],
        suggestions_meta: {
            visible_count: 2,
            total_count: 6,
            hidden_count: 4,
            is_premium_locked: true,
        },
        strengths: [
            {
                point: 'Kiến thức Backend vững với Node.js và Express.js',
                detail: 'Ứng viên có dự án cá nhân dùng Node.js, Express.js và JWT.',
            },
            {
                point: 'Có kinh nghiệm dùng Git',
                detail: 'CV thể hiện hiểu biết về gitFlow và quản lý nhánh.',
            },
        ],
        strengths_meta: {
            visible_count: 2,
            total_count: 5,
            hidden_count: 3,
            is_premium_locked: true,
        },
    },
};
export const MOCK_DB_RESULT_Premium = {
    data: {
        overall_score: 75,
        ats_score: 70,
        clarity_score: 80,
        impact_score: 70,
        tier: 'premium',
        weaknesses: [
            {
                id: 'W1',
                type: 'experience_gap',
                title: 'Thiếu kinh nghiệm làm việc trong môi trường thực tế',
                description:
                    "CV thể hiện ứng viên có các dự án cá nhân nhưng chưa có kinh nghiệm làm việc thực tế tại các công ty, không đáp ứng yêu cầu 'tham gia vào các dự án đang vận hành'.",
                severity: 'medium',
                impact_score: 65,
                evidence: {
                    jd: 'Đây là cơ hội để bạn làm việc trong môi trường thực tế, tham gia vào các dự án đang vận hành và học hỏi từ những kỹ sư dày dạn kinh nghiệm.',
                    cv: "Các dự án SrcPlace và LearnEnglish đều được mô tả là 'project tự học cá nhân'.",
                    reason: 'Ứng viên chưa có kinh nghiệm làm việc thực tế, điều này có thể ảnh hưởng đến khả năng thích ứng với quy trình làm việc chuyên nghiệp và áp lực dự án thực tế.',
                },
                target_section: 'experience',
            },
            {
                id: 'W2',
                type: 'missing_skill',
                title: 'Thiếu kinh nghiệm làm việc với cơ sở dữ liệu quan hệ',
                description:
                    'JD yêu cầu kiến thức cơ bản về cơ sở dữ liệu quan hệ (MySQL, PostgreSQL) hoặc NoSQL (MongoDB), tuy nhiên CV chỉ đề cập đến MongoDB.',
                severity: 'low',
                impact_score: 60,
                evidence: {
                    jd: 'Kiến thức cơ bản về cơ sở dữ liệu quan hệ (MySQL, PostgreSQL) hoặc NoSQL (MongoDB).',
                    cv: 'Cơ sở dữ liệu: MongoDB',
                    reason: 'Ứng viên chỉ thể hiện kinh nghiệm với MongoDB, có thể thiếu kiến thức về các hệ quản trị CSDL quan hệ phổ biến khác, mặc dù JD cho phép lựa chọn.',
                },
                target_section: 'skills',
            },
            {
                id: 'W3',
                type: 'missing_skill',
                title: 'Thiếu kinh nghiệm về thiết kế và duy trì API RESTful/GraphQL',
                description:
                    'JD yêu cầu hỗ trợ thiết kế, phát triển và duy trì các API (RESTful hoặc GraphQL), nhưng CV không nêu bật kinh nghiệm cụ thể về khía cạnh này.',
                severity: 'medium',
                impact_score: 65,
                evidence: {
                    jd: 'Hỗ trợ thiết kế, phát triển và duy trì các API (RESTful hoặc GraphQL).',
                    cv: 'Backend: Node.js Framework: Express.js (trong cả hai dự án).',
                    reason: 'Mặc dù sử dụng Express.js cho backend, CV không mô tả chi tiết về việc thiết kế, phát triển hay duy trì API theo chuẩn RESTful hoặc GraphQL, chỉ tập trung vào các tính năng.',
                },
                target_section: 'experience',
            },
            {
                id: 'W4',
                type: 'missing_skill',
                title: 'Thiếu kinh nghiệm về tối ưu hóa CSDL và truy vấn',
                description:
                    'JD có yêu cầu tối ưu hóa cơ sở dữ liệu và truy vấn, nhưng CV không đề cập đến kỹ năng này.',
                severity: 'medium',
                impact_score: 65,
                evidence: {
                    jd: 'Tối ưu hóa cơ sở dữ liệu và truy vấn để đảm bảo hiệu năng hệ thống.',
                    cv: 'CV không đề cập đến việc tối ưu hóa CSDL hay truy vấn.',
                    reason: 'Ứng viên chưa thể hiện kinh nghiệm hoặc kiến thức về việc tối ưu hóa hiệu năng hệ thống thông qua CSDL và truy vấn.',
                },
                target_section: 'experience',
            },
            {
                id: 'W5',
                type: 'missing_skill',
                title: 'Thiếu kinh nghiệm viết tài liệu kỹ thuật',
                description:
                    'JD yêu cầu viết tài liệu kỹ thuật, nhưng CV không có thông tin về kinh nghiệm này.',
                severity: 'low',
                impact_score: 50,
                evidence: {
                    jd: 'Viết tài liệu kỹ thuật cho các tính năng được phân công.',
                    cv: 'CV không đề cập đến việc viết tài liệu kỹ thuật.',
                    reason: 'Ứng viên chưa có kinh nghiệm hoặc chưa thể hiện khả năng viết tài liệu kỹ thuật, một yêu cầu trong JD.',
                },
                target_section: 'experience',
            },
            {
                id: 'W6',
                type: 'missing_skill',
                title: 'Thiếu kinh nghiệm về GraphQL',
                description:
                    'JD có đề cập đến GraphQL như một công nghệ API có thể sử dụng, nhưng CV chỉ tập trung vào Node.js/Express.js mà không đề cập đến GraphQL.',
                severity: 'low',
                impact_score: 50,
                evidence: {
                    jd: 'Hỗ trợ thiết kế, phát triển và duy trì các API (RESTful hoặc GraphQL).',
                    cv: 'CV chỉ đề cập đến Node.js và Express.js.',
                    reason: 'Ứng viên chưa thể hiện kinh nghiệm làm việc với GraphQL, một công nghệ API được đề cập trong JD.',
                },
                target_section: 'skills',
            },
        ],
        suggestions: [
            {
                title: 'Bổ sung kinh nghiệm thực tế',
                action: 'Tìm kiếm các cơ hội thực tập tại các công ty có dự án thực tế để tích lũy kinh nghiệm làm việc trong môi trường chuyên nghiệp.',
            },
            {
                title: 'Mở rộng kiến thức CSDL',
                action: 'Tìm hiểu và thực hành với các hệ quản trị cơ sở dữ liệu quan hệ như MySQL hoặc PostgreSQL song song với MongoDB.',
            },
            {
                title: 'Chi tiết hóa kinh nghiệm API',
                action: 'Trong CV, mô tả rõ hơn về cách đã thiết kế, phát triển và duy trì các API RESTful trong các dự án cá nhân, nêu bật các chuẩn và nguyên tắc đã áp dụng.',
            },
            {
                title: 'Thêm kinh nghiệm tối ưu hóa hiệu năng',
                action: 'Trong phần mô tả dự án, có thể bổ sung các kỹ thuật đã áp dụng để tối ưu hóa truy vấn hoặc hiệu năng cơ sở dữ liệu (nếu có).',
            },
            {
                title: 'Phát triển kỹ năng viết tài liệu',
                action: 'Bắt đầu thực hành viết tài liệu kỹ thuật cho các dự án cá nhân, mô tả kiến trúc, API, hoặc các tính năng quan trọng.',
            },
            {
                title: 'Tìm hiểu về GraphQL',
                action: 'Nếu có hứng thú, nên tìm hiểu và thực hành với GraphQL để mở rộng phạm vi kỹ năng theo yêu cầu của JD.',
            },
        ],
        strengths: [
            {
                point: 'Kiến thức Backend vững chắc với Node.js và Express.js',
                detail: 'Ứng viên thể hiện kinh nghiệm làm việc với Node.js và Express.js thông qua hai dự án cá nhân SrcPlace và LearnEnglish, bao gồm các tính năng như xác thực JWT, tích hợp thanh toán, CRUD.',
            },
            {
                point: 'Kinh nghiệm làm việc với MongoDB',
                detail: 'CV nêu rõ việc sử dụng MongoDB làm cơ sở dữ liệu cho cả hai dự án, cho thấy sự quen thuộc với hệ thống NoSQL.',
            },
            {
                point: 'Kỹ năng Frontend cơ bản',
                detail: 'Ứng viên có đề cập đến các kỹ năng Frontend như HTML, CSS(SCSS), JavaScript và React.js, cho thấy khả năng làm việc full-stack ở mức độ nhất định.',
            },
            {
                point: 'Sử dụng Git hiệu quả',
                detail: "CV mô tả việc sử dụng Git với các nhánh như 'main', 'develop', 'feature/....' và 'gitFlow', cho thấy hiểu biết về quản lý mã nguồn.",
            },
            {
                point: 'Mục tiêu nghề nghiệp rõ ràng',
                detail: 'Ứng viên có mục tiêu ngắn hạn và dài hạn rõ ràng, thể hiện mong muốn học hỏi và phát triển bản thân trong lĩnh vực Backend.',
            },
        ],
        structured_feedback: {
            summary_feedback:
                'Ứng viên có nền tảng kiến thức tốt về Backend với Node.js và Express.js, cùng kinh nghiệm làm việc với MongoDB và Git. Tuy nhiên, còn thiếu kinh nghiệm thực tế trong môi trường công ty, kinh nghiệm về tối ưu hóa CSDL, viết tài liệu kỹ thuật và các công nghệ API cụ thể như GraphQL.',
            format_feedback:
                'CV được trình bày rõ ràng với các phần thông tin liên hệ, kỹ năng, mục tiêu, học vấn và kinh nghiệm dự án. Tuy nhiên, phần kinh nghiệm làm việc thực tế còn trống. Các mô tả dự án chi tiết về công nghệ sử dụng và chức năng chính, có kèm link GitHub.',
        },
    },
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
        structuredFeedback:
            source.structured_feedback ?? source.structuredFeedback ?? null,
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
        ['premium', 'pro', 'paid', 'plus', 'vip', 'gold'].includes(normalized)
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
