# IO Redis Down

This repository is a very simple implementation of [`abstract-leveldown`](https://github.com/Level/abstract-leveldown) using [`ioredis`](https://github.com/luin/ioredis) (redis) as the data store.

I couldn't get [`redis-down`](https://github.com/hmalphettes/redisdown) to function properly and figured the [`abstract-leveldown`](https://github.com/Level/abstract-leveldown) API was simple enough to re-implement.

## Usage

```
  const { IORedisDown } = require('@etomon/ioredisdown');
  const Redis = require('ioredis');
  const levelup = require('levelup');
  
  //  A connection string
  let db = levelup(new IORedisDown('blah'), 'redis://localhost:6379');
  
  // As an object containing settings
  db = levelup(new IORedisDown('blah'), {
    host: '127.0.0.1',
    port: 6379
  });
  
  // Pass your own redis
  const redis = new Redis(6379, '127.0.0.1');
  
  db = levelup(new IORedisDown('blah'), {
    redis: redis
  });
```

## Options

The options (second) parameter in `levelup` gets passed directly to the constructor of IORedis.
  
If an array is passed it will spread the array elements across the constructor.

So ` db = levelup(new IORedisDown('blah'), [ 6379, '127.0.0.1' ]) `

and 
```
  const redis = new Redis(6379, '127.0.0.1');
  
  db = levelup(new IORedisDown('blah'), {
    redis: redis
  });
```
Are equivalent

## Encoding

I didn't have time to figure out how `encoding-down` works so encoding/decoding is currently handled by [`@etomon/encode-tools](https://github.com/EtomonUSA/encode-tools).

Crucially, data will be serialized as [`msgpack`](https://npmjs.org/@msgpack/msgpack) by default. Keys will be serialized as JSON, then hashed using [xxhash3](https://npmjs.org/xxhash-addon).

The second argument of the `IORedisDown` constructor can be used to configure the `EncodeTools` instance.


At present, the hashing algorithm must be `xxhash3`.

By default, these are the settings 
```
const DEFAULT_ENCODING_OPTIONS: EncodingOptions = {
  // If Buffers need to be encoded as string they will be encoded as base64
  binaryEncoding: BinaryEncoding.base64,
  // * This is ignored, must be xxhash3 *
  hashAlgorithm: HashAlgorithm.xxhash3,
  // By default will store data as msgpack
  serializationFormat: SerializationFormat.msgpack,
  // Not used
  uniqueIdFormat: IDFormat.uuidv4String
}
```

## Building 

`@etomon/ioredisdown` is written in TypeScript, to build run `npm run build`.

## Documentation

Documentation can be [found here](https://etomonusa.github.io/ioredisdown).

## License

Etomon IORedisDown is licensed under the GNU LGPL-3.0, a copy of which can be found at [https://www.gnu.org/licenses/](https://www.gnu.org/licenses/).
