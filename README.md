Invoke - AI Chat Assistant

Overview

Invoke is an AI-powered chat assistant built using Node.js and LangChain. The application leverages the Groq API for language model inference and the Tavily API for real-time web search. It features intelligent tool calling, conversation memory, and 24-hour chat history storage, enabling context-aware and informative interactions.

Features

- Conversational AI chatbot
- Integration with Groq LLM API
- Real-time web search using Tavily API
- Intelligent tool-calling mechanism
- Conversation memory support
- 24-hour chat history storage
- Context-aware responses
- Fast and efficient query processing

Technologies Used

- Node.js
- JavaScript
- LangChain
- Groq API
- Tavily API
- Express.js

How It Works

1. User submits a query.
2. The AI agent analyzes the request.
3. If external information is required, the agent invokes the Tavily search tool.
4. If no tool is needed, the Groq language model generates a response directly.
5. Conversation memory and chat history are maintained for contextual interactions.
6. The final response is returned to the user.

Future Improvements

- Voice-based interaction (Speech-to-Text and Text-to-Speech)
- PDF and document question-answering support
- Multi-model AI support
- User authentication and profile management
- Integration with additional AI tools and APIs
- Cloud deployment and scalability enhancements

Author

Mahvish Siddiqui
