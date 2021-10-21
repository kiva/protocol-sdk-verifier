import Fingers from "../../constants/fingers";
import I18n from "./I18n";

import { FingerTypesMap } from "../interfaces/UtilInferfaces";

export default class FingerUtils {
    static buildFingerTypes(): FingerTypesMap {
        const ret = {} as FingerTypesMap;
        for (let i in Fingers) {

            let code: string = Fingers[i].code;
            ret[code] = I18n.computeKey({
                finger: I18n.getKey('FINGER')
            }, `${code.toUpperCase()}_FULL`);
        }

        return ret;
    }
}