import './styles/style.css'

import providers from "./providers";
import statepipe from "./statepipe";

const sp = statepipe({
    selectors:[".grape",".banana"],
    providers,
    root:document.body
})
console.log(sp)
// createComponent({
//     onAction: () => { },
//     providers,
//     node: document.querySelector("[data-component]") as HTMLElement,
// })

