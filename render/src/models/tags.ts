import { useState } from 'react';

export type Tag = {
    path: string;
    name: string;
};

export type Tags = {
    workassigned?: Tag[];
    personal?: Tag[];
};

export default () => {
    const [tags, setTags] = useState<Tags>();
    return { tags, setTags };
};
