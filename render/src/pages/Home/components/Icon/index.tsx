import { CSSProperties } from 'react';

type IconProps = {
    src: string;
    size?: number;
    style?: CSSProperties;
};

export default (props: IconProps) => {
    const { size = 14, src, style } = props;
    return (
        <img
            width={size}
            height={size}
            src={src}
            onClick={(e) => {
                e.stopPropagation();
            }}
            style={style}
        />
    );
};
