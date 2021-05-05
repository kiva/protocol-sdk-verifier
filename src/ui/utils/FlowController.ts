import {Flow, PermittedNavigation} from "../interfaces/FlowSelectorInterfaces";
import {AuthOption} from "../interfaces/AuthOptionInterfaces";

export default class FlowController {

    private flow: Flow;
    readonly use_menu: boolean;
    private initial_steps: any;
    private current_step: string;
    private callback: (step: string, additionalData?: any) => void;

    static init(conf: AuthOption[], callback: any): FlowController {
        return new FlowController(conf, callback);
    }

    constructor(conf: AuthOption[], callback: (step: string, additionalData?: any) => void) {
        this.use_menu = conf.length > 1;
        this.flow = this.setInitialFlow(conf);
        this.current_step = 'confirmation';
        this.callback = callback;
    }

    setInitialFlow(config: AuthOption[]): Flow {
        const recommended: AuthOption = config[0];
        this.createInitialStep(recommended);
        const flow: Flow = this.createAuthFlow(recommended);

        return flow;
    }

    getStep(direction: string): string | undefined {
        const nav: PermittedNavigation | undefined = this.flow[this.current_step];
        if (nav && nav[direction]) {
            return nav[direction];
        }
        return undefined;
    }

    goTo(direction: string, additionalData?: any) {
        const destination: string | undefined = this.getStep(direction);
        try {
            if (destination) {
                this.current_step = destination;
                this.callback(this.current_step, additionalData);
            } else {
                console.error(`Could not go ${direction} from ${this.current_step} - printing the current flow...`);
                console.error(this.flow);
            }
        } catch (error) {
            console.log(error);
        }
    }

    modifyFlow(option: AuthOption): void {
        this.flow = this.createAuthFlow(option);
    }

    createInitialStep(option: AuthOption) {
        const template: any = {};
        const toFirstScreen: PermittedNavigation = {
            NEXT: option.sequence[0]
        };

        // TODO: Clean this up
        if (this.use_menu) {
            template['confirmation'] = {
                NEXT: 'verificationRequirement'
            };
            template['verificationRequirement'] = {
                PREVIOUS: 'confirmation',
                NEXT: 'menu'
            };
        }

        template[(this.use_menu ? 'menu' : 'confirmation')] = toFirstScreen;
        this.initial_steps = template;
    }

    foldSequence(option: AuthOption) {
        const sequence: string[] = option.sequence;
        const folded: any = {
            [sequence[0]]: {
                NEXT: sequence[1]
            },
            [sequence[sequence.length - 1]]: {
                BACK: sequence[sequence.length - 2],
                NEXT: 'details'
            }
        };

        if (this.use_menu) {
            folded[sequence[0]]['BACK'] = 'menu';
        } else {
            folded[sequence[0]]['BACK'] = 'verificationRequirement';
        }

        for (let i = 1; i <= sequence.length - 2; i++) {
            folded[sequence[i]] = {
                BACK: sequence[i - 1],
                NEXT: sequence[i + 1]
            };
        }

        return folded;
    }

    changeMenuNext(option: AuthOption) {
        if (this.initial_steps['menu']) {
            this.initial_steps['menu']['NEXT'] = option.sequence[0];
        }
    }

    createAuthFlow(option: AuthOption): Flow {
        const foldedSteps: any = this.foldSequence(option);
        this.changeMenuNext(option);
        for (let key in this.initial_steps) {
            foldedSteps[key] = this.initial_steps[key];
        }
        return foldedSteps as Flow;
    }
}