import { history } from 'umi';

const strengthBackground = (passwordLevel: number) => {
    if (passwordLevel > 60) {
        return '#8ce32f';
    } else if (passwordLevel < 60) {
        return '#ff4e00';
    } else {
        return '#ffc600';
    }
};

const close = () => {
    history.push({
        pathname: '/user/login',
    });
};
export { strengthBackground, close };
