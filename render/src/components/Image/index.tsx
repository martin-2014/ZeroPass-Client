import { useEffect, useState } from 'react';
import { memo } from 'react';
import { Avatar, AvatarProps } from 'antd';

export type Props = AvatarProps & {
    defaulticon: React.ReactNode;
};

export default memo((props: Props) => {
    const [src, setSrc] = useState<string | React.ReactNode>();
    useEffect(() => {
        if (props.src === 'defaultFavicon') {
            setSrc(props.defaulticon);
        } else {
            setSrc(`${props.src}`);
        }
    }, [props.src]);

    const handleError = () => {
        setSrc(props.defaulticon);
    };
    return (
        <Avatar
            style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
            {...props}
            src={src}
            onError={handleError}
        ></Avatar>
    );
});
