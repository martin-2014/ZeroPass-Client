import { Button, Result } from 'antd';
import React, { useEffect, useState } from 'react';
import { history } from 'umi';
import { FormattedMessage } from 'umi';

const NoFoundPage: React.FC = () => {
    let title = <FormattedMessage id="err.page.401.personal.title1" />;
    let subTitle = <FormattedMessage id="err.page.401.personal.title2" />;
    if (history.location.query?.type == 'workassigned') {
        title = <FormattedMessage id="err.page.401.work.title1" />;
        subTitle = <FormattedMessage id="err.page.401.work.title2" />;
    }

    return (
        <Result
            status="warning"
            title={title}
            subTitle={subTitle}
            extra={
                <Button type="primary" onClick={() => history.push('/user/login')}>
                    <FormattedMessage id="err.page.401.back" />
                </Button>
            }
        />
    );
};

export default NoFoundPage;
