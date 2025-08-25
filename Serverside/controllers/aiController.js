// import { GoogleGenerativeAI } from '@google/generative-ai';
// import dotenv from 'dotenv';
// dotenv.config();

// export const chatWithAI = async (req, res) => {
//   // Validate API key first
//   if (!process.env.GEMINI_API_KEY) {
//     return res.status(500).json({
//       error: 'Server configuration error',
//       details: 'GEMINI_API_KEY is not set in environment variables'
//     });
//   }

//   const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

//   try {
//     const { message, chatHistory = [] } = req.body;

//     if (!message || typeof message !== 'string') {
//       return res.status(400).json({
//         error: 'Invalid input',
//         details: 'Message must be a non-empty string'
//       });
//     }

//     if (chatHistory.some(msg =>
//       !msg.sender || !msg.text ||
//       !['user', 'ai'].includes(msg.sender)
//     )) {
//       return res.status(400).json({
//         error: 'Invalid chat history',
//         details: 'Each message must have sender (user/ai) and text'
//       });
//     }

//     const model = genAI.getGenerativeModel({
//       model: 'gemini-1.5-flash',
//       generationConfig: {
//         maxOutputTokens: 300,
//         temperature: 0.9
//       }
//     });

//     const formattedHistory = chatHistory.map(msg => ({
//       role: msg.sender === 'user' ? 'user' : 'model',
//       parts: [{ text: msg.text }]
//     }));

//     const chat = model.startChat({ history: formattedHistory });
//     const result = await chat.sendMessage(message);
//     const response = await result.response;
//     let text = response.text();

//     text = text
//   .replace(/\*\*/g, '')                  // Remove all **
//   .replace(/^\d+\.\s*/gm, '')            // Remove numbered lists (1., 2.)
//   .replace(/^-\s/gm, '• ')               // Convert - to bullets
//   .replace(/^\*\s/gm, '• ')              // Convert * to bullets
//   .replace(/([.!?])\s+/g, '$1\n')        // Single line break after sentences
//   .replace(/^([A-Z][^•:]+:)/gm, '**$1**') // Bold headings
//   .replace(/\n{2,}/g, '\n')              // Remove excessive newlines
//   .trim();

//     const sections = text.split(/\n{3,}/);
//     if (sections.length > 1) {
//       text = sections.map(section => 
//         `---\n\n${section.trim()}\n`
//       ).join('\n');
//     }

//     const updatedHistory = [
//       ...chatHistory,
//       { sender: 'user', text: message },
//       { sender: 'ai', text }
//     ];

//     return res.json({
//       message: text,
//       chatHistory: updatedHistory
//     });

//   } catch (error) {
//     console.error('Gemini API Error:', error);

//     if (error.message.includes('API key not valid')) {
//       return res.status(401).json({
//         error: 'Authentication failed',
//         details: 'Invalid Gemini API key'
//       });
//     }

//     if (error.message.includes('quota') || error.message.includes('rate limit')) {
//       return res.status(429).json({
//         error: 'Service limit reached',
//         details: 'Please try again later'
//       });
//     }

//     return res.status(500).json({
//       error: 'AI service unavailable',
//       details: error.message
//     });
//   }
// };

import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import AiChat from '../models/aichat.js'; 


dotenv.config();// loads variables from .env file into process.env

export const chatWithAI = async (req, res) => {
  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: 'Server configuration error' });
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  try {
    const userId = req.user.id;  // make sure you attach user info via JWT middleware
    const { message } = req.body; //extract user input

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Message must be a non-empty string" }); //to make sure the text is string
    }

    // ✅ Fetch existing chat or create new
    let chatDoc = await AiChat.findOne({ user: userId });
    if (!chatDoc) {
      chatDoc = new AiChat({ user: userId, messages: [] });
    }

    // Convert history for Gemini
    const formattedHistory = chatDoc.messages.map(msg => ({
      role: msg.sender === "user" ? "user" : "model",
      parts: [{ text: msg.text }]
    }));

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: { maxOutputTokens: 300, temperature: 0.9 }
    });

    const chat = model.startChat({ history: formattedHistory });
    const result = await chat.sendMessage(message);
    const response = await result.response;
    let text = response.text();

    // Formatting cleanup
    text = text
      .replace(/\*\*/g, "")
      .replace(/^\d+\.\s*/gm, "")
      .replace(/^-\s/gm, "• ")
      .replace(/^\*\s/gm, "• ")
      .replace(/([.!?])\s+/g, "$1\n")
      .replace(/^([A-Z][^•:]+:)/gm, "**$1**")
      .replace(/\n{2,}/g, "\n")
      .trim();

    // Save to DB
    chatDoc.messages.push({ sender: "user", text: message });
    chatDoc.messages.push({ sender: "ai", text });
    await chatDoc.save();

    return res.json({
      message: text,
      chatHistory: chatDoc.messages
    });

  } catch (error) {
    console.error("Gemini API Error:", error);
    return res.status(500).json({ error: "AI service unavailable", details: error.message });
  }
};

export const getChatHistory = async (req, res) => {
  try {
    const chatDoc = await AiChat.findOne({ user: req.user.id });
    if (!chatDoc) {
      return res.json({ messages: [] });
    }
    res.json({ messages: chatDoc.messages });
  } catch (err) {
    console.error("History fetch error:", err);
    res.status(500).json({ error: "Failed to fetch history" });
  }
};


export const clearChatHistory = async (req, res) => {
  try {
    const chatDoc = await AiChat.findOne({ user: req.user.id });
    if (chatDoc) {
      chatDoc.messages = [];
      await chatDoc.save();
    }
    res.json({ messages: [] });
  } catch (err) {
    console.error("Clear history error:", err);
    res.status(500).json({ error: "Failed to clear history" });
  }
};
