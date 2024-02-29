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
    eventArgs: string[]
    action: string
    reducers: StateReducer[]
    target : Window | HTMLElement | Document
}

export interface Component {
    id: string
    pipeState: (action: string, payload: StateSchema) => void
}

export interface ComponentProps {
    node: HTMLElement
    providers: Providers
    onAction: (action: string, state: any) => void
    origin: string
}

export interface OutputProps {
    node: HTMLElement
    state: StateSchema
    args: string[]
}

export interface PipeProps {
    payload: StateSchema
    state: StateSchema
    args: string[]
    node: HTMLElement
}
export interface TriggerProps {
    event: Event
    payload: StateSchema
    args: string[]
}

export type OutputFunction = (props: OutputProps) => void | Promise<any>

export type PipeFunction<T = StateSchema> = (props: PipeProps) => T | Promise<T> | undefined

export type TriggerFunction<T = StateSchema> = (props: TriggerProps) => T | Promise<T> | undefined;

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
    getLevel: () => LogLevel
}

export interface StatePipe {
    id: string
    name: string
}
