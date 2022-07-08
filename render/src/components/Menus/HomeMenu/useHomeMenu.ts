import useTagList from '@/hooks/useTagList';
import { useEffect, useState } from 'react';

export default () => {
    const { setTag } = useTagList();
    const [quickFinder, setQuickFinder] = useState(true);

    useEffect(() => {
        setTag();
    }, []);

    const showMenuTools = () => {
        return !quickFinder;
    };

    return {
        quickFinder,
        setQuickFinder,
        showMenuTools,
    };
};
