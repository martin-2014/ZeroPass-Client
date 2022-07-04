import { useContext } from 'react';
import { ListContext } from './ListContext';
import { TagsContext } from './TagsContext';

export const useList = () => useContext(ListContext);

export const useTag = () => useContext(TagsContext);
