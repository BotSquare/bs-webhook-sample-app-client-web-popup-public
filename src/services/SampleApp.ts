import config from '../config';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
const { SAMPLE_APP_SERVICE_URL, SAMPLE_APP_SERVICE_SOCKET_URL } = config;

export interface SaWsMessage {
    type: 'static' | 'stream',
    id: string
    delta?: string
    content?: string
    contentType?: string
}

export interface BotInfo {
    name: string,
    icon: string,
    description: string
}

let sessionId = '';
let url = '';
let token = '';
let clientId = '';

export default class SampleAppService {
    static async fetchSession(sessionIdParam?: string) {
        if (sessionIdParam === null) throw new Error('Session Id not valid.');

        const { data } = await axios.get(`${SAMPLE_APP_SERVICE_URL}/session/${sessionIdParam}`);
        sessionId = data.sessionId;
        url = data.apiUrl;
        token = data.bearerToken;

        console.log('fetch session', data);

        if (!url) throw new Error('Fetch session failed, received invalid api url');
        if (!sessionId) throw new Error('Fetch session failed, received invalid session id');
    }

    static async fetchInfo(sessionId?: string) {
        if (!sessionId) throw new Error('Session Id not valid.');

        const { data } = await axios.get(`${SAMPLE_APP_SERVICE_URL}/session/${sessionId}/info`);
        console.log('bot info:', data);
        return data;
    }

    static async initiateConnection(onMsg: (msg: SaWsMessage) => void, wsOnOpen?: (ev: Event) => any, wsOnClose?: (ev: CloseEvent) => any, wsOnError?: (ev: Event) => any) {
        if (!sessionId) throw new Error('Unable to initialize connection, no live session found');

        if (!clientId) clientId = `ct-${uuidv4()}`;

        // Request to connect to Sample App service through ws
        const wsUrl = `${SAMPLE_APP_SERVICE_SOCKET_URL}/session/${sessionId}/${clientId}`;
        const ws = new WebSocket(wsUrl);

        // On msg received
        ws.onmessage = (event) => {
            const message = JSON.parse(event.data) as SaWsMessage;
            if (!message) console.error('Invalid ws msg, ignoring:', message);

            // Forward msg to UI
            onMsg(message);
        };

        // Pass in UI on close and on error handlers
        ws.onopen = wsOnOpen || null;
        ws.onclose = wsOnClose || null;
        ws.onerror = wsOnError || null;
    }

    static async sendMessage(message: string): Promise<void> {
        if (!url) throw new Error('Unable to send message, apiUrl provided is invalid');
        if (!clientId) throw new Error('Unable to send message, clientId provided is invalid');

        await axios.post(url, {
            input: {
                value: message,
                type: 'text',
            },
            options: { clientId }
        }, {
            headers: {
                Authorization: 'Bearer ' + token
            }
        });
    }
}
