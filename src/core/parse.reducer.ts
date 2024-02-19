import { Reducer } from "../statepipe.types";

/**
 * Expected formats
 * fn
 * fn:a
 * fn:a:b:...
 */
export default (action: string): Reducer | undefined => {
    if (!action.length) {
      return;
    }
    const [name, ...args] = action.split(':');
    return {
      name:name.trim(),
      args:args.map(arg=>arg.trim()),
    } as Reducer;
  };