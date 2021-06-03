import React, {useEffect, useReducer, Suspense} from 'react';
import FlowDispatchTypes from '../enums/FlowDispatchTypes';
import {AuthOption} from '../interfaces/AuthOptionInterfaces';
import FlowDispatchContext from '../contexts/FlowDispatchContext';
import {Flow} from '../interfaces/FlowSelectorInterfaces';
import {CONSTANTS} from '../../constants/constants';

const options: AuthOption[] = CONSTANTS.verification_options;
const useMenu: boolean = options.length > 1;

let currentAuthIndex: number = parseInt(window.localStorage.getItem('authIndex') || '0');
let flow: Flow;

const FlowController: React.FC<{}> = () => {
    const [state, dispatch] = useReducer(flowReducer, {
        step: 'confirmation',
        authIndex: 0
    });

    let TheComponent = renderScreen(state.step);

    useEffect(() => {
        flow = createFlow(currentAuthIndex);
    }, []);

    useEffect(() => {
        flow = createFlow(state.authIndex);
    }, [state.authIndex]);

    function flowReducer(state: any, action: FlowAction): any {
        const {type, payload} = action;
        const {step} = state;
        const theFlow: Flow = flow ?? createFlow(0);

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
                window.localStorage.setItem('authIndex', payload.toString());
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
        }

        const component: any = React.lazy(() => import('../screens/' + componentMap[step]));

        return component;
    }

    return (
        <FlowDispatchContext.Provider value={() => dispatch}>
            <Suspense fallback="">
                <div className="KernelContainer">
                    <div className="KernelContent" data-cy={state.step}>
                        <TheComponent />
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

interface FlowAction {
    type: string,
    payload?: any;
}

interface ComponentMap {
    [index: string]: string,
    menu: string,
    confirmation: string,
    verificationRequirement: string,
    details: string
}