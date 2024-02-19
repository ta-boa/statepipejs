import parseReducer from "./parse.reducer";
import {Reducer} from "../statepipe.types";

/**
 * fn:a:b,fn:c
 */
export default (blocks: string) : Reducer[] => {
    blocks = blocks.trim()
    if (blocks.length) {
      return blocks.split('|').map(parseReducer) as Reducer[]
    }
    return [];
  };