import './styles/style.css'
import providers from "./providers";
import statepipe from "../library/statepipe";

statepipe({
    targets:[document.body],
    providers,
})
