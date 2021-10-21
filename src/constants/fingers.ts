import I18n from '../ui/utils/I18n';
import { FingerUtilDefinition } from '../ui/interfaces/UtilInferfaces';

const Fingers: FingerUtilDefinition = {
    1: {
        name: I18n.getKey('RIGHT_THUMB'),
        code: "right_thumb"
    },
    2: {
        name: I18n.getKey('RIGHT_INDEX'),
        code: "right_index"
    },
    3: {
        name: I18n.getKey('RIGHT_MIDDLE'),
        code: "right_middle"
    },
    4: {
        name: I18n.getKey('RIGHT_RING'),
        code: "right_ring"
    },
    5: {
        name: I18n.getKey('RIGHT_LITTLE'),
        code: "right_little"
    },
    6: {
        name: I18n.getKey('LEFT_THUMB'),
        code: "left_thumb"
    },
    7: {
        name: I18n.getKey('LEFT_INDEX'),
        code: "left_index"
    },
    8: {
        name: I18n.getKey('LEFT_MIDDLE'),
        code: "left_middle"
    },
    9: {
        name: I18n.getKey('LEFT_RING'),
        code: "left_ring"
    },
    10: {
        name: I18n.getKey('LEFT_LITTLE'),
        code: "left_little"
    }
};

export default Fingers;
