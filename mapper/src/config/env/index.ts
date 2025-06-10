import * as env from './env';

Object.entries(env)
    .forEach(([key, value]) => {
      if (typeof value === 'undefined')
        console.log(`\x1B[31m[process.env]: ${key} is not defined\x1B[39m`);
    });

export * from './env';