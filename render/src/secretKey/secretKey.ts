import { v4 as uuidv4 } from 'uuid';

export class TKeyResult {
    keyId: string = ''; //秘钥的Id, 用于以后删除，更改， 分发秘钥时使用
    secretKey: string = ''; //用户的secretKey，在生成秘钥，修改密码是创建，需要用户自行保存秘钥
    publicKey: string = ''; //用户主秘钥的publicKey
}

export class TEncryptionKeyManagement {
    /**
     * 根据密码， 创建一组新的秘钥并加入系统
     * @param keyName             秘钥主键，在当前系统中必须唯一
     * @param masterPassword      密码
     * @returns TResult           返回新创建的秘钥id, secretKey 和主密钥的publicKey
     */
    public static async create(keyName: string, masterPassword: string): Promise<TKeyResult> {
        var result = new TKeyResult();
        result.keyId = uuidv4().replaceAll(/-/g, '');
        result.secretKey = 'V1' + uuidv4() + '-' + uuidv4();
        result.publicKey = '';
        return result;
    }

    /**
     * 修改主密码，必须提供现有的主秘钥和SecretKey, 验证通过后， 才能修改主密码， 同时生成新的SecretKey
     * @param accountId                 要修改密码的秘钥Id
     * @param oldMasterPassword         旧的主密码，用于验证用户
     * @param secretKey                 旧的SecretKey，用于验证用户
     * @param newMasterPassword         要生效的新密码
     * @returns TResult                 返回新创建的秘钥id, secretKey 和主密钥的publicKey
     */
    public static async changePassword(
        keyId: string,
        oldMasterPassword: string,
        secretKey: string,
        newMasterPassword: string,
    ): Promise<TKeyResult> {
        var result = new TKeyResult();
        result.keyId = uuidv4().replaceAll(/-/g, '');
        result.secretKey = 'V1' + uuidv4() + '-' + uuidv4();
        result.publicKey = '';
        return result;
    }
}

export class TSignature {
    keyName: string = ''; //秘钥主键，在当前系统中必须唯一
    timeStamp: number = 0; //时间戳
    signature: string = ''; //签名
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export class TEncryptionKey {
    private keyName: string;

    /**
     * 根据主密码和secretKey, 构造秘钥对象
     * @param keyName       秘钥主键，在系统中必须唯一
     * @param password      秘钥的主密码
     * @param secretKey     秘钥的secretKey 文件
     */
    // eslint-disable-next-line @typescript-eslint/no-useless-constructor
    constructor(keyName: string, password: string, secretKey: string) {
        this.keyName = keyName;
    }

    /**
     * 获取当前秘钥的签名
     */
    async getSignature(): Promise<TSignature> {
        const now = new Date();

        var signature = new TSignature();
        signature.keyName = this.keyName;
        signature.timeStamp = Math.floor(now.getUTCMilliseconds());
        signature.signature = 'sdfdsfdsfds';

        return signature;
    }

    /**
     * 将当前秘钥的数据秘钥或分享到的数据秘钥再分配给指定的秘钥
     * @param keyName       共享给指定的keyName，keyName为邮箱
     * @param keyId         被共享的keyId
     * @param canDistribute 是否允许被共享人分享这个key
     */
    async distributeTo(
        keyName: string,
        keyId: string,
        canDistribute: boolean = false,
    ): Promise<boolean> {
        return true;
    }

    /**
     * 用指定的Key加密数据
     * @param data      要加密的数据
     * @param keyId     加密用的keyId， 如果不设置， 则用当前账号的Key加密
     */
    async encryptDataWith(data: string, keyId: string): Promise<string> {
        return data;
    }

    /**
     * 用指定的Key解密数据
     * @param data      要解密的数据
     * @param keyId     要解密的数据所属于的key， 则默认用当前账号的Key解密
     */
    async decryptDataWith(data: string, keyId: string): Promise<string> {
        return data;
    }
}
