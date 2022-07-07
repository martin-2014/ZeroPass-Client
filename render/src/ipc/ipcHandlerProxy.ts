import { getAllItems as getAllPersonalItems } from '@/services/api/vaultItems';

const getPersonalAllItems = () => {
    return Promise.all([getAllPersonalItems()]);
};

export { getPersonalAllItems };
