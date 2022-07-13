import { ProFormInstance, StepsForm } from '@ant-design/pro-form';
import styles from './index.less';
import BaseLayout from './baseLayout';
import getStepsForms from './StepsForms';
import { useRef, useState } from 'react';

export const Layout = ({
    children,
    formMapRef,
    current,
    setCurrent,
    header,
}: {
    formMapRef: React.MutableRefObject<React.MutableRefObject<ProFormInstance<any> | undefined>[]>;
    setCurrent: React.Dispatch<React.SetStateAction<number>>;
    current: number;
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
    const formMapRef = useRef<React.MutableRefObject<ProFormInstance<any> | undefined>[]>([]);
    const [current, setCurrent] = useState(0);
    const EMAIL_NAME = 'pemail';

    const StepForms = getStepsForms(EMAIL_NAME, formMapRef, current, setCurrent);

    return (
        <Layout formMapRef={formMapRef} current={current} setCurrent={setCurrent}>
            {StepForms}
        </Layout>
    );
};

export default Register;
