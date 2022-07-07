import { RoamingSettingData } from '@/components/RightContent/Settings/DataRoamingSetting';

class LocalStore {
    get currentDomainId() {
        const currentDomainId = localStorage.getItem('currentDomainId');
        if (currentDomainId) {
            return +currentDomainId;
        } else {
            return 0;
        }
    }
    get personalDomainId() {
        const currentDomainId = localStorage.getItem('personalDomainId');
        if (currentDomainId) {
            return +currentDomainId;
        } else {
            return 0;
        }
    }
    set skipAdmin(value: boolean) {
        localStorage.setItem('skipAdmin', value.toString());
    }
    set skipUser(value: boolean) {
        localStorage.setItem('skipUser', value.toString());
    }
    get skipAdmin() {
        return localStorage.getItem('skipAdmin') === 'true';
    }
    get skipUser() {
        return localStorage.getItem('skipUser') === 'true';
    }
    set currentDomainId(value: number) {
        localStorage.setItem('currentDomainId', value.toString());
    }
    set personalDomainId(value: number) {
        localStorage.setItem('personalDomainId', value.toString());
    }
    get lastUser() {
        const value = localStorage.getItem('lastUser');
        if (value) {
            return value;
        } else {
            return '';
        }
    }
    set lastUser(value: string) {
        localStorage.setItem('lastUser', value);
    }

    get rememberUser() {
        const value = localStorage.getItem('rememberUser');
        if (value == 'true' || value == undefined) {
            return true;
        } else {
            return false;
        }
    }
    set rememberUser(value: boolean) {
        let tmp;
        if (value) {
            tmp = 'true';
        } else {
            tmp = 'false';
        }
        localStorage.setItem('rememberUser', tmp);
    }

    get lastUserId() {
        const value = localStorage.getItem('lastUserId');
        if (value) {
            return +value;
        } else {
            return 0;
        }
    }

    set lastUserId(value: number) {
        localStorage.setItem('lastUserId', `${value}`);
    }

    get isUpdateAutomatically() {
        const value = localStorage.getItem('isUpdateAutomatically');
        return !value || value == 'true' ? true : false;
    }

    set isUpdateAutomatically(value: boolean) {
        var valueString = value ? 'true' : 'false';
        localStorage.setItem('isUpdateAutomatically', valueString);
    }

    get lock() {
        const value = localStorage.getItem('lock');
        return value ? +value : 0;
    }

    set lock(value: number) {
        localStorage.setItem('lock', value.toString());
    }

    get closeOption() {
        const value = localStorage.getItem('closeOption');
        if (!value) return null;

        return +value;
    }

    set closeOption(value: number | null) {
        if (value != null) {
            localStorage.setItem('closeOption', value.toString());
        }
    }

    get roamingSetting(): RoamingSettingData {
        const value = localStorage.getItem('roamingSetting');
        const emptyValue: RoamingSettingData = { enable: false };
        if (!!value) {
            try {
                return JSON.parse(value!) as RoamingSettingData;
            } catch {
                return emptyValue;
            }
        }
        return emptyValue;
    }

    set roamingSetting(value: RoamingSettingData) {
        if (!!value) {
            localStorage.setItem('roamingSetting', JSON.stringify(value));
        } else {
            localStorage.removeItem('roamingSetting');
        }
    }
}

class SessionStore {
    get token() {
        return sessionStorage.getItem('token')!;
    }
    set token(value: string) {
        sessionStorage.setItem('token', value);
    }
    get versionClosed() {
        return sessionStorage.getItem('versionClosed')!;
    }
    set versionClosed(value: string) {
        sessionStorage.setItem('versionClosed', value);
    }
    get deviceId() {
        return sessionStorage.getItem('deviceId')!;
    }
    set deviceId(value: string) {
        sessionStorage.setItem('deviceId', value);
    }
    get lock() {
        return sessionStorage.getItem('lock')!;
    }
    set lock(value: string) {
        sessionStorage.setItem('lock', value);
    }

    get nextSyncTime() {
        return +(sessionStorage.getItem('nextSyncTime') ?? '0');
    }

    set nextSyncTime(time: number) {
        sessionStorage.setItem('nextSyncTime', `${time}`);
    }
}

class SecretKeyStore {
    private generateStoreKey(email: string) {
        return `zeropass-secret-key-${email.toLocaleLowerCase()}`;
    }

    public getKeys(user: string) {
        let result = {};
        const keys = localStorage.getItem(this.generateStoreKey(user));
        if (keys) {
            result = JSON.parse(keys);
        }
        return result;
    }

    public getSecretKey(email: string): null | string {
        return localStorage.getItem(this.generateStoreKey(email));
    }

    public setSecretKey(email: string, secretKey: string) {
        localStorage.setItem(this.generateStoreKey(email), secretKey);
    }
}

export const localStore = new LocalStore();

export const sessionStore = new SessionStore();

export const secretKeyStore = new SecretKeyStore();
