import './styles/style.css'
import providers from "./providers";
import statepipe from "./statepipe";

statepipe({
    targets:[document.body],
    providers,
})
