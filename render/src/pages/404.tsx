import { Button, Result } from 'antd';
import React from 'react';
import { history } from 'umi';
import { FormattedMessage } from 'umi';

const NoFoundPage: React.FC = () => (
    <Result
        status="404"
        title="404"
        subTitle={<FormattedMessage id="err.page.404.title2" />}
        extra={
            <Button type="primary" onClick={() => history.push('/')}>
                <FormattedMessage id="err.page.404.back" />
            </Button>
        }
    />
);

export default NoFoundPage;
