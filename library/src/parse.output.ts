import parseReducer from "./parse.reducer";
import {StateReducer} from "./statepipe.types";

/**
 * fn:a:b,fn:c
 */
export default (blocks: string) : StateReducer[] => {
    blocks = blocks.trim()
    if (blocks.length) {
      return blocks.split('|').map(parseReducer) as StateReducer[]
    }
    return [];
  };