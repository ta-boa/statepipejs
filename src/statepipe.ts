import { uid, getLogger } from './core/utils'
import { createComponent } from './core/component'
import { InitializationProps, StatepipeProps, Component } from './statepipe.types'

const Statepipe = (props: StatepipeProps) => {
    let components: Component[] = []
    const id = uid()
    const { node, providers, logLevel } = props
    const logger = getLogger(logLevel, id);

    const onAction = (componentId: string, action: string, payload: any): void => {
        logger.log(`${id}.statepipe dispatch '${action}' from ${componentId} payload:`, payload)
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
                    logger,
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
    const { root, selectors, providers, logLevel } = props
    return selectors
        .map((selector) => {
            return Array.from(root.querySelectorAll(selector)).map((node) => {
                if (node instanceof HTMLElement) {
                    return Statepipe({
                        node,
                        providers,
                        logLevel: logLevel || 'verbose',
                    })
                }
            })
        })
        .flat()
}
