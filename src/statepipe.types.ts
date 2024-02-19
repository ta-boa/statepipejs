export type State = any;

export interface Reducer {
  name: string;
  args: string[];
}

export interface Pipe {
  action: string;
  reducers: Reducer[];
}

export interface Trigger {
  id: string;
  event: string;
  action: string;
  reducers: Reducer[];
}

export type OutputFunction = (
  args: any
) => (node: HTMLElement, state: State) => State;
export type PipeFunction = (
  args: any
) => (payload: State, state: State) => State;
export type TriggerFunction = (
  args: any
) => (event: Event, state: State) => [Event, State];

export interface Context {
  triggers?: Record<string, TriggerFunction>;
  pipes?: Record<string, PipeFunction>;
  outputs?: Record<string, OutputFunction>;
  deepEqual?: (a: State, b: State) => boolean;
}

export interface InitializationProps {
  root: HTMLElement;
  selectors: string[];
  context?: Context;
}

export interface StatepipeProps {
  node: HTMLElement;
  context?: Context;
  logger: Logger;
}

export type LogLevel = 'verbose' | 'error' | 'warning';
export interface Logger {
  log: (...message: any) => void;
  warn: (...message: any) => void;
  error: (...message: any) => void;
  changeSeverity: (value: LogLevel) => void;
}

export interface ComponentProps {
  node: HTMLElement;
  context: Context;
  logger: Logger;
  onAction: (componentId: string, action: string, state: any) => void;
}
