import { Base64ToString, StringToBase64, IsEmtpyString } from './unitity/unitity';
import { TCreateKeyModel } from './model/TRegisterModel';
import { TDataKey, TSharedDataKey } from './model/TDataKey';
import { cryptoUntity } from './unitity/cryptoUntity';
import { SecretKey } from './SecretKey';
import { MasterKey } from './MasterKey';
import { DataKey } from './DataKey';
import { TClientKeyPair, TServerPublicKey } from './model/TServerPublicKey';
import { TAuthentication } from './model/TAuthentication';
import { TClientSession } from './model/TClientSession';
import { TCipherResult } from './model/TCipherResult';
import { cryptoServiceAPI as restAPI } from '../cryptoService/api/cryptoService';
import secretRemotePassword from 'secure-remote-password/client';
import { localStore } from '@/browserStore/store';
import SafeCacheProxy from './SafeCacheProxy';

export class TCryptoService {
    private readonly loginSessionKey: string = 'session';

    private session: TClientSession | undefined = undefined;
    constructor() {
        this.session = undefined;
    }

    /**
     * 根据用户名和密码， 导出一组新的秘钥
     * @param identifierName         秘钥主键，在当前系统中必须唯一
     * @param masterPassword      密码
     * @returns TResult           返回新创建的秘钥id, secretKey 和主密钥的publicKey
     *
     */
    public static async createUserKeyModel(
        identifierName: string,
        masterPassword: string,
        secretKey: SecretKey,
    ): Promise<TCreateKeyModel> {
        var masterKey = await MasterKey.derive(masterPassword, secretKey);

        var dataKey = await DataKey.generate();

        var salt = secretRemotePassword.generateSalt().toUpperCase();

        var registerRequest = new TCreateKeyModel();
        registerRequest.salt = salt;
        registerRequest.verifier = await this.deriveVerifier(
            identifierName.toLowerCase(),
            masterKey,
            salt,
        );
        registerRequest.privateDataKey = await masterKey.encryptText(dataKey.PrivateKey);
        registerRequest.publicDataKey = dataKey.PublicKey;

        return registerRequest;
    }

    private static async deriveVerifier(
        identifierName: string,
        masterKey: MasterKey,
        salt: string,
    ) {
        const privateKey = secretRemotePassword.derivePrivateKey(
            salt,
            identifierName.toLowerCase(),
            await masterKey.export(),
        );
        return secretRemotePassword.deriveVerifier(privateKey);
    }

    public async login(identifierName: string, masterPassword: string, secretKey: string) {
        //登录前，先获取服务端的为本次登录所产生的公钥
        var clientKey = secretRemotePassword.generateEphemeral();
        var clientKeyPair = new TClientKeyPair(clientKey.secret, clientKey.public);

        var payload: any = {
            email: identifierName,
            publicKey: clientKeyPair.publicKey,
        };

        var ret = await restAPI.exchangePublicKey(payload);
        if (ret.fail) return ret;

        var masterKey = await MasterKey.derive(masterPassword, new SecretKey(secretKey));
        return await this.authentication(identifierName, masterKey, clientKeyPair, ret.payload);
    }

    private async authentication(
        identifierName: string,
        masterKey: MasterKey,
        clientPair: TClientKeyPair,
        serverPublicKey: TServerPublicKey,
    ) {
        var session = await TClientSession.generateSession(
            identifierName.toLowerCase(),
            masterKey,
            clientPair,
            serverPublicKey,
        );

        var authentication = new TAuthentication();
        authentication.keyId = serverPublicKey.exchangeKeyId;
        const fakeMasterKey = Date.now().toString();
        authentication.request = await this.generateRequestBody(session, fakeMasterKey);

        //去服务端验证
        var serverResult = await restAPI.authentication(authentication);
        if (!serverResult.fail && serverResult.payload !== undefined) {
            //服务端验证客户端成功， 返回了自己的身份证明， 现在该客户端认证服务端是否合法
            var serverIdentifierProof = serverResult.payload;
            try {
                //客户端验证服务端
                var clientIdentifierProof = session.ClientIdentifierProof;
                var secretRemotePasswordProof: any = {
                    key: session.CommunicateKey,
                    proof: clientIdentifierProof.IdentifierProof,
                };
                secretRemotePassword.verifySession(
                    clientPair.publicKey,
                    secretRemotePasswordProof,
                    serverIdentifierProof.identifierProof,
                );
                await this.saveSession(session);
            } catch (error) {
                console.log(error);
            }
        }

        return serverResult;
    }

    private async saveSession(session: TClientSession) {
        await SafeCacheProxy.setItem(this.loginSessionKey, session.export());
        this.session = session;
    }

    private async getSession(): Promise<TClientSession | undefined> {
        if (this.session !== undefined) return this.session;
        const sessionText = await SafeCacheProxy.getItem(this.loginSessionKey);
        if (!IsEmtpyString(sessionText)) {
            var session = new TClientSession();
            return session.import(sessionText);
        }
        return;
    }

