import { Avatar } from 'antd';
import * as React from 'react';
import styles from './index.less';

interface DomainIconProps {
    name: string;
    logo?: React.ReactNode;
    size?: number;
}

const DomainIcon: React.FC<DomainIconProps> = (props) => {
    const [src, setSrc] = React.useState<React.ReactNode>();
    const [usePrefix, setUsePrefix] = React.useState<boolean>();

    React.useEffect(() => {
        if (props.logo) {
            setSrc(props.logo);
            setUsePrefix(false);
        } else {
            setUsePrefix(true);
        }
    }, [props.logo, props.name]);

    return (
        <Avatar
            className={styles.domainIcon}
            src={src}
            size={props.size}
            style={{
                color: 'rgb(0 177 255)',
                backgroundColor: '#5c5c5c',
                margin: '0 2px 0 1px',
                fontSize: 16,
            }}
        >
            {usePrefix ? props.name.substring(0, 1).toUpperCase() : ''}
        </Avatar>
    );
};

export default DomainIcon;
