import styles from './index.less';

type Props = {
    disable?: boolean;
    onClick?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
    children?: JSX.Element | string;
    icon?: JSX.Element;
} & React.HTMLAttributes<HTMLDivElement>;

export default (props: Props) => {
    const { onClick, disable, className, children, icon } = props;
    const handleClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        e.stopPropagation();
        onClick?.(e);
    };
    return (
        <div
            {...props}
            onClick={(e) => {
                handleClick(e);
            }}
            className={`${disable ? 'hub-no-drop' : 'hub-primary'} ${className} `}
        >
            <div className={`${styles.pd}`}>
                <span className={styles.icon}>{icon}</span>
                {children}
            </div>
        </div>
    );
};
