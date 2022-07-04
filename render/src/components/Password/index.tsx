import { useState, useEffect } from 'react';
import { Input } from 'antd';

const MAX_LENGTH = 255;
export default () => {
    const [showPassWord, setShowPassWord] = useState(false);

    return (
        <>
            {showPassWord ? (
                <Input.Password maxLength={MAX_LENGTH} />
            ) : (
                <Input
                    maxLength={MAX_LENGTH}
                    ref={passwordRef}
                    style={{ height: '27px', borderRadius: '3px' }}
                    onChange={() => {
                        changeToEdit?.(true);
                    }}
                    suffix={
                        !isShowPassWord ? (
                            <EyeInvisibleOutlined
                                style={{ cursor: 'pointer' }}
                                onClick={() => {
                                    handleShowPwd(true);
                                }}
                            />
                        ) : loading ? (
                            <LoadingOutlined />
                        ) : (
                            <EyeTwoTone
                                onClick={() => {
                                    handleShowPwd(false);
                                }}
                            />
                        )
                    }
                ></Input>
            )}
        </>
    );
};
