# Rigobot Chat Bubble

> Note: To use this library you must have a [Rigobot acoount](https://ai.4geeks.com/)

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
     (user: { // This property is optional, use it only if the user is authenticated
         token: "some user token ",
         nickname: "user nickname"
       }),
   });
   ```

3. **Hide the Chat Bubble**

   To hide the chat bubble, use the `hide` method.

   ```javascript
   window.rigo.hide();
   ```

4. **Update options**

   You can update the context of the chat bubble using the `updateOptions` method passing any of the keys available in the [Options interface](https://github.com/breatheco-de/chat-bubble-rigobot/blob/80439116dc1884ec92e44dc504af3e22da0f6429/src/types.ts#L56). This can be useful if you want to change the context dynamically based on user interactions.

   ```javascript
   window.rigo.updateOptions({
     target: "#some-selecter", // The selector of the element you want the Rigobot bubble to move to
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
    <script src="https://unpkg.com/rigobot-chat-bubble@0.0.31/dist/main.js"></script>
  </head>
  <body style="height: 300vh">
    <h1 id="chat-grow">s</h1>
    <div style="position: absolute; top: 50%; right: 0" id="bottom-element">
      asdasd
    </div>
    <div
      style="position: absolute; top: 50%; right: 50%"
      class="centered-element"
    >
      centered element
    </div>
    <div
      style="position: absolute; bottom: 0%; right: 50%"
      class="bottom-left-element"
    >
      bottom left element
    </div>

    <script>
      document.addEventListener("DOMContentLoaded", function () {
        if (window.rigo) {
          window.rigo.init("0839749d0baa4a51ac165d40b98f95f3", {
            loglevel: "debug",
            purposeSlug: "chayito",
            completions: [
              {
                prompt: "What is the name of the Data Science main director?",
                answer: "The Data Science main director is Jenniffer Guzman",
                DOMTarget: "#chat-grow",
              },
            ],

            introVideo: {
              url: "https://www.youtube.com/watch?v=sg_XoPrwjI0&t=3s",
            },
            context: "The user is called: Lulú",
            user: {
              token: "some user token ",
            },
          });

          window.rigo.show({
            // target: "#bottom-element",
            showBubble: false, // To keep the bubble hidden until you want to show it
            collapsed: false,
            highlight: true,
          });

          window.rigo.updateOptions({
            showBubble: true, // Show the bubble when you want to, you can call this in any time
            context: "Some new information about the context",
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
  "loglevel": "info", // "info" or "debug" in lowercase, specifies the logging level (just available in the `init` method)
  "showBubble": true, // optional, it can be combined with "collapsed" to cofigure how rigobot displays on the website
  "target": "", // optional, the bubble or the conversation window (if showBubble=false) will tooltip from here.
  "collapsed": false, // optional, whether the chat bubble should be collapsed (closed) initially.
  "introVideo": {
    "url": "url of the video" // Video to show in the chat bubble
  }, // optional, The URL of the introductory video.
  "welcomeMessage": "I love punk", // optional, if null it will get the salutation message from the purpose
  "purposeSlug": "", // optional string, defaults to the first purpose in the organization,
  "completions": [], // optional array, additional context for the chat, completion object must have properties `prompt`, `answer`, and `DOMTarget`.
  "context": "" // optional string, additional context for the chat
}
```

### Methods

- `init(token: string, options?: Options)`: Initializes the chat bubble with the given token and options.
- `show(Options)`: Displays the chat bubble with the specified options.
- `hide()`: Hides the chat bubble.
- `updateOptions(Options)`: Updates the options without triggering a new render of the chat bubble.
- `

## License

This project is licensed under the MIT License.
