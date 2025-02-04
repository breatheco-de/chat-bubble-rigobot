# Rigobot Chat Bubble

Rigobot Chat Bubble is a lightweight and customizable chat interface that seamlessly integrates into any website. It allows users to interact with an AI-powered chat agent in real-time, providing a personalized and dynamic user experience.

---

## 🚀 Getting Started

To begin using Rigobot Chat Bubble, simply include the script in your HTML file, initialize it with your configurations, and start interacting with your users through the chat interface.

---

## 📦 Installation

Add the following script to your HTML file to include Rigobot Chat Bubble:

```html
<script src="https://unpkg.com/rigobot-chat-bubble@0.0.68/dist/main.js"></script>
```

---

## 🛠️ Usage

### 1️⃣ Initializing the Chat Bubble

To initialize the chat bubble, use the `init` method with your **token** and optional settings.

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

---

### 2️⃣ Displaying the Chat Bubble

Use the `show` method to display the chat bubble. You can customize its position, visibility, and additional settings.

```javascript
window.rigo.show({
  showBubble: true,
  target: "#chat-grow",
  bubblePosition: {
    top: "10px",
    left: "10px",
  },
  collapsed: false,
  welcomeMessage: "Hello! How can I help you today?",
  user: {
    token: "user-session-token", // Optional, for authenticated users
    nickname: "Lulú",
  },
});
```

---

### 3️⃣ Hiding the Chat Bubble

To hide the chat bubble, use the `hide` method:

```javascript
window.rigo.hide();
```

---

### 4️⃣ Dynamically Updating Options

You can update the chat bubble's configuration dynamically using the `updateOptions` method:

```javascript
window.rigo.updateOptions({
  context: "The user is now focused on Product XYZ",
  target: "#new-target-element",
});
```

---

### 5️⃣ Listening to Events

Rigobot emits various events that you can listen to and respond to. Use the `on` method to attach event listeners.

#### Available Events and Their example Data:

- **`open_bubble`**: Triggered when the bubble is opened.

  ```javascript
  {
    when: "2025-01-22T14:00:00Z",
    url: "https://yourwebsite.com",
  }
  ```

- **`close_bubble`**: Triggered when the bubble is closed.

  ```javascript
  {
    when: "2025-01-22T15:00:00Z",
    url: "https://yourwebsite.com",
  }
  ```

- **`outgoing_message`**: Triggered when the user sends a message to the bot.

  ```javascript
  {
    text: "What is your pricing?",
    conversation: { id: "12345", purpose: "sales" },
    messages: [
      { sender: "user", text: "What is your pricing?" },
      { sender: "ai", text: "Our pricing starts at $50/month." },
    ],
    context: "The context sent to the AI",
    when: "2025-01-22T15:03:00Z",
    url: "https://yourwebsite.com",
  }
  ```

- **`incoming_message`**: Triggered when the bot sends a response to the user.
  ```javascript
  {
    text: "Our pricing starts at $50/month.",
    conversation: { id: "12345", purpose: "sales" },
    messages: [
      { sender: "user", text: "What is your pricing?" },
      { sender: "bot", text: "Our pricing starts at $50/month." },
    ],
    when: "2025-01-22T15:03:05Z",
    url: "https://yourwebsite.com",
  }
  ```

#### Example of Event Listening:

```javascript
window.rigo.on("open_bubble", (data) => {
  console.log("Bubble opened:", data);
});

window.rigo.on("incoming_message", (data) => {
  console.log("Bot response received:", data);
});
```

Aquí tienes una sección actualizada del `README.md` que documenta los métodos `ask` y `complete`:

---

### 6️⃣ Asking Rigobot a Question (`ask`)

The `ask` method allows you to send a prompt to the AI and receive a response in real-time. It also supports streaming responses directly into a DOM element.

#### Usage:

```javascript
const job = window.rigo.ask({
  prompt: "How can I start learning AI?", // The question to ask
  target: document.querySelector("#chat-target"), // DOM element to display the response
  format: "html", // Format of the response: "html" or "markdown"
  onStart: (data) => {
    console.log("Streaming started:", data);
  },
  onComplete: (success, data) => {
    if (success) {
      console.log("Response received:", data);
    } else {
      console.error("Error:", data.error);
    }
  },
});

// Start the job
job.run();

// Optionally stop the job if needed
job.stop();
```

#### Parameters:

| Parameter          | Type                  | Description                                                                  |
| ------------------ | --------------------- | ---------------------------------------------------------------------------- |
| `prompt`           | `string`              | The question or message to send to the AI.                                   |
| `target`           | `HTMLElement`         | The DOM element where the response will be rendered.                         |
| `format`           | `"html"`/`"markdown"` | The format of the response.                                                  |
| `onStart`          | `function`            | Callback triggered when the response streaming starts.                       |
| `onComplete`       | `function`            | Callback triggered when the response is fully received or an error occurs.   |
| `previousMessages` | `array`               | (Optional) Previous chat messages to provide context.                        |
| `useVectorStore`   | `boolean`             | (Optional) Whether to use vector embeddings for context. Defaults to `true`. |

