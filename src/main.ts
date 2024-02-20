import './styles/style.css'
import { getComponent } from './core/component';
import providers from "./providers";

getComponent({
    onAction: () => { },
    providers,
    node: document.querySelector("[data-component]") as HTMLElement,
})

