import ProfileHeaderSection from '../sections/ProfileHeaderSection';
import ContactSection from '../sections/ContactSection';
import SkillsSection from '../sections/SkillsSection';
import ExperienceSection from '../sections/ExperienceSection';
import EducationSection from '../sections/EducationSection';
import ProjectsSection from '../sections/ProjectsSection';

const session = {
    profile_header: ProfileHeaderSection,
    CONTACT: ContactSection,
    SKILLS: SkillsSection,
    EXPERIENCE: ExperienceSection,
    EDUCATION: EducationSection,
    PROJECTS: ProjectsSection,
}

export default function sectionResolver(sectionType) {
 return session[sectionType] ?? null
}