import type { LogLevel, Logger } from '../statepipe.types';

export const uid = () =>
  crypto.getRandomValues(new Uint32Array(10))[0].toString(16);

export const getLogger = function (
  logLevel: LogLevel = 'verbose',
  prefix = ''
) {
  return {
    getLevel:()=>{
      return logLevel
    },
    changeLevel: (value: LogLevel) => {
      logLevel = value;
    },
    log: (...message: any) => {
      if (logLevel === 'verbose') {
        console.log(`${prefix}`, ...message);
      }
    },
    warn: (...message: any) => {
      if (logLevel !== 'verbose') {
        console.warn(`${prefix}`, ...message);
      }
    },
    error: (...message: any) => {
      if (logLevel === 'error') {
        console.error(`${prefix}`, ...message);
      }
    },
  } as Logger;
};
