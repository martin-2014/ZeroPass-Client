import { RegisterItem } from '@/services/api/register';
import { StepsForm } from '@ant-design/pro-form';
import styles from './index.less';
import BaseLayout from './baseLayout';
import getStepsForms, { Props as StepsFormsProps } from './StepsForms';
import useRegister from './useRegister';

let callBackData: RegisterItem;
export const Layout = ({
    children,
    formMapRef,
    current,
    setCurrent,
    header,
}: Pick<StepsFormsProps, 'formMapRef' | 'current' | 'setCurrent'> & {
    children: JSX.Element[];
    header?: string | JSX.Element;
}) => {
    return (
        <BaseLayout header={header || <></>}>
            <div className={styles.form}>
                <StepsForm
                    formMapRef={formMapRef}
                    current={current}
                    onCurrentChange={setCurrent}
                    submitter={{
                        render: () => <></>,
                    }}
                    stepsRender={() => <></>}
                >
                    {children}
                </StepsForm>
            </div>
        </BaseLayout>
    );
};
const Register = () => {
    const EMAIL_NAME = 'pemail';

    const {
        formMapRef,
        checkCode: getCheckCodeData,
        current,
        setCurrent,
        getFinish,
        ...rest
    } = useRegister(EMAIL_NAME);

    const checkCode = async () => {
        const data = await getCheckCodeData();
        if (data) {
            callBackData = data;
            return true;
        }
        return false;
    };

    const onFinish = getFinish(callBackData);

    const StepForms = getStepsForms({
        formMapRef,
        current,
        onFinish,
        setCurrent,
        checkCode,
        ...rest,
    });

    return (
        <Layout formMapRef={formMapRef} current={current} setCurrent={setCurrent}>
            {StepForms}
        </Layout>
    );
};

export default Register;
