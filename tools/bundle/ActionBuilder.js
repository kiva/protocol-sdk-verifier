const actions = {
    // The following two Actions are required for hosted iframes
    reset: {},
    enableStandalone: {
        isStandalone: true
    }
};

class ActionBuilder {
    static init(settings, env) {
        return new ActionBuilder(settings, env);
    }

    constructor(settings, env) {
        this.settings = settings;
        this.env = env;
        this.actions = {};

        this.createActionsObject();
    }

    getActions() {
        return this.actions;
    }

    setAction(name) {
        if (actions[name]) {
            this.actions[name] = actions[name];
        }
    }

    createActionsObject() {
        let envConf = this.settings[this.env];

        if (envConf.actions && envConf.actions.includeOnly) {
            while (envConf.actions.includeOnly.length) {
                let action = envConf.actions.includeOnly.pop();
                this.setAction(action);
            }
        } else {
            this.actions = actions;
        }
    }
}

module.exports = ActionBuilder;