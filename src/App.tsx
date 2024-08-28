import { ChatBubble } from "./components/ChatBubble/ChatBubble";

function App() {
  return (
    <>
      <ChatBubble 
        logoUrl="vite.svg"
        aiImageUrl="vite.svg"
        userImageUrl="vite.svg"
        socketHost="http://localhost:8000"
        welcomeMessage="Hello! I'm Rigo, your friendly AI assistant, how can I help you"
        host="https://rigobot-test-cca7d841c9d8.herokuapp.com"
        purposeId={4}
        chatAgentHash="987761d51d1e48c28f17c6e12f3ddcae"
      />
    </>
  );
}

export default App;
