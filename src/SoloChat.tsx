import { useState } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY!);

const SYSTEM_PROMPT = `You are Solo4.2 — Memora's flagship AI Learning Intelligence.

You are an elite cognitive coach + memory expert + adaptive tutor. Your mission is to help users achieve exceptional long-term memory and deep mastery.

Personality: Wise, encouraging, strategic, patient, and quietly motivational.

Use Spaced Repetition, Active Recall, Feynman Technique, and Memory Hooks.
Make every response feel valuable.`;

function SoloChat() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hello! I'm Solo4.2, your advanced AI memory and learning coach for Memora. How can I help you today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        systemInstruction: SYSTEM_PROMPT,
      });

      const chat = model.startChat({
        history: messages.map(m => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }]
        }))
      });

      const result = await chat.sendMessage(input);
      const reply = result.response.text();

      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "Sorry, I couldn't respond. Please try again." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-screen flex flex-col bg-gray-50">
      <div className="bg-white shadow-sm border-b p-4">
        <h1 className="text-3xl font-bold text-center text-gray-800">Solo4.2</h1>
        <p className="text-center text-sm text-gray-500">Advanced Memory & Learning AI • Powered by Gemini</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-100">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] px-5 py-4 rounded-2xl text-[15px] leading-relaxed
              ${msg.role === 'user' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white border shadow-sm'}`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && <div className="text-gray-500">Solo4.2 is thinking...</div>}
      </div>

      <div className="p-4 bg-white border-t">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask about studies, notes, memory techniques..."
            className="flex-1 border rounded-2xl px-5 py-4 focus:outline-none focus:border-blue-500"
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-medium disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default SoloChat;
