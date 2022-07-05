import React from 'react';
import useLogin from './useLogin';
import getForm from './LoginForm';

const Login: React.FC = () => {
    const { ...rest } = useLogin();

    const Form = getForm({ ...rest });

    return Form;
};

export default Login;
