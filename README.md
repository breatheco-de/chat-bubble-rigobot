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
