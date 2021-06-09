import React, {useEffect, useRef, useReducer, Suspense} from 'react';
import FlowDispatchTypes from '../enums/FlowDispatchTypes';
import {AuthOption} from '../interfaces/AuthOptionInterfaces';
import FlowDispatchContext from '../contexts/FlowDispatchContext';
import {Flow} from '../interfaces/FlowSelectorInterfaces';
import {CONSTANTS} from '../../constants/constants';

import {ComponentStoreGet, ComponentStoreSet, ComponentStoreMethods, FlowAction, ComponentStore, ComponentMap} from '../interfaces/FlowRouterInterfaces';

const options: AuthOption[] = CONSTANTS.verification_options;
const useMenu: boolean = options.length > 1;

// let flow: Flow;

const FlowController: React.FC<{}> = () => {
    const flow = useRef<Flow>(createFlow(0));
    const componentStore = useRef<ComponentStore>(initComponentStore());

    const [state, dispatch] = useReducer(flowReducer, {
        step: 'confirmation',
        authIndex: 0
    });

    const prevStep: string = flow.current[state.step]![FlowDispatchTypes.BACK] ?? '';

    let TheComponent = renderScreen(state.step),
        componentStoreMethods: ComponentStoreMethods = createComponentStoreConnection(state.step);

    useEffect(() => {
        flow.current = createFlow(state.authIndex);
    }, [state.authIndex]);

    useEffect(() => {
        // eslint-disable-next-line
        componentStoreMethods = createComponentStoreConnection(state.step);
    }, [state.step, createComponentStoreConnection]);

    function flowReducer(state: any, action: FlowAction): any {
        const {type, payload} = action;
        const {step} = state;
        const theFlow: Flow = flow.current;

        if (!theFlow.hasOwnProperty(step)) throw new Error(`Referenced step '${step}' does not exist in the flow`);

        switch (type) {
        case FlowDispatchTypes.NEXT:
            return {
                ...state,
                step: theFlow[step]![FlowDispatchTypes.NEXT]
            };
        case FlowDispatchTypes.BACK:
            return {
                ...state,
                step: theFlow[step]![FlowDispatchTypes.BACK]
            };
        case FlowDispatchTypes.RESTART:
            return {
                ...state,
                step: 'confirmation'
            };
        case FlowDispatchTypes.SET_AUTH_METHOD:
            if ('menu' === state.step) {
                return {
                    ...state,
                    authIndex: payload
                };
            } else {
                throw new Error('Please don\'t try to set the authentication method from outside the Authentication Menu screen');
            }
        default:
            throw new Error('Unknown action type');
        }
    }

    function renderScreen(step: string) {
        const componentMap: ComponentMap = {
            confirmation: 'ConfirmationScreen',
            menu: 'AuthenticationOptionMenu',
            details: 'ResultDetails',
            agency_qr: 'AgencyQR',
            email_input: 'EmailScreen',
            smsotp: 'SMSOTPScreen',
            verificationRequirement: 'VerificationRequirementScreen'
        };

        const component: any = React.lazy(() => import('../screens/' + componentMap[step]));

        return component;
    }

    // TODO: Make into a hook and inject the component store as a parameter
    function createComponentStoreConnection(step: string) {
        const get: ComponentStoreGet = (dataKey: string, dfault?: any, component?: string) => {
            // This is equivalent to component ??= step, but that broke the compiler
            component ?? (component = step);
            dfault ?? (dfault = undefined);

            return (componentStore.current[component] && componentStore.current[component][dataKey]) ?? dfault;
        };

        const set: ComponentStoreSet = (dataKey: string, value: any) => {
            if (!componentStore.current[step]) {
                componentStore.current[step] = {};
            }

            componentStore.current[step] = {
                ...componentStore.current[step],
                [dataKey]: value
            };
        };

        const reset = () => {
            componentStore.current = initComponentStore();
        };

        return {get, set, reset};
    }

    return (
        <FlowDispatchContext.Provider value={() => dispatch}>
            <Suspense fallback="">
                <div className="KernelContainer">
                    <div className="KernelContent" data-cy={state.step}>
                        <TheComponent store={componentStoreMethods} prevScreen={prevStep} authIndex={state.authIndex} />
                    </div>
                </div>
            </Suspense>
        </FlowDispatchContext.Provider> 
    );
}

export default FlowController;

function createFlow(index: number): Flow {
    const initial: any = createInitialSteps(index);
    injectAuthMethod(index, initial);

    return initial;
}

function injectAuthMethod(index: number, flow: any) {
    const beginAt: string = useMenu ? 'menu' : 'confirmation';
    const sequence: string[] = options[index].sequence;

    if (!sequence.length) throw new Error('You done goofed');

    let currentPoint: string = sequence[0];

    flow[beginAt][FlowDispatchTypes.NEXT] = currentPoint;
    flow[currentPoint] = {
        [FlowDispatchTypes.BACK]: beginAt
    };

    foldSequence(currentPoint, sequence, flow);
}

function foldSequence(currentPoint: string , sequence: string[], flow: any) {

    for (let i = 1; i < sequence.length; i++) {
        let temp: string = currentPoint;
        currentPoint = sequence[i];

        flow[temp][FlowDispatchTypes.NEXT] = currentPoint;
        flow[currentPoint] = {
            [FlowDispatchTypes.BACK]: temp
        };
    }

    flow[currentPoint][FlowDispatchTypes.NEXT] = 'details';
    flow['details'] = {
        [FlowDispatchTypes.BACK]: currentPoint
    };
}

function createInitialSteps(index: number) {
    const firstScreen = options[index].sequence[0];
    const ret: any = {
        confirmation: {
            [FlowDispatchTypes.NEXT]: 'verificationRequirement'
        },
        verificationRequirement: {
            [FlowDispatchTypes.BACK]: 'confirmation',
            [FlowDispatchTypes.NEXT]: firstScreen
        }
    };

    if (useMenu) {
        ret.verificationRequirement[FlowDispatchTypes.NEXT] = 'menu';
        ret['menu'] = {
            [FlowDispatchTypes.BACK]: 'verificationRequirement',
            [FlowDispatchTypes.NEXT]: firstScreen
        }
    }

    return ret;
}

function initComponentStore(): ComponentStore {
    return {
        menu: {},
        confirmation: {},
        verificationRequirement: {},
        details: {}
    };
}
