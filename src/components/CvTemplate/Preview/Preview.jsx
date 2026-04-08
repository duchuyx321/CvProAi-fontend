import Layout from '../Layout';

function Preview({ resumeData = {}, templateConfig = {} }) {
    return (
        <Layout
            resumeData={resumeData}
            templateConfig={templateConfig}
        />
    );
}

export default Preview;