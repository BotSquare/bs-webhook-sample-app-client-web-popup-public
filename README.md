# Quick start guides

## Start dev server
```bash
# Start by configure sessionId in public/index.html
yarn
yarn start
# Browse http://localhost:9000
```

## To compile
```bash
yarn build
# You may find compiled js file under dist/
```

## To deploy
deploy ```dist/chatbot.widget.js``` to hosting service of your choice, then embed below script tag in target website:
```html
<script>
    window.chatbotConfig = {
        sessionId: "_your_session_id_here_",
    };
</script>
<script src="_url_to_your_cdn_/chatbot-widget.js"></script>
```