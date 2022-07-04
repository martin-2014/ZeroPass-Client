/**
 * @see https://umijs.org/zh-CN/plugins/plugin-access
 * */
export default function access(initialState: {
    currentUser?: API.UserProfile & Partial<API.domain>;
}) {
    const { currentUser } = initialState || {};
    const DomainUser = !!currentUser?.domainId || !!currentUser?.isOwner;
    return {
        DomainUser,
        PersonalUser: !currentUser?.isOwner,
        MgtByOwner: !!currentUser?.isOwner,
        MgtByAdmin: currentUser?.isAdmin || currentUser?.isOwner,
    };
}
