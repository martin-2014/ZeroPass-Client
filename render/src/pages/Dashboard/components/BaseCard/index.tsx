import styles from './index.less';
import { Spin } from 'antd';

type PropsItem = {
    title?: { text?: string | JSX.Element; height?: number; background?: string };
    children: JSX.Element;
    radius?: number;
    loading?: boolean;
    onClick?: (e: any) => void;
    suf?: JSX.Element;
};

const BaseCard = (props: PropsItem) => {
    const radius = props.radius ? props.radius : 0;

    return (
        <div
            onClick={props.onClick}
            className={styles.main}
            style={{ borderRadius: radius, cursor: props.onClick !== undefined ? 'pointer' : '' }}
        >
            <div
                className={styles.header}
                style={{
                    backgroundColor: props.title?.background,
                    borderRadius: `${radius}px ${radius}px 0 0`,
                }}
            >
                <div
                    className={styles.title}
                    style={{
                        height: props.title?.height,
                        lineHeight: props.title?.height ? `${props.title?.height}px` : 0,
                    }}
                >
                    {props.title?.text}
                </div>
                <div className={styles.suf}>{props.suf}</div>
            </div>

            {props.loading ? (
                <Spin className={styles.spin} spinning={props.loading === true} />
            ) : (
                <div className={styles.body}>{props.children}</div>
            )}
        </div>
    );
};

export default BaseCard;
