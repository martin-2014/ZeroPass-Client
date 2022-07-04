import PasswordGenerator from '@/components/PasswordGenerate/generator';
import PasswordHistory from '@/components/PasswordGenerate/history';
import { useState } from 'react';

const ToolsPasswordGenerator = () => {
    const [showHistory, setShowHistory] = useState(false);

    const onSwitch = () => {
        setShowHistory(!showHistory);
    };
    return (
        <div style={{ padding: '16px 56px', height: '100%' }}>
            {showHistory ? (
                <PasswordHistory onSwitch={onSwitch} />
            ) : (
                <PasswordGenerator onSwitch={onSwitch} isWeb={true} visible={true} />
            )}
        </div>
    );
};

export default ToolsPasswordGenerator;
