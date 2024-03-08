import { uid, getLogger, getDebugLevelFromElement } from './core/utils'
import { createComponent } from './core/component'
import { InitializationProps, StatepipeProps, Component, LogLevel, StateSchema, StatePipe } from './statepipe.types'

const createStatepipe = (props: StatepipeProps): StatePipe => {
    let components: Component[] = []
    const id = uid()
    const { node, providers } = props

    const name = node.dataset.statepipe || id
    const logger = getLogger(getDebugLevelFromElement(node, LogLevel.off), `[${name}]`)

    const onAction = (action: string, payload: StateSchema): void => {
        components.forEach((comp) => {
            comp.pipeState(action, payload)
        })
    }

    const filterMutations = (list: NodeList) => Array.from(list).filter(n => n.nodeType === 1)

    const handleMutation: MutationCallback = (mutations) => {
        for (let mutation of mutations) {
            if (mutation.type === "childList") {
                if (mutation.removedNodes.length) {
                    // listing components that were removed to dispose
                    for (let rmNode of filterMutations(mutation.removedNodes)) {
                        // prevent from iterating over #text changes
                        components = components.map(c => {
                            if (c.node === rmNode) {
                                c.dispose()
                                return undefined
                            }
                            return c
                        }).filter(c => !!c) as Component[]
                    }
                }
                if (mutation.addedNodes.length) {
                    // listing components that were removed to dispose
                    for (let newNode of filterMutations(mutation.addedNodes)) {
                        // prevent from iterating over #text changes
                        if (newNode instanceof HTMLElement && newNode.hasAttribute("data-component")) {
                            components.push(createComponent({
                                node: newNode,
                                providers,
                                onAction,
                                statepipe: name
                            }))
                        }
                    }
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
        components.forEach(c => c.dispose())
        components.length = 0
    };

    const addComponent = (el: HTMLElement) => {
        components.push(createComponent({
            node: el,
            providers,
            onAction,
            statepipe: name,
        }))
    }

    const removeComponent = (el: HTMLElement) => {
        if (components.find((item)=>item.node === el)){
            console.log("rmeove", el)
        }
    }

    logger.log(`${components.length} components created`)

    return {
        id,
        name,
        dispose,
        addComponent,
        removeComponent
    }
}

export default (props: InitializationProps): StatePipe[] => {
    const { targets, providers } = props
    const apps = targets.map((selector) => {
        return Array.from(selector.querySelectorAll('[data-statepipe]')).map((node) => {
            if (node instanceof HTMLElement) {
                const sp = createStatepipe({
                    node,
                    providers,
                });
                const nestedStatepipes = Array.from(node.querySelectorAll("[data-statepipe]"));
                const belongsToHere = (target: Element) => {
                    return !nestedStatepipes.find((context: Element) => {
                        return context.contains(target)
                    });
                }
                Array
                    .from(node.querySelectorAll('[data-component]'))
                    .forEach((el: Element) => {
                        if (el instanceof HTMLElement && belongsToHere(el)) {
                            sp.addComponent(el)
                        }
                    })
                return sp
            }
        }) as StatePipe[]
    }).flat()
    return apps
}
