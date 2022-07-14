import { BellOutlined } from '@ant-design/icons';
import { Badge, Spin, Tabs } from 'antd';
import useMergedState from 'rc-util/es/hooks/useMergedState';
import React from 'react';
import { FormattedMessage } from 'umi';
import classNames from 'classnames';
import type { NoticeIconTabProps } from './NoticeList';
import NoticeList from './NoticeList';
import HeaderDropdownWithTip from '../HeaderDropdownWithTip';
import styles from './index.less';
import { NoticeIconItem } from './NoticeIconTypes';

const { TabPane } = Tabs;

export type NoticeIconProps = {
    count?: number;
    bell?: React.ReactNode;
    className?: string;
    loading?: boolean;
    onClear?: () => void;
    onItemClick?: (item: NoticeIconItem, tabProps: NoticeIconTabProps) => void;
    onViewMore?: (tabProps: NoticeIconTabProps, e: MouseEvent) => void;
    onTabChange?: (tabTile: string) => void;
    style?: React.CSSProperties;
    onPopupVisibleChange?: (visible: boolean) => void;
    popupVisible?: boolean;
    clearText?: JSX.Element;
    viewMoreText?: string;
    clearClose?: boolean;
    emptyImage?: string;
    children?: React.ReactElement<NoticeIconTabProps>[] | React.ReactElement<NoticeIconTabProps>;
};

const NoticeIcon: React.FC<NoticeIconProps> & {
    Tab: typeof NoticeList;
} = (props) => {
    const getNotificationBox = (): React.ReactNode => {
        const {
            children,
            loading,
            onClear,
            onTabChange,
            onItemClick,
            onViewMore,
            clearText,
            viewMoreText,
        } = props;
        if (!children) {
            return null;
        }
        const panes: React.ReactNode[] = [];
        React.Children.forEach(children, (child: React.ReactElement<NoticeIconTabProps>): void => {
            if (!child) {
                return;
            }
            const { list, title, tabKey, showClear, showViewMore } = child.props;
            panes.push(
                <TabPane tab={title} key={tabKey}>
                    <NoticeList
                        clearText={clearText}
                        viewMoreText={viewMoreText}
                        list={list}
                        tabKey={tabKey}
                        onClear={(): void => onClear && onClear()}
                        onClick={(item): void => onItemClick && onItemClick(item, child.props)}
                        onViewMore={(event): void => onViewMore && onViewMore(child.props, event)}
                        showClear={showClear}
                        showViewMore={showViewMore}
                        title={title}
                    />
                </TabPane>,
            );
        });
        return (
            <>
                <Spin spinning={loading} delay={300}>
                    <Tabs className={styles.tabs} onChange={onTabChange}>
                        {panes}
                    </Tabs>
                </Spin>
            </>
        );
    };

    const { className, count } = props;

    const [visible, setVisible] = useMergedState<boolean>(false, {
        value: props.popupVisible,
        onChange: props.onPopupVisibleChange,
    });
    const noticeButtonClass = classNames(className, styles.noticeButton);
    const notificationBox = getNotificationBox();
    const trigger = (
        <span
            className={classNames(
                noticeButtonClass,
                { opened: visible },
                styles.account,
                styles.action,
            )}
        >
            <Badge
                count={count}
                size="small"
                style={{ boxShadow: 'none' }}
                className={styles.badge}
            >
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        color: 'white',
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                    }}
                >
                    <BellOutlined />
                </div>
            </Badge>
        </span>
    );
    if (!notificationBox) {
        return trigger;
    }

    return (
        <HeaderDropdownWithTip
            dropDownProps={{
                overlay: notificationBox,
                placement: 'bottomRight',
                overlayClassName: styles.popover,
                visible: visible,
                onVisibleChange: setVisible,
            }}
            tooltipProps={{ title: <FormattedMessage id="menu.notification.tips" /> }}
        >
            {trigger}
        </HeaderDropdownWithTip>
    );
};

NoticeIcon.defaultProps = {
    emptyImage: 'https://gw.alipayobjects.com/zos/rmsportal/wAhyIChODzsoKIOBHcBk.svg',
};

NoticeIcon.Tab = NoticeList;

export default NoticeIcon;
