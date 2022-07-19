import React from 'react';
import getForm from './LoginForm';

const Login: React.FC = () => {
    const Form = getForm();
    return Form;
};

export default Login;
