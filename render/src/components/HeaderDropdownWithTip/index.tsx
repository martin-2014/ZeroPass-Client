import type { DropDownProps } from 'antd/es/dropdown';
import type { TooltipProps } from 'antd/es/tooltip';
import { Tooltip } from 'antd';
import HeaderDropdown, { HeaderDropdownProps } from '../HeaderDropdown';
import { Children, useState } from 'react';

export type HeaderDropdownWithTipProps = {
    dropDownProps: HeaderDropdownProps & { onVisibleChange?: any };
    tooltipProps: TooltipProps;
    children: JSX.Element;
};

const HeaderDropdownWithTip = (props: HeaderDropdownWithTipProps) => {
    const [showTips, setShowTips] = useState(false);

    const OnDropdownVisibleChange = (visible: boolean) => {
        if (visible) {
            setShowTips(false);
        }

        if (props.dropDownProps.onVisibleChange) {
            props.dropDownProps.onVisibleChange(visible);
        }
    };

    const OnTooltipVisibleChange = (visible: boolean) => {
        if (visible && !showTips) {
            setShowTips(true);
        }
        if (!visible && showTips) {
            setShowTips(false);
        }
    };

    return (
        <Tooltip
            {...props.tooltipProps}
            visible={showTips}
            onVisibleChange={OnTooltipVisibleChange}
        >
            <HeaderDropdown
                {...props.dropDownProps}
                trigger={['click']}
                onVisibleChange={OnDropdownVisibleChange}
            >
                {props.children}
            </HeaderDropdown>
        </Tooltip>
    );
};

export default HeaderDropdownWithTip;
