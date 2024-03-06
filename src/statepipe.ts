import { uid, getLogger, getDebugLevelFromElement } from './core/utils'
import { createComponent } from './core/component'
import { InitializationProps, StatepipeProps, Component, LogLevel, StateSchema, StatePipe } from './statepipe.types'

const createStatepipe = (props: StatepipeProps): StatePipe => {
    let components: Component[] = []
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
                    statepipe: name,
                }))
            }
        })

    const handleMutation: MutationCallback = (mutations) => {
        const toInitialize: Component[] = []
        for(let mutation of mutations){
            if (mutation.type == "childList" && mutation.removedNodes.length) {
                for(let n of mutation.removedNodes){
                    // listing components that were removed to dispose
                    components = components.map(c=>{
                        if (c.node === n){
                            c.dispose()
                            return undefined
                        }
                        return c
                    }).filter(c=>!!c) as Component[]
                }
            }
        }
    };

    const observer = new MutationObserver(handleMutation);
    observer.observe(node, {
        subtree: true,
        childList: true
    });

    const dispose = () => {
        observer.disconnect();
    };

    logger.log(`${components.length} components created`)

    return {
        id,
        name,
        dispose
    }
}

export default (props: InitializationProps): StatePipe[] => {
    const { targets, providers } = props
    const apps = targets.map((selector) => {
        return Array.from(selector.querySelectorAll('[data-statepipe]')).map((node) => {
            if (node instanceof HTMLElement) {
                return createStatepipe({
                    node,
                    providers,
                })
            }
        }) as StatePipe[]
    }).flat()
    return apps
}
