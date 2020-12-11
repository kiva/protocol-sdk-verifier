import listen from "./utils/listen";
import auth from "./utils/AuthService";
import {CONSTANTS} from "../constants/constants";

listen(window, "message", e => {
    if (CONSTANTS.permittedOpenerOrigins.indexOf(e.origin) > -1) {
        if (e.data === "are you set?") {
            e.source.postMessage({
                allSet: true
            }, e.origin);
        } else if (e.data.token) {
            auth.setToken(e.data.token);
        }
    }
});

export {KernelContainer} from './KernelContainer';