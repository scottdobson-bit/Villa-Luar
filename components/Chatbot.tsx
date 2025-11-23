import React, { useState, useRef, useEffect } from 'react';
import { useContent } from '../context/ContentContext';
import { getChatbotResponse } from '../services/geminiService';

const Chatbot = () => {
    const { content } = useContent();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<{sender: 'user' | 'bot', text: string}[]>([
        { sender: 'bot', text: 'Hello! I am the Villa Luar AI assistant. Ask me anything about the property.' }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const toggleChat = () => setIsOpen(!isOpen);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isOpen]);

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim()) return;

        const userMessage = input;
        setMessages(prev => [...prev, { sender: 'user', text: userMessage }]);
        setInput('');
        setIsTyping(true);

        try {
            const faqs = content?.faqs || [];
            const response = await getChatbotResponse(userMessage, faqs);
            setMessages(prev => [...prev, { sender: 'bot', text: response }]);
        } catch (error) {
             setMessages(prev => [...prev, { sender: 'bot', text: "I'm sorry, I'm having trouble connecting right now." }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {/* Chat Window */}
            {isOpen && (
                <div className="mb-4 w-80 md:w-96 h-[500px] bg-white dark:bg-stone-800 rounded-2xl shadow-2xl flex flex-col border border-stone-200 dark:border-stone-700 overflow-hidden animate-fade-in-up">
                    {/* Header */}
                    <div className="bg-amber-700 dark:bg-amber-900 p-4 text-white flex justify-between items-center">
                        <div>
                            <h3 className="font-bold text-lg">Villa Luar Assistant</h3>
                            <p className="text-xs text-amber-200">Powered by AI</p>
                        </div>
                        <button onClick={toggleChat} className="text-white hover:text-amber-200 focus:outline-none">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-50 dark:bg-stone-900">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                                    msg.sender === 'user' 
                                    ? 'bg-amber-700 text-white rounded-tr-none' 
                                    : 'bg-white dark:bg-stone-700 text-stone-800 dark:text-stone-200 rounded-tl-none shadow-sm border border-stone-100 dark:border-stone-600'
                                }`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="bg-white dark:bg-stone-700 p-3 rounded-2xl rounded-tl-none shadow-sm border border-stone-100 dark:border-stone-600 flex gap-1">
                                    <span className="w-2 h-2 bg-stone-400 rounded-full animate-bounce"></span>
                                    <span className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
                                    <span className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <form onSubmit={handleSend} className="p-3 bg-white dark:bg-stone-800 border-t border-stone-200 dark:border-stone-700 flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask about the villa..."
                            className="flex-1 px-4 py-2 rounded-full border border-stone-300 dark:border-stone-600 bg-stone-50 dark:bg-stone-700 text-stone-800 dark:text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                        />
                        <button 
                            type="submit" 
                            disabled={!input.trim() || isTyping}
                            className="p-2 bg-amber-700 text-white rounded-full hover:bg-amber-800 disabled:bg-stone-400 disabled:cursor-not-allowed transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                            </svg>
                        </button>
                    </form>
                </div>
            )}

            {/* Floating Action Button */}
            <button
                onClick={toggleChat}
                className={`p-4 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 focus:outline-none ${
                    isOpen ? 'bg-stone-600 text-white' : 'bg-amber-600 text-white hover:bg-amber-700'
                }`}
                aria-label="Open Chat"
            >
                {isOpen ? (
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                )}
            </button>
        </div>
    );
};

export default Chatbot;