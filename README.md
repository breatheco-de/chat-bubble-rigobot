Sure, Charly! Here's a `README.md` file for your project:

# Rigobot Chat Bubble

Rigobot Chat Bubble is a customizable chat interface that can be easily integrated into any website. It allows users to interact with a chat agent and receive responses in real-time.

## Getting Started

To use Rigobot Chat Bubble, you need to include the script in your HTML file and initialize the chat bubble with the required options.

### Installation

Include the following script in your HTML file:

```html
<script src="https://unpkg.com/rigobot-chat-bubble@0.0.13/dist/main.js"></script>
```

### Usage

1. **Initialize the Chat Bubble**

   You need to initialize the chat bubble with a token and optional settings. This can be done using the `init` method.

   ```javascript
   window.rigo.init("YOUR_CHAT_AGENT_HASH", {
     completions: [
       {
         prompt: "What is the name of the Data Science main director?",
         answer: "The Data Science main director is Jenniffer Guzman",
         DOMTarget: "#chat-grow",
       },
     ],
     context: "The user is called: Lulú",
     introVideoUrl: "https://www.youtube.com/watch?v=sg_XoPrwjI0&t=3s",
   });
   ```

2. **Show the Chat Bubble**

   To display the chat bubble, use the `show` method. You can specify various options such as `showBubble`, `target`, `bubblePosition`, `collapsed`, and `welcomeMessage`.

   ```javascript
   window.rigo.show({
     showBubble: true,
     target: "#chat-grow",
     bubblePosition: {
       top: "10px",
       left: "10px",
     },
     collapsed: false,
     welcomeMessage: "I love punk",
   });
   ```

3. **Hide the Chat Bubble**

   To hide the chat bubble, use the `hide` method.

   ```javascript
   window.rigo.hide();
   ```

4. **Update Context**

   You can update the context of the chat bubble using the `updateContext` method. This can be useful if you want to change the context dynamically based on user interactions.

   ```javascript
   window.rigo.updateContext({
     override: true,
     payload: "New context information",
   });
   ```

### Example

Here is a complete example of how to use Rigobot Chat Bubble in your HTML file:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Rigobot Bubble</title>
  </head>
  <body>
    <h3 id="chat-grow">hello</h3>
    <script src="https://unpkg.com/rigobot-chat-bubble@0.0.13/dist/main.js"></script>
    <script>
      document.addEventListener("DOMContentLoaded", function () {
        console.log("Initializing Rigobot bubble");
        if (window.rigo) {
          console.log("The Window object has a Rigo instance in window.rigo");
          window.rigo.init("5ec6dfc30db24638a6f515f7e78c8513", {
            completions: [
              {
                prompt: "What is the name of the Data Science main director?",
                answer: "The Data Science main director is Jenniffer Guzman",
                DOMTarget: "#chat-grow",
              },
            ],
            context: "The user is called: Lulú",
            introVideoUrl: "https://www.youtube.com/watch?v=sg_XoPrwjI0&t=3s",
          });

          window.rigo.show({
            target: "#chat-grow",
            showBubble: true,
            collapsed: false,
            welcomeMessage: "I love punk",
          });

          // window.rigo.hide();
        } else {
          console.error("window.rigo is not defined");
        }
      });
    </script>
  </body>
</html>
```

### Options

```json
{
     showBubble: true, // optional, it can be combined with "collapsed" to cofigure how rigobot displays on the website
     target: "", // optional, the bubble or the conversation window (if showBubble=false) will tooltip from here.
     collapsed: false, // optional, whether the chat bubble should be collapsed (closed) initially. It must be set with showBubble=true.

     bubblePosition: { // optional
       top: "10px",
       left: "10px",
     },
     introVideoUrl: "", // optional, The URL of the introductory video.
     welcomeMessage: "I love punk", // optional, if null it will get the salutation message from the purpose
     purposeSlug: "", // optional string, defaults to the first purpose in the organization,
     completions: [], // optional array, additional context for the chat, completion object must have properties `prompt`, `answer`, and `DOMTarget`.
     context: "", // optional string, additional context for the chat
}
```

### Methods

- `init(token: string, options?: TInitOpts)`: Initializes the chat bubble with the given token and options.
- `show(params: { showBubble: boolean; target?: string; bubblePosition: { top?: string; left?: string; right?: string; bottom?: string; }; collapsed?: boolean; welcomeMessage?: string; })`: Displays the chat bubble with the specified options.
- `hide()`: Hides the chat bubble.
- `updateContext({ override: boolean, payload: string })`: Updates the context of the chat bubble.

## License

This project is licensed under the MIT License.
