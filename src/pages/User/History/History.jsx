import ProfileContainer from '~/components/ProfileContainer';
import HistoryMain from './HistoryMain';

function History() {
    return (
        <ProfileContainer
            childrenMain={<HistoryMain />}
        />
    );
}

export default History;