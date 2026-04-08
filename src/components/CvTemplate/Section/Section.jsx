import Contact from '../SectionsTypes/Contact';
import Education from '../SectionsTypes/Education';
import Experience from '../SectionsTypes/Experience';
import ProfileHeader from '../SectionsTypes/ProfileHeader';
import Skills from '../SectionsTypes/Skills';
import Summary from '../SectionsTypes/Summary';


function Section({
    zoneKey,
    resumeData = {},
    sectionConfig = {},
    theme = {},
}) {
    if (!sectionConfig?.type) return null;

    switch (sectionConfig.type) {
        case 'profile_header':
            return (
                <ProfileHeader
                    zoneKey={zoneKey}
                    resumeData={resumeData}
                    sectionConfig={sectionConfig}
                    theme={theme}
                />
            );

        case 'contact':
            return (
                <Contact
                    zoneKey={zoneKey}
                    resumeData={resumeData}
                    sectionConfig={sectionConfig}
                    theme={theme}
                />
            );

        case 'skills':
            return (
                <Skills
                    zoneKey={zoneKey}
                    resumeData={resumeData}
                    sectionConfig={sectionConfig}
                    theme={theme}
                />
            );

        case 'summary':
            return (
                <Summary
                    zoneKey={zoneKey}
                    resumeData={resumeData}
                    sectionConfig={sectionConfig}
                    theme={theme}
                />
            );

        case 'education':
            return (
                <Education
                    zoneKey={zoneKey}
                    resumeData={resumeData}
                    sectionConfig={sectionConfig}
                    theme={theme}
                />
            );

        case 'experience':
            return (
                <Experience
                    zoneKey={zoneKey}
                    resumeData={resumeData}
                    sectionConfig={sectionConfig}
                    theme={theme}
                />
            );

        default:
            return null;
    }
}

export default Section;