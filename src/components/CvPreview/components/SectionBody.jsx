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

function renderSectionBody({ section, data, content, layoutType }) {
    switch (section?.type) {
        case 'profile_header':
            return ProfileSection({
                section,
                data,
                content,
                layoutType,
            });

        case 'CONTACT':
            return ContactSection({
                section,
                data,
                content,
            });

        case 'SUMMARY':
            return RichText({ value: data });

        case 'SKILLS':
            return SkillsSection({ section, data });

        case 'EDUCATION':
            return EducationSection({ data });

        case 'EXPERIENCE':
            return ExperienceSection({ data });

        default:
            return Array.isArray(data) ? (
                ArraySection({
                    section,
                    data,
                    content,
                })
            ) : (
                ObjectSection({
                    section,
                    data,
                    content,
                })
            );
    }
}

function SectionBody(props) {
    try {
        return renderSectionBody(props);
    } catch (error) {
        console.error('CvPreview section render failed', {
            sectionType: props?.section?.type,
            error,
        });
        return null;
    }
}

export default SectionBody;
