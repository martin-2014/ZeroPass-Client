import { Menu, Typography } from 'antd';
import * as React from 'react';
import DomainIcon from '../DomainIcon';

const { Text } = Typography;

interface DomainSwitchProps {
    domains: API.domain[];
    onSwitch?: (id: number) => void;
}

const DomainSwitchMenu: React.FC<DomainSwitchProps> = (props) => {
    const switchDomain = async (id: number) => {
        if (props.onSwitch !== undefined) {
            props.onSwitch(id);
        }
    };

    return (
        <Menu>
            {props.domains.map((v) => (
                <Menu.Item
                    key={v.domainId}
                    icon={<DomainIcon size={24} logo={v.logo} name={v.domainName ?? 'ERROR'} />}
                    onClick={(e) => {
                        e.domEvent.stopPropagation();
                        switchDomain(v.domainId);
                    }}
                >
                    <Text style={{ width: 150 }} ellipsis={{ tooltip: v.company }}>
                        {v.company}
                    </Text>
                </Menu.Item>
            ))}
        </Menu>
    );
};

export default DomainSwitchMenu;
