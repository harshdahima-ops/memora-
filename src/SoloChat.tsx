import { useState, useEffect } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";

function SoloChat() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hello! I'm Solo4.2 — your advanced memory & learning AI. How can I help you today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Check API Key
  useEffect(() => {
    if (!import.meta.env.VITE_GEMINI_API_KEY) {
      setError("API Key is missing. Please check your .env file.");
    }
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    if (!import.meta.env.VITE_GEMINI_API_KEY) {
      setError("API Key not configured. Please contact admin.");
      return;
    }

    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);
    setError('');

    try {
      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
      
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        systemInstruction: `You are Solo4.2, an elite AI learning coach for Memora. Be professional, encouraging and highly effective.`,
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
    } catch (err: any) {
      console.error(err);
      setError("Something went wrong. Please try again.");
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "Sorry, I encountered an error. Please try again in a moment." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-950 text-white">
      <div className="bg-gray-900 border-b border-gray-800 p-4">
        <h1 className="text-3xl font-bold text-center">Solo4.2</h1>
        <p className="text-center text-gray-400">Advanced AI Memory Coach</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] px-5 py-4 rounded-2xl ${msg.role === 'user' 
              ? 'bg-blue-600' 
              : 'bg-gray-800'}`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && <div className="text-blue-400">Solo4.2 is thinking...</div>}
        {error && <div className="text-red-400 text-center">{error}</div>}
      </div>

      <div className="bg-gray-900 border-t border-gray-800 p-4">
        <div className="flex gap-3 max-w-4xl mx-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type your question here..."
            className="flex-1 bg-gray-800 border border-gray-700 rounded-2xl px-5 py-4 focus:outline-none focus:border-blue-500"
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            className="bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-2xl font-medium disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default SoloChat;
