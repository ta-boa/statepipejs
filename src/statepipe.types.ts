export type StateSchema = {
    value:any
}

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
    pipeState: (action: string, payload: StateSchema) => void
}

export interface ComponentProps {
    node: HTMLElement
    providers: Providers
    onAction: (componentId: string, action: string, state: any) => void
    logger: Logger
}

export type OutputFunction = (args: any) => (node: HTMLElement, state: StateSchema) => StateSchema

export type PipeFunction = (args: any) => (payload: StateSchema, state: StateSchema) => StateSchema

export type TriggerFunction = (args: any) => (event: Event, state: StateSchema) => [Event, StateSchema]

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
    logLevel?: LogLevel
}

export type LogLevel = 'verbose' | 'error' | 'warning'
export interface Logger {
    log: (...message: any) => void
    warn: (...message: any) => void
    error: (...message: any) => void
    changeLevel: (value: LogLevel) => void
    getLevel: () => LogLevel
}
