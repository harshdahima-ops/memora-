import { useState } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

const SYSTEM_PROMPT = `You are Solo4.2 — Memora's flagship AI Learning Intelligence.

You are an elite cognitive coach specialized in memory enhancement and deep learning. 
Help users master any subject using proven techniques like Spaced Repetition, Active Recall, Feynman Technique, and Memory Palace.

Be wise, encouraging, strategic and highly professional. 
Always make responses structured, actionable and valuable.`;

function SoloChat() {
  const [messages, setMessages] = useState([
    { 
      role: 'assistant', 
      content: "Hello! I'm **Solo4.2** — your advanced AI memory & learning companion. How can I help you master your studies today?" 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    const currentInput = input;
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

      const result = await chat.sendMessage(currentInput);
      const reply = result.response.text();

      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "Sorry, I encountered an error. Please try again in a moment." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="bg-white border-b shadow-sm p-4">
        <h1 className="text-3xl font-bold text-center">Solo4.2</h1>
        <p className="text-center text-gray-600">Advanced Memory & Learning AI</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] px-6 py-4 rounded-3xl text-[15.5px] leading-relaxed shadow-sm
              ${msg.role === 'user' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white border'}`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border px-6 py-4 rounded-3xl">Solo4.2 is thinking deeply...</div>
          </div>
        )}
      </div>

      <div className="bg-white border-t p-4">
        <div className="flex gap-3 max-w-4xl mx-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask anything about your notes, subjects, exams or memory techniques..."
            className="flex-1 border-2 border-gray-200 rounded-2xl px-6 py-4 focus:border-blue-500 focus:outline-none"
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-2xl font-semibold disabled:opacity-50 transition"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default SoloChat;
