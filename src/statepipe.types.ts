export type State = any

export interface Reducer {
    name: string
    args: string[]
}

export interface Pipe {
    action: string
    reducers: Reducer[]
}

export interface Trigger {
    id: string
    event: string
    action: string
    reducers: Reducer[]
}

export interface Component {
    id: string
    pipeState: (action: string, payload: State) => void
}

export interface ComponentProps {
    node: HTMLElement
    providers: Providers
    onAction: (componentId: string, action: string, state: any) => void
    logger: Logger
}

export type OutputFunction = (args: any) => (node: HTMLElement, state: State) => State

export type PipeFunction = (args: any) => (payload: State, state: State) => State

export type TriggerFunction = (args: any) => (event: Event, state: State) => [Event, State]

export interface Providers {
    trigger: Record<string, TriggerFunction>
    pipe: Record<string, PipeFunction>
    output: Record<string, OutputFunction>
}

export interface InitializationProps {
    root: HTMLElement
    selectors: string[]
    providers: Providers
    logLevel?: LogLevel
}

export interface StatepipeProps {
    node: HTMLElement
    providers: Providers
    logger: Logger
}

export type LogLevel = 'verbose' | 'error' | 'warning'
export interface Logger {
    log: (...message: any) => void
    warn: (...message: any) => void
    error: (...message: any) => void
    changeLevel: (value: LogLevel) => void
    getLevel: () => LogLevel
}
