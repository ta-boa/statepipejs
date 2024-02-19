import type { LogLevel, Logger } from './statepipe.types';

export const uid = () =>
  crypto.getRandomValues(new Uint32Array(10))[0].toString(16);

export const getLogger = function (
  severity: LogLevel = 'verbose',
  prefix = ''
) {
  return {
    changeSeverity: (value: LogLevel) => {
      severity = value;
    },
    log: (...message: any) => {
      if (severity === 'verbose') {
        console.log(`${prefix}`, ...message);
      }
    },
    warn: (...message: any) => {
      if (severity !== 'error') {
        console.warn(`${prefix}`, ...message);
      }
    },
    error: (...message: any) => {
      if (severity === 'error') {
        console.error(`${prefix}`, ...message);
      }
    },
  } as Logger;
};
