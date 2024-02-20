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

export interface Component {
  id:string,
  pipeState:()=>void
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

export interface Providers {
  trigger: Record<string, TriggerFunction>;
  pipe: Record<string, PipeFunction>;
  output: Record<string, OutputFunction>;
}

export interface InitializationProps {
  root: HTMLElement;
  selectors: string[];
  providers: Providers;
}

export interface StatepipeProps {
  node: HTMLElement;
  providers: Providers;
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
  providers: Providers;
  onAction: (componentId: string, action: string, state: any) => void;
}
