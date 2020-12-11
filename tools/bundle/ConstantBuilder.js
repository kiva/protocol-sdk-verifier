const fs = require('fs-extra');

const rtl = [
    'ar'
];

class ConstantBuilder {
    static init(conf, env) {
        return new ConstantBuilder(conf, env);
    }

    constructor(conf, env) {
        this.conf = conf;
        this.envConf = conf.env[env]
        this.variables = {};

        this.setAll();
    }

    getVariables() {
        return this.variables;
    }

    setVariable(key, conf = this.conf) {
        if (this.envConf && this.envConf.hasOwnProperty(key)) {
            this.variables[key] = this.envConf[key];
        } else if (conf.hasOwnProperty(key)) {
            this.variables[key] = conf[key];
        }
    }

    setAll() {
        const constants = [
            'permittedOrigins',
            'permittedOriginPatterns',
            'pii_map',
            'isProd',
            'verification_options',
            'agent_port',
            'headerImage',
            'controllerUrlBase',
            'auth_endpoints',
            'phoneIntls',
            'permittedOpenerOrigins'
        ];
        constants.forEach((c, idx) => {
            this.setVariable(c);
        });
        this.setTextDirection();
    }

    setTextDirection() {
        if (this.conf.locale && rtl.indexOf(this.conf.locale) > -1) {
            this.variables['direction'] = 'rtl';
        } else {
            this.variables['direction'] = 'ltr';
        }
    }
}

module.exports = ConstantBuilder;
