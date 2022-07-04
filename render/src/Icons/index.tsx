import Icon from '@ant-design/icons';
import type { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';
import { MouseEventHandler } from 'react';

const DeleteIcon = () => (
    <svg
        width="1em"
        height="1em"
        viewBox="0 0 200 200"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path
            fill="currentColor"
            d="M164.347,35.653h0a13,13,0,0,1,0,18.385L54.038,164.347a13,13,0,0,1-18.385,0h0a13,13,0,0,1,0-18.385L145.962,35.653A13,13,0,0,1,164.347,35.653Z"
        />
        <path
            fill="currentColor"
            d="M121.58,121.08a9.5,9.5,0,0,1,13.435,0l30.405,30.405a9.5,9.5,0,0,1,0,13.435h0a9.5,9.5,0,0,1-13.435,0l-30.405-30.4A9.5,9.5,0,0,1,121.58,121.08Z"
        />
        <path
            fill="currentColor"
            d="M34.58,35.08a9.5,9.5,0,0,1,13.435,0L78.42,65.485a9.5,9.5,0,0,1,0,13.435h0a9.5,9.5,0,0,1-13.435,0L34.58,48.515A9.5,9.5,0,0,1,34.58,35.08Z"
        />
    </svg>
);

export const Delete = (
    props: Partial<CustomIconComponentProps> & { onClick?: MouseEventHandler<any> | undefined },
) => {
    return <Icon component={DeleteIcon} {...props} />;
};
