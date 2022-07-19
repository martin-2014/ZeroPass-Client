import { FormattedMessage } from 'umi';
import { Checkbox } from 'antd';
import { openServiceAggreement, openPrivacy } from '@/utils/tools';
import type { CheckboxChangeEvent } from 'antd/es/checkbox';

const AgreeService = (props: { onChange: (status: boolean) => void }) => {
    const onChange = (e: CheckboxChangeEvent) => {
        props.onChange(e.target.checked);
    };
    return (
        <div style={{ fontSize: 13 }}>
            <Checkbox onChange={onChange} />
            &nbsp;
            <span className="helpInfo">
                <FormattedMessage id="register.service.tips.1" />
            </span>
            <a onClick={openServiceAggreement}>
                <FormattedMessage id="register.service.tips.2" />
            </a>
            <span className="helpInfo">
                <FormattedMessage id="register.service.tips.3" />
            </span>
            <a onClick={openPrivacy}>
                <FormattedMessage id="register.service.tips.4" />
            </a>
            <span className="helpInfo">
                <FormattedMessage id="register.service.tips.5" />
            </span>
        </div>
    );
};

export default AgreeService;
