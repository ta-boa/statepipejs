import { uid, getLogger } from './core/utils'
import { createComponent } from './core/component'
import { InitializationProps, StatepipeProps, Component, LogLevel } from './statepipe.types'

const Statepipe = (props: StatepipeProps) => {
    let components: Component[] = []
    let logLevel: LogLevel = LogLevel.off
    
    const id = uid()
    const { node, providers } = props
    const name = node.dataset.statepipe || id

    if (node.dataset.debug && node.dataset.debug in LogLevel) {
        logLevel = node.dataset.debug as LogLevel
    }
    const logger = getLogger(logLevel, `[${name}]`)

    const onAction = (componentId: string, action: string, payload: any): void => {
        //logger.log(`${id}.statepipe dispatch '${action}' from ${componentId} payload:`, payload)
        components.forEach((comp) => {
            comp.pipeState(action, payload)
        })
    }

    components = Array.from(node.querySelectorAll('[data-component]'))
        .map((node: unknown) => {
            if (node instanceof HTMLElement) {
                return createComponent({
                    node,
                    providers,
                    onAction,
                    origin: name,
                })
            }
        })
        .filter((component) => !!component) as Component[]

    logger.log(`${components.length} components created`)

    //  const handleMutation = (mutations) => {
    //    console.log('mutations', mutations);
    //  };
    //
    //  const observer = new MutationObserver(handleMutation);
    //
    //  const observe = () => {
    //    observer.observe(node, {
    //      subtree: true,
    //      attributeFilter: ['data-sp-trigger', 'data-sp-pipe', 'data-sp-output'],
    //    });
    //    _status = 'observing';
    //  };
    //  const disconect = () => {
    //    observer.disconnect();
    //    _status = 'idle';
    //  };

    return {
        id,
        components,
    }
}

export default (props: InitializationProps) => {
    const { targets: selectors, providers } = props
    return selectors
        .map((selector) => {
            return Array.from(selector.querySelectorAll('[data-statepipe]')).map((node) => {
                if (node instanceof HTMLElement) {
                    return Statepipe({
                        node,
                        providers,
                    })
                }
            })
        })
        .flat()
}
