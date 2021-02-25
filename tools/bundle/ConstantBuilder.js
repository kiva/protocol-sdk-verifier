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
            'isProd',
            'verification_options',
            'agent_port',
            'headerImage',
            'controllerUrlBase',
            'auth_endpoints',
            'phoneIntls',
            'permittedOpenerOrigins',
            'credentialProof'
        ];
        constants.forEach((c, idx) => {
            this.setVariable(c);
        });
        this.setTextDirection();
        this.createCredentialKeyMap();
    }

    setTextDirection() {
        if (this.conf.locale && rtl.indexOf(this.conf.locale) > -1) {
            this.variables['direction'] = 'rtl';
        } else {
            this.variables['direction'] = 'ltr';
        }
    }

    createCredentialKeyMap() {
        if (this.conf.credentialProof) {
            if ('string' === typeof this.conf.credentialProof) {
                const credentialConfig = fs.readFileSync(__dirname + '/../../proofDefinitions/' + this.conf.credentialProof, 'utf8');
                this.variables['credentialKeyMap'] = JSON.parse(credentialConfig);
            } else {
                // Assumes that the credentialDefinition is an object. Don't yet know how this would be used, and might not be the right implementation
                // TODO: Write logic that creates an opinion about the schema of credentialDefinition as an object.
            }
        }
    }
}

module.exports = ConstantBuilder;
