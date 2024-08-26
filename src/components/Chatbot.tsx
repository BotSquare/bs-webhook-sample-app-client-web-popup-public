import React, { useEffect, useState, useRef } from 'react';
import SampleAppService, { BotInfo, SaWsMessage } from '../services/SampleApp';
import MessageCell, { MessageType, StreamMessage } from './messageCell/MessageCell';
import MessageWaitingCell from './messageWaitingCell/MessageWaitingCell';
import DisconnectAlert from './disconnectAlert/DisconnectAlert';
import './Chatbot.scss';

interface Props {
    onClose: () => void;
    sessionId: string
}

const Chatbot: React.FC<Props> = ({ onClose, sessionId }) => {
    const [botInfo, setBotInfo] = useState<BotInfo>();
    const [showWaiting, setShowWaiting] = useState(false);
    const [disconnected, setDisconnected] = useState(false);
    const [disconnectCheck, setDisconnectCheck] = useState(false);
    const [disconnectMessage, setDisconnectMessage] = useState('');
    const [messageList, setMessageList] = useState<StreamMessage[]>([]);
    const [userInput, setUserInput] = useState('');
    const [textAreaHeight, setTextAreaHeight] = useState(44);
    const messagesEndRef = useRef<null | HTMLDivElement>(null);
    const chatWindowRef = useRef<HTMLDivElement>(null);

    const onMessage = (msg: SaWsMessage) => {
        console.log('on message', msg);
        if (msg.contentType == 'image') {
            postImageMessage(msg);
        } else if (msg.content !== undefined) {
            postStaticMessage(msg);
        } else if (msg.delta !== undefined) {
            updateStreamMessage(msg);
        } else {
            console.log('Error No Message');
        }
    };

    const checkLanguage = (text?: string) => {
        switch (text) {
            case 'swift':
                return { language: 'swift', text: '' };
            case 'func':
                return { language: 'swift', text: text };
            case 'kotlin':
                return { language: 'kotlin', text: '' };
            case 'fun':
                return { language: 'kotlin', text: text };
            case 'python':
                return { language: 'python', text: '' };
            case 'def':
                return { language: 'python', text: text };
            case 'typescript':
                return { language: 'typescript', text: '' };
            case 'javascript':
                return { language: 'javascript', text: '' };
            case 'js':
                return { language: 'javascript', text: '' };
            case 'cpp':
                return { language: 'c++', text: '' };
            case 'c':
                return { language: 'c', text: '' };
            case 'csharp':
                return { language: 'c#', text: '' };
            case 'ruby':
                return { language: 'ruby', text: '' };
            case 'go':
                return { language: 'go', text: '' };
            case 'golang':
                return { language: 'golang', text: '' };
            case 'bash':
                return { language: 'bash', text: '' };
            case '#include':
                return { language: 'c++', text: text };
            case 'java':
                return { language: 'java', text: '' };
            case 'import':
                return { language: 'java', text: text };
            case 'xml':
                return { language: 'xml', text: '' };
            case '<':
                return { language: 'xml', text: text };
            case 'json':
                return { language: 'json', text: '' };
            default:
                return null;
        }
    };

    const updateStreamMessage = (msg: SaWsMessage) => {
        setMessageList(prevItems => {
            let index = prevItems.findIndex((message) => message.id === msg.id);
            index = index === -1 ? prevItems.length : index;

            let parts = index < prevItems.length ? prevItems[index].message.parts : [{ type: MessageType.StringType, content: '' }];

            let message = parts[parts.length - 1];

            const codeBlockStart = message.content.includes('```') && message.type !== MessageType.CodeType;
            const codeBlockEnd = message.content.includes('```') && message.type === MessageType.CodeType;

            if (codeBlockStart) {
                message.content = message.content.replace('```', '');
                parts[parts.length - 1] = message;

                parts.push({ type: MessageType.CodeType, content: msg.delta ?? '' });
            } else if (codeBlockEnd) {
                let update = message.content;
                message.content = update.replace('```', '');

                while (message.content.endsWith(`\n`) || message.content.endsWith(' ')) {
                    message.content = message.content.slice(0, -1);
                }

                parts[parts.length - 1] = message;

                while (parts[parts.length - 1].content === '' || parts[parts.length - 1].content === '↵') {
                    parts = parts.slice(0, -1);
                }

                parts.push({ type: MessageType.StringType, content: msg.delta ?? '' });
            } else {
                if (message.type === MessageType.CodeType && message.title === undefined && message.content.endsWith(`\n`)) {
                    const potentialTitle = checkLanguage(message.content.split(`\n`)[0]);

                    if (potentialTitle !== null) {
                        const title = potentialTitle.language;
                        message.title = title;

                        if (message.content.startsWith(title)) {
                            message.content = message.content.slice(title.length);
                        }
                    }

                    message.content = message.content + msg.delta ?? '';
                } else {
                    const delta = msg.delta === '↵↵' ? '' : msg.delta;
                    const update = message.content + delta;
                    message.content = update.trimStart();

                    parts[parts.length - 1] = message;
                }
            }

            prevItems[index] = { id: msg.id, index: index, user: false, message: { parts: parts } };

            return [...prevItems];
        });

        setShowWaiting(false);

        console.log('message list', messageList);
    };

    const postImageMessage = (msg: SaWsMessage) => {
        setMessageList(prevItems => {
            const part = { type: MessageType.ImageType, content: msg.content! };
            let updatedItems = prevItems;
            updatedItems.push({ id: msg.id, index: prevItems.length, user: false, message: { parts: [part] } });
            return [...prevItems];
        });

        setShowWaiting(false);
    };

    const postStaticMessage = (msg: SaWsMessage) => {
        setMessageList(prevItems => {
            const index = prevItems.length;
            const part = { type: MessageType.StringType, content: msg.content! };
            const parts = (msg.content ?? '').split('```').map((part, index) => {
                if (index % 2 === 0) {
                    return { type: MessageType.StringType, content: part };
                } else {
                    const language = part.slice(0, part.indexOf('\n')).toLowerCase();
                    const checked = checkLanguage(language);
                    const languageList = 'swift|kotlin|python|javascript|typescript|c++|cpp|c|csharp|c#|js|ts|ruby|go|golang|bash|xml|json'.split('|');

                    if (languageList.includes(language)) {
                        part = part.slice(part.indexOf('\n') + 1);
                    }

                    return { type: MessageType.CodeType, title: checked?.language, content: part };
                }
            });
            const message = { parts: parts };

            let updatedItems = prevItems;
            updatedItems.push({ id: msg.id + '-static', index: index, user: false, message: message });
            return [...prevItems];
        });

        setShowWaiting(false);
    };

    const onConnected = () => {
        console.log('WS on open');
        setDisconnected(false);
        setDisconnectCheck(false);
    };

    const onDisconnected = () => {
        console.log('WS on close');
        if (disconnectCheck) {
            setDisconnectMessage('There is a connection issue occurred, please try to reconnect');
            setDisconnected(true);
        } else {
            setDisconnectCheck(true);
            initiateConnection();
        }
    };

    const initiateConnection = async () => {
        if (!sessionId) throw new Error('Error: no session found');

        try {
            await SampleAppService.fetchSession(sessionId);
            await SampleAppService.initiateConnection(
                onMessage,
                onConnected,
                onDisconnected,
                (error) => console.log('WS on error', error)
            );
            const data = await SampleAppService.fetchInfo(sessionId);
            setBotInfo(data.payload.bot);
        } catch {
            if (!navigator.onLine) {
                setDisconnectMessage('It looks like you are not connected to the internet, please try again later.');
            } else {
                setDisconnectMessage('There is a connection issue occurred, please try to reconnect');
            }
            setDisconnected(true);
        }
    };

    useEffect(() => {
        initiateConnection()
    }, []);

    const handleChange = (event: { target: { value: any; }; }) => {
        setUserInput(event.target.value);
    };

    const addMessage = () => {
        if (userInput === '') { return; }
        const input = userInput;
        setUserInput('');

        addUserMessage(input);
        sendMessage();
        setShowWaiting(true);
    };

    const sendMessage = async () => {
        await SampleAppService.sendMessage(userInput);
    };

    const addUserMessage = (input: string) => {
        const message = { parts: [{ type: MessageType.StringType, content: input }] };
        setMessageList(prevItems => [...prevItems, { id: 'user', index: prevItems.length, user: true, message: message }]);
    };

    // Keep scroll msg window to bottom
    useEffect(() => {
        if (chatWindowRef.current) {
            const { scrollHeight, clientHeight } = chatWindowRef.current;
            chatWindowRef.current.scrollTop = scrollHeight - clientHeight;
        }
    }, [messageList]);

    return (
        <div style={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            width: '500px',
            height: '600px',
            background: 'white',
            border: 'none',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: '8px'
        }}>
            <div className='stream-title'>
                <h1>{botInfo?.name ?? 'Playground'}</h1>
                <button className='stream-share-button' onClick={onClose}>
                    Close
                </button>
            </div>
            <div className='stream-chat-window' ref={chatWindowRef}>
                {
                    messageList.map(stream =>
                        <MessageCell stream={stream} icon={botInfo?.icon} />
                    )
                }
                <MessageWaitingCell isOn={showWaiting} icon={botInfo?.icon} />
                <div ref={messagesEndRef} />
            </div>
            <div className='stream-input-bar'>
                {disconnected &&
                    <DisconnectAlert message={disconnectMessage} action={initiateConnection} />
                }
                <div className={`stream-input-container ${disconnected ? 'disconnected' : 'connected'}`}>
                    <textarea
                        style={{ height: textAreaHeight }}
                        value={userInput}
                        rows={1}
                        placeholder='Ask anything!'
                        onChange={handleChange}
                        disabled={disconnected}
                        onKeyDown={(e) => {
                            if (e.shiftKey && e.key === 'Enter') {
                                console.log('test', userInput);
                            } else if (e.key === 'Enter') {
                                e.preventDefault();
                                addMessage();
                            }
                        }}
                    />
                    <button onClick={addMessage} disabled={disconnected}>Send</button>
                </div>
            </div>
        </div>
    );
};

export default Chatbot;
