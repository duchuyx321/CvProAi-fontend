import RichText from './RichText';
import {
    ArraySection,
    ContactSection,
    EducationSection,
    ExperienceSection,
    ObjectSection,
    ProfileSection,
    SkillsSection,
} from './SectionBlocks';

function SectionBody({ section, data, content, layoutType }) {
    switch (section?.type) {
        case 'profile_header':
            return (
                <ProfileSection
                    section={section}
                    data={data}
                    content={content}
                    layoutType={layoutType}
                />
            );

        case 'CONTACT':
            return (
                <ContactSection
                    section={section}
                    data={data}
                    content={content}
                />
            );

        case 'SUMMARY':
            return <RichText value={data} />;

        case 'SKILLS':
            return <SkillsSection section={section} data={data} />;

        case 'EDUCATION':
            return <EducationSection data={data} />;

        case 'EXPERIENCE':
            return <ExperienceSection data={data} />;

        default:
            return Array.isArray(data) ? (
                <ArraySection section={section} data={data} content={content} />
            ) : (
                <ObjectSection
                    section={section}
                    data={data}
                    content={content}
                />
            );
    }
}

export default SectionBody;
