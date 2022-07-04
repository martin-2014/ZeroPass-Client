import { isArray } from 'lodash';
import React from 'react';

interface PropsItem {
    children: React.ReactChild[] | React.ReactChild;
    radius?: number;
    height?: number;
}

const FormGroup = (props: PropsItem) => {
    const getStyle = (index: number) => {
        let style: React.HTMLAttributes<HTMLDivElement>['style'] = {
            minHeight: props.height || 60,
        };
        if (props.radius) {
            let radius = '';
            if (!isArray(props.children)) {
                radius = `${props.radius}px`;
            } else {
                if (index === 0) {
                    radius = `${props.radius}px ${props.radius}px 0 0`;
                } else if (index === props.children.length - 1) {
                    radius = `0 0 ${props.radius}px ${props.radius}px`;
                }
            }
            style = { borderRadius: radius, ...style };
        }

        return style;
    };
    return (
        <div style={{ width: '100%' }}>
            {React.Children.map(props.children, (child, index) => {
                if (!React.isValidElement(child)) {
                    return null;
                }
                if (child.type.name === 'FormItem') {
                    const childProps = {
                        ...child.props,
                        extraStyle: getStyle(index),
                    };
                    return React.cloneElement(child, childProps);
                } else {
                    return React.cloneElement(child);
                }
            })}
        </div>
    );
};

export default FormGroup;
