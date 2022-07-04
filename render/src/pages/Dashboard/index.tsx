import { FC } from 'react';
import TopApps from './components/TopApps';
import AppCount from './components/AppCount';
import UserCount from './components/UserCount';
import MachineCount from './components/MachineCount';
import PendingUserList from './components/PendingUserList';
import PasswordMon from './components/Password';

const Dashboard: FC = () => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '10px' }}>
            <div style={{ flex: 0.15, marginBottom: 10 }}>
                <div style={{ display: 'flex', flexDirection: 'row', height: '100%' }}>
                    <div style={{ flex: 0.33, marginRight: 10 }}>
                        <AppCount />
                    </div>
                    <div style={{ flex: 0.34, marginRight: 10, marginLeft: 10 }}>
                        <UserCount />
                    </div>
                    <div style={{ flex: 0.33, marginLeft: 10 }}>
                        <MachineCount />
                    </div>
                </div>
            </div>
            <div style={{ flex: 0.35, marginBottom: 10 }}>
                <div style={{ display: 'flex', flexDirection: 'row', height: '100%' }}>
                    <div style={{ flex: 0.49 }}>
                        <PendingUserList />
                    </div>
                    <div style={{ flex: 0.02 }}></div>
                    <div style={{ flex: 0.49 }}>
                        <PasswordMon />
                    </div>
                </div>
            </div>
            <div style={{ flex: 0.5 }}>
                <TopApps />
            </div>
        </div>
    );
};

export default Dashboard;