    /**
     * 将当前秘钥的数据秘钥或分享到的数据秘钥再分配给指定的秘钥
     * @param accountName   共享给指定的keyName，keyName为邮箱
     * @param keyId         被共享的keyId
     * @param canDistribute 是否允许被共享人分享这个key
     */
    public async distributeTo(
        accountName: string,
        keyId: string,
        canDistribute: boolean = false,
    ): Promise<boolean> {
        var curSesssion = await this.getSession();
        if (curSesssion === undefined) {
            console.log('please login before distribute key');
            return false;
        }

        var payload: any = {
            distributeTo: accountName,
            distributeKeyId: keyId,
            canDistribute: canDistribute,
        };

        var requestBody: any = await this.generateRequestBody(curSesssion, payload);
        var ret = await restAPI.distributeTo(requestBody);
        if (ret.fail === true || ret.payload === undefined) {
            console.log(ret.errorId);
            return false;
        }

        return ret.payload;
    }

    private async generateRequestBody(session: TClientSession, payload: any) {
        if (session === undefined || session.ClientIdentifierProof === undefined) {
            console.log('please login before create request body');
            return false;
        }
        var cipherPayload = await cryptoUntity.AES.encryptObject(payload, session.CommunicateKey);
        return {
            ClientIdentifierProof: session.ClientIdentifierProof,
            Raw: cipherPayload,
            Signature: await TCryptoService.sign(
                session.ClientIdentifierProof,
                cipherPayload,
                session.CommunicateKey,
            ),
        };
    }

    private static async sign(
        clientIdentifier: object,
        payload: string,
        signKey: string,
    ): Promise<string> {
        var signatureText = JSON.stringify(clientIdentifier) + payload;
        return cryptoUntity.HMAC.sign(signatureText, signKey);
    }

    private static async getPrivateDataKey(masterKey: string, dataKey: TDataKey): Promise<string> {
        let selfPrivateKey = await cryptoUntity.AES.decryptText(dataKey.SelfPrivateKey, masterKey);
        if (dataKey.AssignerPrivateKey == undefined) return selfPrivateKey;
        return await TCryptoService.getPrivateDataKeyFromSharedKey(
            selfPrivateKey,
            dataKey.AssignerPrivateKey,
        );
    }

    private static async getPrivateDataKeyFromSharedKey(
        persionalKey: string,
        sharedKey: string,
    ): Promise<string> {
        const sharedKeyInfo = JSON.parse(sharedKey) as TSharedDataKey;
        const plainItemKey = await cryptoUntity.RSA.decryptText(
            sharedKeyInfo.ItemKey,
            persionalKey,
        );
        return await cryptoUntity.AES.decryptText(sharedKeyInfo.CipherText, plainItemKey);
    }

    private static async formatSharedKey(entprisePrivateKey: string, persionalPublicKey: string) {
        const itemKey = await cryptoUntity.AES.generateKey();
        const cipherText = await cryptoUntity.AES.encryptText(entprisePrivateKey, itemKey);
        const cipherItemkey = await cryptoUntity.RSA.encryptText(itemKey, persionalPublicKey);
        //version: 1 - on server side   2 - on client side
        const generatedVersion = 2;
        let sharedDataKey: TSharedDataKey = {
            Version: generatedVersion,
            CipherText: cipherText,
            ItemKey: cipherItemkey,
        };
        return JSON.stringify(sharedDataKey);
    }

    async encryptText(plainText: string, isPersional: boolean): Promise<string> {
        var curSesssion = await this.getSession();
        if (curSesssion === undefined) {
            console.log('please login before encrypt');
            return '';
        }

        const ret = await this.getDataKey(curSesssion, isPersional);
        if (ret === undefined) return '';
        const dataKey = ret as TDataKey;

        const version = 'VT2';
        const type = 'LT';

        var itemDataKey = await cryptoUntity.AES.generateKey();
        var cipherText = await cryptoUntity.AES.encryptText(plainText, itemDataKey);
        var additionalText = version + type + (await cryptoUntity.AES.digest(cipherText));

        //Encrypt item data key with public key
        const cipherItemDataKey = await cryptoUntity.RSA.encryptText(
            itemDataKey,
            dataKey.PublicKey,
        );

        //Sign with private key
        const privateKey = await TCryptoService.getPrivateDataKey(curSesssion.MasterKey, dataKey);
        var preSignature = `${dataKey.AssignerId}${additionalText}${cipherItemDataKey}`;
        const signature = await cryptoUntity.RSA.signData(preSignature, privateKey);

        var ciperResult = new TCipherResult();
        ciperResult.version = version;
        ciperResult.type = type;
        ciperResult.itemDataKey = cipherItemDataKey; //用keyId 加密了
        ciperResult.cipherText = cipherText;
        ciperResult.signature = signature;

        var jsonCipherResult = JSON.stringify(ciperResult);
        return StringToBase64(jsonCipherResult);
    }

