import { Redirect, useModel } from 'umi';

export default () => {
    const { initialState } = useModel('@@initialState');
    const user = initialState?.currentUser;
    if (user) {
        if (user?.isAdmin) {
            return <Redirect to="/workassigned/favourites" />;
        } else {
            return <Redirect to="/personal/favourites" />;
        }
    } else {
        return <Redirect to="/user/login" />;
    }
};
