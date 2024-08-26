import ReactDOM from 'react-dom';
import Chatbot from './components/Chatbot';

declare global {
    interface Window {
        ChatbotWidget: {
            init: () => void;
        };
        chatbotConfig: {
            sessionId: string;
        };
    }
}

const ChatbotWidget = (() => {
    let container: HTMLDivElement | null = null;
    let isOpen = false;

    const sessionId = window.chatbotConfig?.sessionId;

    const createContainer = () => {
        container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.bottom = '20px';
        container.style.right = '20px';
        container.style.opacity = '1'; // Ensure visible
        document.body.appendChild(container);
        renderButton();
    };

    const Button = () => (
        <button
            onClick={toggleChatbot}
            style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: '#007bff',
                border: 'none',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                outline: 'none',
                transition: 'background-color 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease'
            }}
            onMouseOver={({ currentTarget }) => {
                currentTarget.style.backgroundColor = '#0056b3';
                currentTarget.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.2)';
                currentTarget.style.transform = 'scale(1.1)'; // Scale up slightly on hover
            }}
            onMouseOut={({ currentTarget }) => {
                currentTarget.style.backgroundColor = '#007bff';
                currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
                currentTarget.style.transform = 'scale(1)'; // Scale back to normal
            }}
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="white" className="bi bi-chat-quote-fill" viewBox="0 0 16 16">
                <path d="M16 8c0 3.866-3.582 7-8 7a9 9 0 0 1-2.347-.306c-.584.296-1.925.864-4.181 1.234-.2.032-.352-.176-.273-.362.354-.836.674-1.95.77-2.966C.744 11.37 0 9.76 0 8c0-3.866 3.582-7 8-7s8 3.134 8 7M7.194 6.766a1.7 1.7 0 0 0-.227-.272 1.5 1.5 0 0 0-.469-.324l-.008-.004A1.8 1.8 0 0 0 5.734 6C4.776 6 4 6.746 4 7.667c0 .92.776 1.666 1.734 1.666.343 0 .662-.095.931-.26-.137.389-.39.804-.81 1.22a.405.405 0 0 0 .011.59c.173.16.447.155.614-.01 1.334-1.329 1.37-2.758.941-3.706a2.5 2.5 0 0 0-.227-.4zM11 9.073c-.136.389-.39.804-.81 1.22a.405.405 0 0 0 .012.59c.172.16.446.155.613-.01 1.334-1.329 1.37-2.758.942-3.706a2.5 2.5 0 0 0-.228-.4 1.7 1.7 0 0 0-.227-.273 1.5 1.5 0 0 0-.469-.324l-.008-.004A1.8 1.8 0 0 0 10.07 6c-.957 0-1.734.746-1.734 1.667 0 .92.777 1.666 1.734 1.666.343 0 .662-.095.931-.26z" />
            </svg>        </button>
    );

    const renderButton = () => {
        if (!container) return;
        ReactDOM.render(<Button />, container);
    };

    const toggleChatbot = () => {
        if (!container) return;
        if (isOpen) {
            container.style.opacity = '1'; // Fade in button
            ReactDOM.unmountComponentAtNode(container);
            renderButton();
        } else {
            container.style.opacity = '0'; // Fade out button
            setTimeout(() => {
                ReactDOM.render(<Chatbot sessionId={sessionId} onClose={toggleChatbot} />, container);
                container!.style.opacity = '1'; // Ensure chat window fades in
            }, 300); // Match transition time
        }
        isOpen = !isOpen;
    };

    return {
        init: () => {
            if (container) {
                console.warn("Chatbot is already initialized.");
                return;
            }
            createContainer();
        }
    };
})();

window.ChatbotWidget = ChatbotWidget;
window.ChatbotWidget.init();
