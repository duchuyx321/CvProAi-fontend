export const router = {
    // Public
    home: '/',
    login: '/login',
    register: '/register',
    forgotPassword: '/forgot-password',
    otp_verify: '/otp/verify',
    reset_pass: '/otp/reset',
    verify_success: '/verify/success',
    forgot_password: '/forgot-password',
    cvSample: '/cv-templates',
    CvDetail: '/cv-templates/:code',
    pricing: '/pricing',

    // User
    dashboard: '/dashboard',
    cvTemplates: '/user/cv-templates',
    CvTemplateDetail: '/cv-templates/:code',

    // CV editor
    createCv: '/create-cv/:code',
    editCv: '/edit-cv/:slug',

    myCvs: '/my-cvs',
    aiAnalysis: '/ai-analysis',
    aiAnalysisResult_route: '/ai-analysis/result/',
    aiAnalysisResult: '/ai-analysis/result/:aiRunId',
    upgradePremium: '/upgrade-premium',
    profile: '/profile',
    security: '/security',
    package: '/package',
    history: '/history',
    payment: '/checkout/:payment_id',
    paymentSuccess: '/payment/success/:orderId',
    upgradeOptions: '/upgrade-options/:slug',

    // Admin
    adminDashboard: '/admin/dashboard',
    manageUsers: '/admin/manage-users',
    manageTemplates: '/admin/templates',
    createTemplate: '/admin/templates/new',
    previewTemplate: '/admin/templates/:templateId/preview',
    editTemplate: '/admin/templates/:templateId/edit',
    adminSettings: '/admin/settings',
    managePackages: '/admin/packages',
    adminOrders: '/admin/orders',
};