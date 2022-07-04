import { Select } from 'antd';
import { useMemo } from 'react';

type ProfileSelectProps = {
    profiles: MetaMask.BrowserProfile[];
    selectedValue: number;
    onChange: (val: number) => void;
};

const ProfileSelect = (props: ProfileSelectProps) => {
    const { profiles, selectedValue, onChange } = props;

    const getExtensionDisplayName = (extension: MetaMask.ExtensionType) => {
        const mapping = new Map<MetaMask.ExtensionType, string>([
            ['Chrome', 'Chrome Extension'],
            ['Edge', 'Edge Add-on'],
        ]);
        return mapping.get(extension);
    };

    const selectOptions = useMemo(() => {
        const edgeProfileCount: { [k: string]: number } = {};
        profiles
            .filter((p) => p.browser === 'Edge')
            .forEach((p) => {
                edgeProfileCount[p.name] = (edgeProfileCount[p.name] ?? 0) + 1;
            });
        const edgeMultExtension = Object.keys(edgeProfileCount).filter(
            (k) => edgeProfileCount[k] > 1,
        );
        return profiles.map((p, i) => ({
            label:
                `${p.browser}: ${p.displayName}` +
                (p.browser === 'Edge' && edgeMultExtension.includes(p.name)
                    ? ` (${getExtensionDisplayName(p.extension)})`
                    : ''),
            value: i,
        }));
    }, [profiles]);

    return (
        <Select
            style={{ width: '100%' }}
            onChange={onChange}
            value={selectedValue}
            options={selectOptions}
        ></Select>
    );
};

export default ProfileSelect;
