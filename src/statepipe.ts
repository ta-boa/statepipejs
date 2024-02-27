import { uid, getLogger, getDebugLevelFromElement } from './core/utils'
import { createComponent } from './core/component'
import { InitializationProps, StatepipeProps, Component, LogLevel, StateSchema, StatePipe } from './statepipe.types'

const getStatePipe = (props: StatepipeProps): StatePipe => {
    const components: Component[] = []
    const id = uid()
    const belongsToHere = (target: Element) => {
        return !nestedStatepipes.find((context: Element) => {
            return context.contains(target)
        });
    }

    const { node, providers } = props
    const name = node.dataset.statepipe || id
    const logger = getLogger(getDebugLevelFromElement(node, LogLevel.off), `[${name}]`)
    const nestedStatepipes = Array.from(node.querySelectorAll("[data-statepipe]"));

    const onAction = (action: string, payload: StateSchema): void => {
        components.forEach((comp) => {
            comp.pipeState(action, payload)
        })
    }

    Array.from(node.querySelectorAll('[data-component]'))
        .forEach((node: Element) => {
            if (node instanceof HTMLElement && belongsToHere(node)) {
                components.push(createComponent({
                    node,
                    providers,
                    onAction,
                    origin: name,
                }))
            }
        })

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
        name,
    }
}

export default (props: InitializationProps): StatePipe[] => {
    const { targets, providers } = props
    const apps = targets.map((selector) => {
        return Array.from(selector.querySelectorAll('[data-statepipe]')).map((node) => {
            if (node instanceof HTMLElement) {
                return getStatePipe({
                    node,
                    providers,
                })
            }
        }) as StatePipe[]
    }).flat()
    return apps
}
