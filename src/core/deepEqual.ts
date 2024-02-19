const deepEqual = (a: any, b: any) :any => {
    if (
      (a === null && b === null) ||
      (a === undefined && b === undefined) ||
      (typeof a === 'string' && typeof b === 'string') ||
      (typeof a === 'number' && typeof b === 'number') ||
      (typeof a === 'boolean' && typeof b === 'boolean') ||
      (a instanceof Function && b instanceof Function) ||
      (a instanceof RegExp && b instanceof RegExp)
    ) {
      return a === b;
    }
    if (Array.isArray(a) && Array.isArray(b) && a.length !== b.length) {
      return false;
    }
    if (a instanceof Date && b instanceof Date) {
      return a.getTime() === b.getTime();
    }
    if (typeof a === 'object' && typeof b === 'object') {
      if (a.constructor !== b.constructor) {
        return false;
      }
      if (a === b || a.valueOf() === b.valueOf()) {
        return true;
      }
      if (!(a instanceof Object)) {
        return false;
      }
      if (!(b instanceof Object)) {
        return false;
      }
      // recursive object equality check
      let p = Object.keys(a);
      return (
        Object.keys(b).every(function (i) {
          return p.indexOf(i) !== -1;
        }) &&
        p.every(function (i) {
          return deepEqual(a[i], b[i]);
        })
      );
    }
    return false;
  };
  
  export default deepEqual;
  