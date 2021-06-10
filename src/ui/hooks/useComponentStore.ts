import {useRef} from 'react';
import {ComponentStoreGet, ComponentStoreSet, ComponentStoreMethods, ComponentStore} from '../interfaces/FlowRouterInterfaces';

export default useComponentStore;

function useComponentStore(step: string): ComponentStoreMethods {
    const componentStore = useRef<ComponentStore>(initComponentStore());

    const get: ComponentStoreGet = (dataKey: string, dfault?: any, uniqueComponentKey?: string) => {
        !uniqueComponentKey && (uniqueComponentKey = step);

        // This is equivalent to component ??= step, but that broke the compiler
        dfault ?? (dfault = undefined);

        console.log(componentStore.current);
        return (componentStore.current[uniqueComponentKey] && componentStore.current[uniqueComponentKey][dataKey]) ?? dfault;
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

function initComponentStore(): ComponentStore {
    return {
        menu: {},
        confirmation: {},
        verificationRequirement: {},
        details: {}
    };
}