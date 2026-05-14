import { distributedKVStore } from '@kit.ArkData';
import { window } from '@kit.ArkUI';
import { UIAbility } from '@kit.AbilityKit';
import { BusinessError } from '@kit.BasicServicesKit';
import common from '@ohos.app.ability.common';
import LogUtil from '../utils/LogUtil';


export interface KVStoreInterface {
  addData(key: string, value: string) : Promise<boolean>;
  getData(key: string) : Promise<string | undefined>;
  deleteData(key: string) : void;
};


class KVStore {
  static TAG: string = 'KVStore';
  private kvManager: distributedKVStore.KVManager | undefined = undefined;
  private kvStore: distributedKVStore.SingleKVStore | undefined = undefined;
  private name: string = '';

  constructor(kvManager: distributedKVStore.KVManager, name: string) {
    this.kvManager = kvManager;
    this.name = name;
  }

  public async create() : Promise<boolean> {
    try {
      let res = await this.getKVStore_(this.name);
      return res;
    } catch (err) {
      LogUtil.error(KVStore.TAG, `Failed to create KVStore. Code:${err.code},message:${err.message}`);
      return false;
    }
  }

  private getKVStore_(name: string) : Promise<boolean> {
    const options: distributedKVStore.Options = {
      createIfMissing: true,
      encrypt: false,
      backup: false,
      autoSync: false,
      // kvStoreType不填时，默认创建多设备协同数据库
      kvStoreType: distributedKVStore.KVStoreType.SINGLE_VERSION,
      // 多设备协同数据库：kvStoreType: distributedKVStore.KVStoreType.DEVICE_COLLABORATION,
      securityLevel: distributedKVStore.SecurityLevel.S3
    };
    return new Promise((resolve, reject) => {
      try {
        this.kvManager!.getKVStore<distributedKVStore.SingleKVStore>(name, options, (err, store: distributedKVStore.SingleKVStore) => {
          if (err) {
            LogUtil.error(KVStore.TAG, `Failed to get KVStore for ${name}: Code:${err.code},message:${err.message}`);
            resolve(false);
            return;
          }
          LogUtil.info(KVStore.TAG, `success get KVStore for ${name}`);
          this.kvStore = store;
          resolve(true);
        });
      } catch (err) {
        resolve(false);
      }
    });
  }

  public async addData(key: string, value: string) : Promise<boolean> {
    return new Promise((resolve, reject) => {
      try {
        this.kvStore?.put(key, value, (err) => {
          if (err) {
            LogUtil.error(KVStore.TAG, `Failed to put data. Code:${err.code},message:${err.message} ${this.name} - ${key} - ${value}`);
            resolve(false);
            return;
          }
          LogUtil.info(KVStore.TAG, `success add data. name: ${this.name} key:${key},value:${value}`);
          resolve(true);
        });
      } catch (err) {
        LogUtil.error(KVStore.TAG, `An unexpected error occurred. Code:${err.code},message:${err.message}`);
        resolve(false);
      }
    });
  }

  public deleteData(key: string) {
    this.kvStore?.delete(key, (err) => {
      if (err) {
        LogUtil.error(KVStore.TAG, `Failed to delete data. Code:${err.code},message:${err.message} ${this.name} - ${key}`);
        return;
      }
      LogUtil.info(KVStore.TAG, `success delete data: ${this.name} - ${key}`);
    });
  }

  public async getData(key: string): Promise<string | undefined> {
    return new Promise((resolve, reject) => {
      this.kvStore?.get(key, (err, data) => {
        if (err) {
          LogUtil.error(KVStore.TAG, `Failed to get data. Code:${err.code},message:${err.message} ${this.name} - ${key}`);
          resolve(undefined);
          return;
        }
        LogUtil.info(KVStore.TAG, `success get data. name: ${this.name} key:${key},date:${data as string}`);
        resolve(data as string);
      });
    });
  }
};


class KVManager {
  static TAG: string = 'KVManager';
  private kvManager: distributedKVStore.KVManager | undefined = undefined;
  private kvStores: Map<string, KVStore> = new Map();

  constructor() {

  }

  public init(ctx: common.UIAbilityContext) {
    if (this.kvManager) {
      return;
    }
    try {
      const kvManagerConfig: distributedKVStore.KVManagerConfig = {
        context: ctx,
        bundleName: "com.haitai.htrlbrowser"
      };
      this.kvManager = distributedKVStore.createKVManager(kvManagerConfig);
      if (this.kvManager == undefined) {
        LogUtil.error(KVManager.TAG, `Failed to create KVManager`);
        return;
      }
      LogUtil.info(KVManager.TAG, `success create KVManager.`);
    } catch (err) {
      LogUtil.error(KVManager.TAG, `Failed to create KVManager. Code:${err.code},message:${err.message}`);
    }
  }

  public async getKVStore(name: string) : Promise<KVStoreInterface | undefined> {
    if (!this.kvManager) {
      LogUtil.error(KVManager.TAG, `Failed to get KVStore, kvManager is undefined`);
      return Promise.resolve(undefined);
    }
    if (this.kvStores.has(name)) {
      return this.kvStores.get(name);
    }
    let kvStore: KVStore = new KVStore(this.kvManager, name);
    let flag: boolean = await kvStore.create();
    if (flag) {
      this.kvStores.set(name, kvStore);
      return Promise.resolve(kvStore);
    } else {
      return Promise.resolve(undefined);
    }
  }
};

export let kvManager = new KVManager();
