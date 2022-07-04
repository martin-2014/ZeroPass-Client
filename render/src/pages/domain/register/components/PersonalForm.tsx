import { useState, useRef, useEffect } from 'react';
import { Space, Input, Select } from 'antd';
import { FormattedMessage, useIntl } from 'umi';
import pattern from '@/utils/pattern';
import styles from '../index.less';
import { ProFormInstance } from '@ant-design/pro-form';
import { checkPersonalEmail } from '@/services/api/register';
import { ValidateStatus } from 'antd/lib/form/FormItem';
import { ReactNode } from 'react';
import FormItem from '@/components/Form/FormItem';
import FormInput from '@/components/Form/FormInput';
import FormGroup from '@/components/Form/FormGroup';
import * as validators from '@/utils/validators';
import HubButton from '@/components/HubButton';
import AgreeService from './AgreeService';

interface PropItems {
    form: React.MutableRefObject<React.MutableRefObject<ProFormInstance<any> | undefined>[]>;
    loading: boolean;
    commit: () => void;
    close: () => void;
}

const PersonalForm = (props: PropItems) => {
    const [emailStatus, setEmailStatus] = useState<ValidateStatus>();
    const [emailMsg, setEmailMsg] = useState<ReactNode>(null);
    const [lastEmail, setLastEmail] = useState<string>('');
    const form = useRef<ProFormInstance>();
    const [agree, setAgree] = useState(false);

    const intl = useIntl();

    useEffect(() => {
        if (props.form.current[0]) {
            form.current = props.form.current[0].current;
        }
    }, [props.form]);

    const checkEmail = async (e: React.FocusEvent<HTMLInputElement, Element>) => {
        const email = e.target.value;
        if (email) {
            if (!pattern.email.test(email)) {
                setEmailStatus('error');
                setEmailMsg(intl.formatMessage({ id: 'register.email.pattern.error' }));
            } else if (email != lastEmail) {
                setLastEmail(email);
                setEmailStatus('validating');
                setEmailMsg('');
                const res = await checkPersonalEmail(email);
                if (!res.fail) {
                    setEmailStatus('success');
                    setEmailMsg(null);
                } else {
                    setEmailStatus('error');
                    setEmailMsg(intl.formatMessage({ id: res.errorId }));
                }
            }
        }
    };

    const emailOnChange = (e: React.FocusEvent<HTMLInputElement, Element>) => {
        if (form.current?.getFieldValue('pemail')) {
            form.current?.setFieldsValue({ pemail: e.target.value.trim() });
        }

        setEmailMsg(null);
        setEmailStatus('');
        setLastEmail('');
    };

    const agreeService = (status: boolean) => {
        setAgree(status);
    };

    const commit = async () => {
        await form.current?.validateFields(['pemail']);
        props.commit();
    };

    return (
        <div>
            <div style={{ height: 440 }}>
                <div className={styles.firstTitle}>
                    <FormattedMessage id="register.form.personal.title" />
                </div>
                <div style={{ height: 310 }}>
                    <FormGroup radius={20} height={100}>
                        <FormItem name="accountType" initialValue={2}>
                            <FormInput isEdit={true} title="register.form.plan.type">
                                <Select
                                    options={[
                                        {
                                            label: intl.formatMessage({
                                                id: 'register.personal.type.standard',
                                            }),
                                            value: 2,
                                        },
                                    ]}
                                ></Select>
                            </FormInput>
                        </FormItem>
                        <FormItem
                            name="pemail"
                            hasFeedback
                            validateStatus={emailStatus}
                            help={emailMsg}
                            rules={[
                                {
                                    required: true,
                                    message: <FormattedMessage id="register.email.required" />,
                                },
                                validators.limit64,
                                validators.noBlank,
                            ]}
                        >
                            <FormInput isEdit={true} title="register.email">
                                <Input
                                    onBlur={(e) => checkEmail(e)}
                                    onChange={emailOnChange}
                                ></Input>
                            </FormInput>
                        </FormItem>
                    </FormGroup>
                </div>
                <AgreeService onChange={agreeService} />
            </div>
            <div className={styles.bottom}>
                <Space className={styles.submit}>
                    <HubButton width={120} height={40} onClick={props.close}>
                        {intl.formatMessage({ id: 'common.cancel' })}
                    </HubButton>
                    <HubButton
                        disable={!agree || emailStatus !== 'success'}
                        width={120}
                        height={40}
                        loadingVisible={props.loading}
                        type="primary"
                        onClick={commit}
                    >
                        {intl.formatMessage({ id: 'common.next' })}
                    </HubButton>
                </Space>
            </div>
        </div>
    );
};

export default PersonalForm;