    async generateSharedKey(userId: number): Promise<string> {
        var curSesssion = await this.getSession();
        if (curSesssion === undefined) {
            console.log('please login before encrypt');
            return '';
        }

        //Get assignee public key
        var publicKeyResult = await restAPI.getUserPublicDataKey(userId);
        if (publicKeyResult.fail === true || publicKeyResult.payload === undefined) {
            return '';
        }

        //Get enterprise private data key
        const enterpriseDataKey = await this.getDataKey(curSesssion, false);
        if (enterpriseDataKey === undefined) return '';
        const assignerPrivateDataKey = await TCryptoService.getPrivateDataKey(
            curSesssion.MasterKey,
            enterpriseDataKey,
        );

        return TCryptoService.formatSharedKey(assignerPrivateDataKey, publicKeyResult.payload);
    }

    private static getCacheKeyOfDataKey(isPersional: boolean): string {
        return isPersional
            ? `datakey-persional-${localStore.lastUserId}@${localStore.personalDomainId}`
            : `datakey-enterprise-${localStore.lastUserId}@${localStore.currentDomainId}`;
    }

    private async getDataKey(
        session: TClientSession,
        isPersional: boolean,
    ): Promise<TDataKey | undefined> {
        const cacheKey = TCryptoService.getCacheKeyOfDataKey(isPersional);
        let cachedDataKey = await SafeCacheProxy.getItem(cacheKey);
        if (cachedDataKey.length > 0) return JSON.parse(cachedDataKey) as TDataKey;

        const requester = isPersional
            ? restAPI.getDataKeyForPersonal
            : restAPI.getDataKeyForEnterprise;
        var payload: any = { timestamp: Date.now() };
        var requestBody: any = await this.generateRequestBody(session, payload);
        var ret = await requester(requestBody);
        if (ret.fail === true || ret.payload === undefined) {
            return;
        }

        // Data keys decryption
        var dataKeyjson = await cryptoUntity.AES.decryptText(ret.payload, session.CommunicateKey);
        await SafeCacheProxy.setItem(cacheKey, dataKeyjson);
        return JSON.parse(dataKeyjson) as TDataKey;
    }

    async removeEnterpriseDataKeyCache() {
        const cacheKey = TCryptoService.getCacheKeyOfDataKey(false);
        await SafeCacheProxy.setItem(cacheKey, '');
    }

    async preCacheDataKey(isPersional: boolean) {
        var curSesssion = await this.getSession();
        if (curSesssion !== undefined) {
            await this.getDataKey(curSesssion, isPersional);
        }
    }

    async decryptText(cipherText: string, isPersional: boolean): Promise<string> {
        var curSesssion = await this.getSession();
        if (curSesssion === undefined) {
            console.log('please login before decrypt');
            return '';
        }

        const ret = await this.getDataKey(curSesssion, isPersional);
        if (ret === undefined) return '';
        const dataKey = ret as TDataKey;

        var cipherJsonText = Base64ToString(cipherText);
        var cipherResult = JSON.parse(cipherJsonText) as TCipherResult;
        var additionalText =
            cipherResult.version +
            cipherResult.type +
            (await cryptoUntity.AES.digest(cipherResult.cipherText));

        //Verify
        var preSignature = `${dataKey.AssignerId}${additionalText}${cipherResult.itemDataKey}`;
        const verifyResult = await cryptoUntity.RSA.verifyData(
            dataKey.PublicKey,
            preSignature,
            cipherResult.signature,
        );
        if (!verifyResult) return '';

        const privateKey = await TCryptoService.getPrivateDataKey(curSesssion.MasterKey, dataKey);
        const plainItemDataKey = await cryptoUntity.RSA.decryptText(
            cipherResult.itemDataKey,
            privateKey,
        );
        return await cryptoUntity.AES.decryptText(cipherResult.cipherText, plainItemDataKey);
    }

    async ChangePassword(newPassword: string, oldPassword: string, secretKey: string) {
        var curSesssion = await this.getSession();
        if (curSesssion === undefined) {
            console.log('please login before change password');
            return false;
        }

        var oldMasterKey = await MasterKey.derive(oldPassword, new SecretKey(secretKey));
        var masterKey = await MasterKey.derive(newPassword, new SecretKey(secretKey));

        var salt = secretRemotePassword.generateSalt();
        //在服务器上重新加密privateKey
        var payload: any = {
            salt: salt,
            verifier: await TCryptoService.deriveVerifier(curSesssion.accountName, masterKey, salt),
            oldMasterKey: await oldMasterKey.export(), //用旧的主秘钥解开privateDataKey
            newMasterKey: await masterKey.export(), //用新的主秘钥重新加密privateDataKey
        };

        var requestBody: any = await this.generateRequestBody(curSesssion, payload);
        var ret = await restAPI.changePassword(requestBody);
        if (ret.fail === true) {
            console.log(ret.errorId);
            return false;
        }

        var loginRet = await this.login(curSesssion.accountName, newPassword, secretKey);
        if (loginRet.fail === true) {
            console.log('修改密码后生效失败了, 请重新登录');
            return false;
        }

        return true;
    }

    logout() {
        this.session = undefined;
        SafeCacheProxy.clearAll();
    }
}
