import {AbstractLevelDOWN} from 'abstract-leveldown';
import * as IORedis from "ioredis";
import {Redis, RedisOptions as RedisOptionsObject} from "ioredis";
import {EncodeToolsNative} from '@etomon/encode-tools';
import {BinaryEncoding, HashAlgorithm, IDFormat, SerializationFormat} from "@etomon/encode-tools/lib/EncodeTools";
import {EncodingOptions} from "@etomon/encode-tools/lib/EncodeToolsNative";

type ExistingRedis = { redis: Redis };
type Callback<T> = (error: Error|null, result?: T)=>void
type RedisOptionsArray = [number, (string|RedisOptions)?,RedisOptions?];
type RedisOptions = { redis: ExistingRedis }|undefined|number|string|RedisOptionsObject|RedisOptionsArray;

const DEFAULT_ENCODING_OPTIONS: EncodingOptions = {
  binaryEncoding: BinaryEncoding.base64,
  hashAlgorithm: HashAlgorithm.xxhash3,
  serializationFormat: SerializationFormat.msgpack,
  uniqueIdFormat: IDFormat.uuidv4String
};

export class IORedisDown<K,V> extends AbstractLevelDOWN<K,V>{

  public db: Redis;
  protected hashSeed = 0;
  protected enc: EncodeToolsNative;
  constructor(location: string, encodingOptions = DEFAULT_ENCODING_OPTIONS) {
    super(location);
    this.enc = new EncodeToolsNative(encodingOptions);
  }

  protected async _openAsync(options: RedisOptions): Promise<void> {
    if ((typeof (options) === 'object') && typeof((options as ExistingRedis).redis) !== 'undefined') {
      this.db = (options as ExistingRedis).redis;
    } else {
      this.db = new IORedis(
        // @ts-ignore
        ...(Array.isArray(options) ? options as RedisOptionsArray : [options])
      );
    }
  }

  public _open(options: RedisOptions, callback: Callback<void>) {
    this._openAsync(options)
      .then(
        () => callback(null)
      )
      .catch(
        (err) => callback(err)
      );
  }

  public _serializeKey(key: K): string {
    let { XXHash3 } = EncodeToolsNative.xxhashNative();
    let hasher = new XXHash3(this.hashSeed);

    let buf = hasher.hash(Buffer.isBuffer(key) ? key : this.enc.serializeObject<K>(key, SerializationFormat.json));
    return this.enc.encodeBuffer(buf).toString('utf8');
  }

  protected async _putAsync(key: string, value: V, options: unknown): Promise<void> {
    let data = this.enc.serializeObject<V>(value);

    await this.db.setBuffer(key, data);
  }

  public _put(key: string, value: V, options: unknown, callback: Callback<void>) {
    this._putAsync(key, value, options)
      .then(
        () => callback(null)
      )
      .catch(
        (err) => callback(err)
      );
  }

  protected async _getAsync(key: string, options: unknown): Promise<V> {
    let data = await this.db.getBuffer(key);

    if (!data) throw new Error(`NotFound`)

    let value = this.enc.deserializeObject<V>(data);
    return value;
  }

  public _get(key: string, options: unknown, callback: Callback<V>) {
    this._getAsync(key, options)
      .then(
        (value) => callback(null, value)
      )
      .catch(
        (err) => callback(err)
      );
  }

  protected async _delAsync(key: string, options: unknown): Promise<void> {
    await this.db.del(key);
  }

  public _del(key: string, options: unknown, callback: Callback<void>) {
    this._delAsync(key, options)
      .then(
        () => callback(null)
      )
      .catch(
        (err) => callback(err)
      );
  }
}

