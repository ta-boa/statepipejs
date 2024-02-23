import './styles/style.css'
import providers from "./providers";
import statepipe from "./statepipe";

statepipe({
    selectors:[".grape",".banana"],
    providers,
    root:document.body
})