---

### 7️⃣ Completing a Template (`complete`)

The `complete` method allows you to use a predefined template to generate structured AI responses. This is useful for scenarios where you want to provide specific input data and get a detailed output.

#### Usage:

```javascript
const job = window.rigo.complete({
  templateSlug: "testing-prompt", // The slug of the template to use
  payload: {
    user_name: "John Doe", // Inputs for the template
  },
  target: document.querySelector("#chat-target"), // DOM element to display the response
  format: "html", // Format of the response: "html" or "markdown"
  onStart: (data) => {
    console.log("Template completion started:", data);
  },
  onComplete: (success, data) => {
    if (success) {
      console.log("Completion received:", data);
    } else {
      console.error("Error:", data.error);
    }
  },
});

// Start the job
job.run();

// Optionally stop the job if needed
job.stop();
```

#### Parameters:

| Parameter      | Type                  | Description                                                                |
| -------------- | --------------------- | -------------------------------------------------------------------------- |
| `templateSlug` | `string`              | The identifier of the template to use.                                     |
| `payload`      | `object`              | The input data required by the template.                                   |
| `target`       | `HTMLElement`         | The DOM element where the response will be rendered.                       |
| `format`       | `"html"`/`"markdown"` | The format of the response.                                                |
| `onStart`      | `function`            | Callback triggered when the response streaming starts.                     |
| `onComplete`   | `function`            | Callback triggered when the response is fully received or an error occurs. |

---

### Example Integration:

Here’s an example of using both `ask` and `complete` methods:

```javascript
document.querySelector("#ask-button").addEventListener("click", function () {
  const job = window.rigo.ask({
    prompt: "What is the capital of France?",
    target: document.querySelector("#response-container"),
    format: "html",
    onStart: () => console.log("Asking started"),
    onComplete: (success, data) => {
      if (success) console.log("Answer:", data);
      else console.error("Error:", data.error);
    },
  });

  job.run();
});

document
  .querySelector("#complete-button")
  .addEventListener("click", function () {
    const job = window.rigo.complete({
      templateSlug: "greeting-template",
      payload: { user_name: "Alice" },
      target: document.querySelector("#response-container"),
      format: "html",
      onStart: () => console.log("Completion started"),
      onComplete: (success, data) => {
        if (success) console.log("Completion:", data);
        else console.error("Error:", data.error);
      },
    });

    job.run();
  });
```

Aquí tienes una sección actualizada del `README.md` que documenta los métodos `ask` y `complete`:

---

### 6️⃣ Asking Rigobot a Question (`ask`)

The `ask` method allows you to send a prompt to the AI and receive a response in real-time. It also supports streaming responses directly into a DOM element.

> NOTE: To use any of these methods you should call the `init` method first.

#### Usage:

```javascript
const job = window.rigo.ask({
  prompt: "How can I start learning AI?", // The question to ask
  target: document.querySelector("#chat-target"), // DOM element to display the response
  format: "html", // Format of the response: "html" or "markdown"
  onStart: (data) => {
    console.log("Streaming started:", data);
  },
  onComplete: (success, data) => {
    if (success) {
      console.log("Response received:", data);
    } else {
      console.error("Error:", data.error);
    }
  },
});

// Start the job
job.run();

// Optionally stop the job if needed
job.stop();
```

#### Parameters:

| Parameter          | Type                  | Description                                                                  |
| ------------------ | --------------------- | ---------------------------------------------------------------------------- |
| `prompt`           | `string`              | The question or message to send to the AI.                                   |
| `target`           | `HTMLElement`         | The DOM element where the response will be rendered.                         |
| `format`           | `"html"`/`"markdown"` | The format of the response.                                                  |
| `onStart`          | `function`            | Callback triggered when the response streaming starts.                       |
| `onComplete`       | `function`            | Callback triggered when the response is fully received or an error occurs.   |
| `previousMessages` | `array`               | (Optional) Previous chat messages to provide context.                        |
| `useVectorStore`   | `boolean`             | (Optional) Whether to use vector embeddings for context. Defaults to `true`. |

---

### 7️⃣ Completing a Template (`complete`)

The `complete` method allows you to use a predefined template to generate structured AI responses. This is useful for scenarios where you want to provide specific input data and get a detailed output.

#### Usage:

```javascript
const job = window.rigo.complete({
  templateSlug: "testing-prompt", // The slug of the template to use
  payload: {
    user_name: "John Doe", // Inputs for the template
  },
  target: document.querySelector("#chat-target"), // DOM element to display the response
  format: "html", // Format of the response: "html" or "markdown"
  onStart: (data) => {
    console.log("Template completion started:", data);
  },
  onComplete: (success, data) => {
    if (success) {
      console.log("Completion received:", data);
    } else {
      console.error("Error:", data.error);
    }
  },
});

// Start the job
job.run();

// Optionally stop the job if needed
job.stop();
```

