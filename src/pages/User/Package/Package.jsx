import ProfileContainer from '~/components/ProfileContainer';
import PackageMain from './PackageMain';

function Package() {
    return (
        <ProfileContainer
            childrenMain={<PackageMain />}
        />
    );
}

export default Package;