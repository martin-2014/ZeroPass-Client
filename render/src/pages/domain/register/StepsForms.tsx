import FormGroup from '@/components/Form/FormGroup';
import FormInput from '@/components/Form/FormInput';
import FormItem from '@/components/Form/FormItem';
import HubAlert from '@/components/HubAlert';
import HubButton from '@/components/HubButton';
import { CheckCircleOutlined } from '@ant-design/icons';
import { ProFormInstance, StepsForm } from '@ant-design/pro-form';
import { useIntl } from 'umi';
import { Input, Space } from 'antd';
import { FormattedMessage } from 'umi';
import PersonalForm from './components/PersonalForm';
import styles from './index.less';
import { strengthBackground, close } from './tools';
import useRegister from '@/pages/domain/register/useRegister';

const getStepsForms = (
    emailName: string,
    formMapRef: React.MutableRefObject<React.MutableRefObject<ProFormInstance<any> | undefined>[]>,
    current: number,
    setCurrent: React.Dispatch<React.SetStateAction<number>>,
) => {
    const {
        loading,
        sendEmail,
        checkCode,
        onFinish,
        getFormEmail,
        showResend,
        resendEmail,
        checkPasswordLevel,
        passwordLevel,
        validatorPassword,
        passwordError,
    } = useRegister(emailName, formMapRef, current, setCurrent);
    const intl = useIntl();
    return [
        <StepsForm.StepForm
            key={'email'}
            requiredMark={false}
            autoFocusFirstInput
            style={{ width: 640 }}
        >
            <PersonalForm form={formMapRef} loading={loading} commit={sendEmail} close={close} />
        </StepsForm.StepForm>,
        <StepsForm.StepForm
            key={'code'}
            requiredMark={false}
            onFinish={() => {
                return checkCode();
            }}
            autoFocusFirstInput
        >
            <div style={{ height: 440 }}>
                <div style={{ display: 'flex', width: 840 }}>
                    <CheckCircleOutlined
                        style={{
                            fontSize: '70px',
                            color: '#009AFF',
                            width: 100,
                        }}
                    />
                    <div
                        style={{
                            margin: '15px 0 15px 0px',
                            fontSize: 24,
                            fontWeight: 500,
                        }}
                    >
                        <FormattedMessage id="register.message.sendCode" />
                        {formMapRef.current.length > 0 ? getFormEmail() : ''}
                    </div>
                </div>

                <div style={{ width: 640, margin: 'auto' }}>
                    <div style={{ height: 40, marginBottom: 20 }}>
                        {showResend ? (
                            <HubAlert
                                msg={
                                    formMapRef.current.length > 0
                                        ? intl.formatMessage({
                                              id: 'register.code.resend.tips',
                                          }) +
                                          ' ' +
                                          getFormEmail()
                                        : ''
                                }
                                type="error"
                            />
                        ) : (
                            <></>
                        )}
                    </div>
                    <div>
                        <FormGroup radius={20} height={100}>
                            <FormItem
                                name="code"
                                rules={[
                                    {
                                        required: true,
                                        whitespace: true,
                                        message: (
                                            <FormattedMessage id="register.form.code.required" />
                                        ),
                                    },
                                ]}
                                hasFeedback
                            >
                                <FormInput isEdit={true} title="register.form.enterCode">
                                    <Input></Input>
                                </FormInput>
                            </FormItem>
                        </FormGroup>
                    </div>
                    <div style={{ marginTop: 20 }}>
                        <div style={{ width: '100%', fontSize: '13px' }}>
                            <div style={{}}>
                                <span style={{ opacity: '0.7' }}>
                                    <FormattedMessage id="register.code.tips" />
                                </span>
                                &nbsp;
                                <a onClick={() => resendEmail()}>
                                    <FormattedMessage id="register.resend" />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className={styles.bottom}>
                <Space className={styles.submit}>
                    <HubButton
                        width={120}
                        height={40}
                        onClick={() => {
                            console.log(current);
                            formMapRef.current[current].current?.setFieldsValue({
                                code: '',
                            });
                            setCurrent(current - 1);
                        }}
                    >
                        {intl.formatMessage({ id: 'common.back' })}
                    </HubButton>
                    <HubButton
                        width={120}
                        height={40}
                        loadingVisible={loading}
                        type="primary"
                        onClick={() => formMapRef.current[current].current?.submit()}
                    >
                        {intl.formatMessage({ id: 'common.next' })}
                    </HubButton>
                </Space>
            </div>
        </StepsForm.StepForm>,
        <StepsForm.StepForm
            key={'final'}
            autoFocusFirstInput
            requiredMark={false}
            onFinish={() => {
                return onFinish();
            }}
        >
            <div style={{ display: 'flex', height: 440 }}>
                <div style={{ width: 80 }}>
                    <CheckCircleOutlined style={{ fontSize: '70px', color: '#009AFF' }} />
                </div>
                <div style={{ width: 640 }}>
                    <div
                        style={{
                            margin: '10px 0',
                            fontSize: 24,
                            position: 'fixed',
                            paddingRight: 20,
                        }}
                    >
                        <FormattedMessage id="register.message.unique" />
                    </div>
                    <div style={{ marginBottom: 20, marginTop: 60 }}>
                        <HubAlert
                            style={{ opacity: '0.7' }}
                            msg={
                                <>
                                    <div>
                                        <FormattedMessage id="register.message.uniquePassword.tips1" />
                                    </div>
                                    <div>
                                        <FormattedMessage id="register.message.uniquePassword.tips1.2" />
                                    </div>
                                    <div>
                                        -&nbsp;
                                        <FormattedMessage id="register.message.uniquePassword.tips2" />
                                        &nbsp; (A-Z)
                                    </div>
                                    <div>
                                        -&nbsp;
                                        <FormattedMessage id="register.message.uniquePassword.tips3" />
                                        &nbsp; (a-z)
                                    </div>
                                    <div>
                                        -&nbsp;
                                        <FormattedMessage id="register.message.uniquePassword.tips4" />
                                        &nbsp; (0-9)
                                    </div>
                                    <div>
                                        -&nbsp;
                                        <FormattedMessage id="register.message.uniquePassword.tips5" />
                                        &nbsp;
                                        <span>
                                            (~!@#$%^&amp;*_-+=`|\(){}
                                            []:;"'&lt;&gt;,.?/)
                                        </span>
                                    </div>
                                </>
                            }
                            type="error"
                            fontSize={13}
                            iconSize={16}
                        />
                    </div>
                    <FormGroup height={84} radius={20}>
                        <FormItem name="password" hasFeedback>
                            <FormInput title="register.form.password">
                                <Input.Password onChange={checkPasswordLevel} />
                            </FormInput>
                        </FormItem>
                    </FormGroup>

                    <div
                        style={{
                            margin: '8px 0',
                            backgroundColor: strengthBackground(passwordLevel),
                            height: 3,
                            width: `${passwordLevel}%`,
                        }}
                    ></div>

                    <FormGroup height={84} radius={20}>
                        <FormItem
                            name="rePassword"
                            dependencies={['password']}
                            rules={[
                                {
                                    validator: validatorPassword,
                                },
                            ]}
                            hasFeedback
                        >
                            <FormInput title="register.form.confirmPassword">
                                <Input.Password />
                            </FormInput>
                        </FormItem>
                    </FormGroup>
                </div>
                <div style={{ width: 90 }}></div>
            </div>
            <div className={styles.bottom}>
                <Space className={styles.submit}>
                    <HubButton
                        width={160}
                        height={40}
                        onClick={() => {
                            setCurrent(current - 1);
                        }}
                    >
                        {intl.formatMessage({ id: 'common.back' })}
                    </HubButton>
                    <HubButton
                        width={160}
                        height={40}
                        loadingVisible={loading}
                        type="primary"
                        disable={!(passwordLevel > 60 && !passwordError)}
                        onClick={() => {
                            formMapRef.current[current].current?.submit();
                        }}
                    >
                        {intl.formatMessage({ id: 'register.form.createAccount' })}
                    </HubButton>
                </Space>
            </div>
        </StepsForm.StepForm>,
    ];
};

export default getStepsForms;