#### Parameters:

| Parameter      | Type                  | Description                                                                |
| -------------- | --------------------- | -------------------------------------------------------------------------- |
| `templateSlug` | `string`              | The identifier of the template to use.                                     |
| `payload`      | `object`              | The input data required by the template.                                   |
| `target`       | `HTMLElement`         | The DOM element where the response will be rendered.                       |
| `format`       | `"html"`/`"markdown"` | The format of the response.                                                |
| `onStart`      | `function`            | Callback triggered when the response streaming starts.                     |
| `onComplete`   | `function`            | Callback triggered when the response is fully received or an error occurs. |

---

### Example Integration:

Here’s an example of using both `ask` and `complete` methods:

```javascript
document.querySelector("#ask-button").addEventListener("click", function () {
  const job = window.rigo.ask({
    prompt: "What is the capital of France?",
    target: document.querySelector("#response-container"),
    format: "html",
    onStart: () => console.log("Asking started"),
    onComplete: (success, data) => {
      if (success) console.log("Answer:", data);
      else console.error("Error:", data.error);
    },
  });

  job.run();
});

document
  .querySelector("#complete-button")
  .addEventListener("click", function () {
    const job = window.rigo.complete({
      templateSlug: "greeting-template",
      payload: { user_name: "Alice" },
      target: document.querySelector("#response-container"),
      format: "html",
      onStart: () => console.log("Completion started"),
      onComplete: (success, data) => {
        if (success) console.log("Completion:", data);
        else console.error("Error:", data.error);
      },
    });

    job.run();
  });
```

With these methods, you can take full advantage of Rigobot's capabilities to create dynamic and interactive experiences!

---

## 🌟 Example Implementation

Below is a complete example of how to integrate Rigobot Chat Bubble into your webpage:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Rigobot Chat Bubble</title>
    <script src="https://unpkg.com/rigobot-chat-bubble@0.0.13/dist/main.js"></script>
  </head>
  <body>
    <div id="chat-grow"></div>

    <script>
      document.addEventListener("DOMContentLoaded", function () {
        window.rigo.init("YOUR_CHAT_AGENT_HASH", {
          loglevel: "info",
          purposeSlug: "sales",
          context: "The user is exploring the pricing page",
          introVideo: {
            url: "https://www.youtube.com/watch?v=sg_XoPrwjI0&t=3s",
          },
          completions: [
            {
              prompt: "What are your pricing options?",
              answer: "Our pricing starts at $50/month.",
              DOMTarget: "#chat-grow",
            },
          ],
        });

        window.rigo.show({
          showBubble: true,
          collapsed: false,
          welcomeMessage: "Hi! How can I help you today?",
        });
      });
    </script>
  </body>
</html>
```

---

## ⚙️ Options

Here’s a breakdown of the options you can pass to the `init`, `show`, or `updateOptions` methods:

| Option           | Type               | Description                                                                              |
| ---------------- | ------------------ | ---------------------------------------------------------------------------------------- |
| `loglevel`       | `"info"`/`"debug"` | Sets logging verbosity level.                                                            |
| `showBubble`     | `boolean`          | Whether to display the chat bubble.                                                      |
| `collapsed`      | `boolean`          | Whether the chat bubble starts collapsed.                                                |
| `target`         | `string`           | CSS selector of the element to anchor the chat bubble.                                   |
| `introVideo`     | `object`           | `{ url: string }` – URL of the introductory video.                                       |
| `welcomeMessage` | `string`           | Message to greet the user when the chat loads.                                           |
| `purposeSlug`    | `string`           | Identifier for the purpose of the chat (e.g., "sales", "support").                       |
| `completions`    | `array`            | Array of `{ prompt, answer, DOMTarget }` objects for pre-configured chat interactions.   |
| `context`        | `string`           | Additional context to provide to the chat agent.                                         |
| `user`           | `object`           | `{ token, nickname, avatar }` – Information about the authenticated user (if available). |

---

## 🧩 Methods

Here are the primary methods available:

| Method          | Description                                                            |
| --------------- | ---------------------------------------------------------------------- |
| `init`          | Initializes Rigobot with a token and options.                          |
| `show`          | Displays the chat bubble.                                              |
| `hide`          | Hides the chat bubble.                                                 |
| `on`            | Listens for specific events (e.g., `open_bubble`, `outgoing_message`). |
| `updateOptions` | Dynamically updates chat bubble options.                               |

---

## 📜 License

This project is licensed under the MIT License.

Feel free to modify and use Rigobot Chat Bubble to enhance your website's user experience!
