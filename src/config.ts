enum BSENV {
    prod = 'prod',
    qa = 'qa',
}

interface Config {
    SAMPLE_APP_SERVICE_URL: string
    SAMPLE_APP_SERVICE_SOCKET_URL: string
}

const env: BSENV = BSENV.prod;

const config_qa: Config = {
    SAMPLE_APP_SERVICE_URL: 'https://',
    SAMPLE_APP_SERVICE_SOCKET_URL: 'wss://'
};

const config_prod: Config = {
    SAMPLE_APP_SERVICE_URL: 'https://',
    SAMPLE_APP_SERVICE_SOCKET_URL: 'wss://'
};

let selected_config: Config;
switch (env as BSENV) {
    case BSENV.qa:
        selected_config = config_qa;
        break;
    case BSENV.prod:
        selected_config = config_prod;
        break;
}

let config = selected_config;
export default config;
