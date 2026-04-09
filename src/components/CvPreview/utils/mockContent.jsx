export const defaultMockContent = {
    profile_header: {
      full_name: 'Lê Đức Huy',
      headline: 'Backend Developer Intern',
      avatar_url:
        'http://res.cloudinary.com/djzsbcrk9/image/upload/v1775665562/cvproai/gk3gemyc8ydzzvcm4epa.jpg',
      summary:
        'Sinh viên định hướng Backend Developer, yêu thích API, database và xây dựng sản phẩm web thực tế.',
    },
  
    CONTACT: {
      email: 'duchuy08t@gmail.com',
      phone: '0901 234 567',
      address: 'Đà Nẵng, Việt Nam',
      website: 'github.com/duchuy08t',
    },
  
    SKILLS: [
      { name: 'Node.js', level: 85 },
      { name: 'ExpressJS', level: 80 },
      { name: 'NestJS', level: 72 },
      { name: 'MySQL', level: 78 },
      { name: 'MongoDB', level: 70 },
      { name: 'ReactJS', level: 65 },
    ],
  
    EXPERIENCE: [
      {
        company: 'CVProAI',
        role: 'Backend Developer Intern',
        start_date: '01/2025',
        end_date: 'Hiện tại',
        description:
          'Xây dựng hệ thống CV động, API cho template, preview và export PDF.',
        achievements: [
          'Thiết kế schema config-driven cho CV',
          'Đồng bộ editor trái và preview phải realtime',
          'Tổ chức layout theo STACK / SPLIT / BANNER_SPLIT',
        ],
      },
    ],
  
    EDUCATION: [
      {
        school: 'Đại học Bách khoa',
        degree: 'Công nghệ thông tin',
        start_date: '2022',
        end_date: '2026',
        description:
          'Tập trung Web Development, Database, Software Engineering.',
      },
    ],
  
    PROJECTS: [
      {
        name: 'CVProAI',
        tech_stack: 'ReactJS, SCSS, Node.js, Express, MySQL',
        description:
          'Website tạo CV động với nhiều template, custom content, theme, layout.',
        link: '',
      },
    ],
  };
  
  export const mockContentByTemplateCode = {
    DEV_01: {
      ...defaultMockContent,
    },
    CV_MODERN_01: {
      ...defaultMockContent,
      profile_header: {
        ...defaultMockContent.profile_header,
        full_name: 'Lê Đức Huy',
        headline: 'Backend Developer',
      },
    },
    CV_MODERN_02: {
      ...defaultMockContent,
      profile_header: {
        ...defaultMockContent.profile_header,
        full_name: 'Lê Đức Huy',
        headline: 'Backend Developer Intern',
      },
    },
  };
  
  export function getMockContent(templateCode) {
    return mockContentByTemplateCode[templateCode] || defaultMockContent;
  }