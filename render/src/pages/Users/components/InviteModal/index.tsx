import { FormattedMessage, useIntl } from 'umi';
import { Input, Form } from 'antd';
import { useState, useRef } from 'react';
import SimpleModal from '@/components/SimpleModal';
import { addUser } from '@/services/api/userManager';
import HubAlert from '@/components/HubAlert';
import _ from 'lodash';
import pattern from '@/utils/pattern';
import InviteExistedUser from '../InviteExistedModal';
import message from '@/utils/message';

const { TextArea } = Input;

interface PropsItem {
    visible: boolean;
    close: () => void;
}

const InviteUser = (props: PropsItem) => {
    const [existedVisible, setExistedVisible] = useState(false);
    const [existedEmails, setExistedEmails] = useState<string[]>([]);
    const [ownerEmails, setOwnerEmails] = useState<string[]>([]);
    const [email, setEmail] = useState<string[]>([]);
    const Intl = useIntl();
    const formRef = useRef(null);
    const [loading, setLoading] = useState<boolean>(false);

    const onFinish = async (e) => {
        setLoading(true);
        const res = await addUser(email);
        if (res.fail) {
            message.error(Intl.formatMessage({ id: 'users.invite.failed' }));
        } else {
            message.success(Intl.formatMessage({ id: 'users.invite.success' }));
            if (res.payload?.existedEmails.length > 0 || res.payload?.ownerEmails.length > 0) {
                setExistedVisible(true);
                setExistedEmails(res.payload?.existedEmails);
                setOwnerEmails(res.payload?.ownerEmails);
            }
            props.close();
        }
        setLoading(false);
    };

    const sendInvite = async () => {
        formRef.current?.submit();
    };
    const emailChanged = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        if (value) {
            const emails = value
                .split(',')
                .filter((v) => !_.isEmpty(v))
                .map((v) => v.trim());
            setEmail(emails);
        }
    };

    const maxEmailCount = (rule: any, data: string) => {
        const count = data.split(',').length;
        if (count > 10) {
            return Promise.reject();
        } else {
            return Promise.resolve();
        }
    };

    return (
        <>
            <SimpleModal
                visible={props.visible}
                loading={loading}
                close={props.close}
                width={500}
                title={Intl.formatMessage({ id: 'users.invite.title' })}
                closable
                okText={<FormattedMessage id="common.sendInvite" />}
                onOk={sendInvite}
                destroyOnClose
            >
                <Form
                    style={{ width: '100%' }}
                    onFinish={onFinish}
                    ref={formRef}
                    className={StyleSheet.main}
                >
                    <Form.Item
                        noStyle
                        name={'emails'}
                        rules={[
                            {
                                required: true,
                                validateTrigger: 'onBlur',
                                pattern: pattern.inviteEmails,
                                message: Intl.formatMessage({ id: 'users.invite.formatError' }),
                            },
                            {
                                required: true,
                                validateTrigger: 'onBlur',
                                validator: maxEmailCount,
                                message: Intl.formatMessage({ id: 'users.invite.maxEmail' }),
                            },
                        ]}
                    >
                        <TextArea
                            autoSize={{ minRows: 3, maxRows: 10 }}
                            placeholder={Intl.formatMessage({ id: 'users.invite.placeHolder' })}
                            onChange={emailChanged}
                        ></TextArea>
                    </Form.Item>
                    <Form.Item noStyle>
                        <HubAlert
                            type="warning"
                            msg={Intl.formatMessage({ id: 'users.invite.hubAlert' })}
                        />
                    </Form.Item>
                </Form>
            </SimpleModal>
            <InviteExistedUser
                visible={existedVisible}
                emails={existedEmails}
                ownerEmails={ownerEmails}
            ></InviteExistedUser>
        </>
    );
};

export default InviteUser;
