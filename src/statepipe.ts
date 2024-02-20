import { uid, getLogger } from './core/utils';
import { getComponent } from './core/component';
import { InitializationProps, StatepipeProps, Component } from './statepipe.types';

const Statepipe = (props: StatepipeProps) => {
    let components : Component[] = [];
    const id = uid();
    const logger = getLogger();
    const { node, providers } = props

    const onAction = (
        componentId: string,
        action: string,
        payload: any
    ): void => {
        logger.log(`${id}.statepipe dispatch '${action}' from ${componentId} payload:`, payload);
        components.forEach((comp) => {
            comp.pipeState(action, payload);
        });
    };

    components = Array.from(node.querySelectorAll('[data-component]')).map(
        (node: unknown) => {
            if (node instanceof HTMLElement) {
                return getComponent({ node, providers, onAction });
            }
        }
    ).filter(component => !!component) as Component[]
    logger.log(`created with components ${components.length}`);

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
        components,
    };
};

export default (props: InitializationProps) => {
    const logger = getLogger('verbose', `statepipe::${uid()}`)
    const id = uid()
    const { root, selectors, providers } = props;
    if (!selectors.length) {
        logger.warn(`${id}.statepipe invalid selector.`)
        return;
    }
    const apps = selectors.map((selector) => {
        const node = root.querySelector(selector);
        if (node instanceof HTMLElement) {
            return Statepipe({
                node,
                providers,
            });
        }
    });

    return { apps };
};
