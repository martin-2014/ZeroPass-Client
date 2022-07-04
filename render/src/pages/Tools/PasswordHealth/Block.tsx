import classNames from 'classnames';
import { FileFailed, Help, FileTips, FileDate } from '@icon-park/react';
import { IIconProps } from '@icon-park/react/es/runtime';
import styles from './Block.less';
import { Tooltip } from 'antd';
import { HTMLAttributes } from 'react';

export type Props = {
    selected: boolean;
    onClick: () => void;
    type: 'weak' | 'reused' | 'old';
    title: string;
    tip: string;
    sum: number;
    style?: HTMLAttributes<HTMLDivElement>['style'];
};
const fill = 'rgb(255, 94, 94)';
const IconMap = {
    weak: FileTips,
    reused: FileFailed,
    old: FileDate,
};
type IconType = {
    type: Props['type'];
} & IIconProps;
const Icon = (props: IconType) => {
    const { type, ...rest } = props;
    const Icon = IconMap[type];
    return <Icon {...rest} />;
};

export default (props: Props) => {
    const { selected, onClick, type, tip, style, title, sum } = props;
    return (
        <div
            onClick={() => {
                onClick();
            }}
            className={classNames(
                styles.wrapper,
                selected ? styles.wrapperActive : styles.wrapperInactive,
            )}
            style={style}
        >
            <div className={styles.iconWrapper}>
                <span>
                    <Icon type={type} fill={fill} />
                </span>
            </div>
            <div className={styles.line}></div>
            <div className={styles.RightWrapper}>
                <div className={styles.RightContainer}>
                    <div className={styles.titleWrapper}>
                        <span className={styles.title}>{title}</span>
                        <div className={styles.help}>
                            <Tooltip title={tip}>
                                <Help theme="filled" fill="#009eff"></Help>
                            </Tooltip>
                        </div>
                    </div>
                    <div className={styles.textWrapper}>{sum}</div>
                </div>
            </div>
        </div>
    );
};
