import styles from './index.less';

export type HomeListDropdownMenuType = {
    icon: JSX.Element;
    data?: any;
    func?: (data: any) => void;
};
interface Props<T> {
    FirstIcon?: JSX.Element;
    more?: JSX.Element;
}

export default function <T>(props: Props<T>) {
    const { FirstIcon } = props;
    return (
        <div className={styles.wrapper}>
            <div>{FirstIcon || <div style={{ width: 20, height: 20 }}></div>}</div>
            <div>{props.more}</div>
        </div>
    );
}
