type NestedValue =
    | { [key: string]: NestedValue | any[] }
    | undefined
    | null
    | string
    | number
    | boolean
    | any[]

export type StateSchema = {
    value: NestedValue
}

export interface StateReducer {
    name: string
    args: string[]
}

export interface Pipe {
    action: string
    reducers: StateReducer[]
}

export interface Trigger {
    id: string
    event: string
    action: string
    reducers: StateReducer[]
}

export interface Component {
    id: string
    pipeState: (action: string, payload: StateSchema) => void
}

export interface ComponentProps {
    node: HTMLElement
    providers: Providers
    onAction: (componentId: string, action: string, state: any) => void
    origin: string
}

export type OutputFunction = (
    ...args: string[]
) => (node: HTMLElement, state: StateSchema) => StateSchema

export type PipeFunction = (
    ...args: string[]
) => (payload: StateSchema, state: StateSchema) => StateSchema

export type TriggerFunction = (
    ...args: string[]
) => (event: Event, state: StateSchema) => StateSchema | undefined

export interface Providers {
    trigger: Record<string, TriggerFunction>
    pipe: Record<string, PipeFunction>
    output: Record<string, OutputFunction>
}

export interface InitializationProps {
    targets: HTMLElement[]
    providers: Providers
}

export interface StatepipeProps {
    node: HTMLElement
    providers: Providers
    logLevel?: LogLevel
}

export enum LogLevel {
    verbose = 'verbose',
    error = 'error',
    warning = 'warning',
    off = 'off',
}
export interface Logger {
    log: (...message: any) => void
    warn: (...message: any) => void
    error: (...message: any) => void
    changeLevel: (value: LogLevel) => void
    getLevel: () => LogLevel
}
