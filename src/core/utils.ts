import { LogLevel, Logger } from '../statepipe.types';

export const uid = (length = 8) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  const randomValues = new Uint32Array(length);
  crypto.getRandomValues(randomValues);
  let id = '';
  for (let i = 0; i < length; i++) {
    id += characters[randomValues[i] % charactersLength];
  }
  return id;
}


export const getLogger = function (
  logLevel: LogLevel,
  prefix = ''
) {
  return {
    getLevel: () => {
      return logLevel
    },
    log: (...message: any) => {
      if (logLevel === LogLevel.verbose) {
        console.log(`${prefix}`, ...message);
      }
    },
    warn: (...message: any) => {
      if (logLevel !== LogLevel.verbose) {
        console.warn(`${prefix}`, ...message);
      }
    },
    error: (...message: any) => {
      if (logLevel === LogLevel.error) {
        console.error(`${prefix}`, ...message);
      }
    },
  } as Logger;
};

export const getDebugLevel = (node: HTMLElement, defaultLevel: LogLevel) => {
  if (node.dataset.debug && node.dataset.debug in LogLevel) {
    return node.dataset.debug as LogLevel
  }
  return defaultLevel
}


// export const lensValue = <T extends StateSchema>(
//   path: string,
//   obj: T
// ): T[keyof T] | undefined => {
//   const segments = path.split('.');
//   let current: any = obj;
//   for (const segment of segments) {
//     const match = segment.match(/([^\[\]]+)|\[([0-9]+)\]/g);
//     if (!match) return undefined;
//     for (const part of match) {
//       if (Array.isArray(current) && part.startsWith('[') && part.endsWith(']')) {
//         const index = parseInt(part.slice(1, -1), 10);
//         current = current[index];
//       } else if (typeof current === 'object' && current !== null) {
//         current = current[part];
//       } else {
//         return undefined;
//       }
//     }
//   }
//   return current;
// };


// export const setValue = <T extends StateSchema>(
//   path: string,
//   value: any,
//   obj: T
// ): T => {
//   const segments = path.split('.');
//   let current: any = obj;
//   let parent: any = obj;
//   for (let i = 0; i < segments.length; i++) {
//       const key = segments[i];
//       const isLastSegment = i === segments.length - 1;
//       if (current[key] === undefined) {
//           if (isLastSegment) {
//               parent[key] = value;
//           } else {
//               parent[key] = {};
//           }
//       } else if (!isLastSegment) {
//           if (typeof current[key] !== 'object' || current[key] === null) {
//               return obj; // Stop the loop and return the original object
//           }
//       }
//       parent = current;
//       current = current[key];
//   }
//   return obj;
// }