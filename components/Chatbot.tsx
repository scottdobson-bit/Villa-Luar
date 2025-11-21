import React, { useState, useRef, useEffect } from 'react';
import { useContent } from '../context/ContentContext';
import { getChatbotResponse } from '../services/geminiService';

// Icons
const ChatIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
    </svg>
);

const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const SendIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
    </svg>
);


const TypingIndicator = () => (
    <div className="flex items-center space-x-1 p-2">
        <span className="text-stone-500 dark:text-stone-400">Thinking</span>
        <div className="h-2 w-2 bg-stone-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="h-2 w-2 bg-stone-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="h-2 w-2 bg-stone-400 rounded-full animate-bounce"></div>
    </div>
);

interface Message {
    id: number;
    text: string;
    sender: 'user' | 'bot';
}

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { content } = useContent();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);

    useEffect(() => {
        if (isOpen && messages.length === 0) {
            setMessages([
                { id: 1, text: "Hello! I'm the Villa Luar assistant. How can I help you today?", sender: 'bot' }
            ]);
        }
    }, [isOpen, messages.length]);

    const handleSend = async () => {
        if (inputValue.trim() === '' || isLoading) return;

        const userMessage: Message = { id: Date.now(), text: inputValue, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        const faqs = content?.faqs || [];
        const responseText = await getChatbotResponse(inputValue, faqs);
        
        const botMessage: Message = { id: Date.now() + 1, text: responseText, sender: 'bot' };
        setMessages(prev => [...prev, botMessage]);
        setIsLoading(false);
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className={`fixed bottom-6 right-6 bg-amber-700 text-white p-4 rounded-full shadow-lg hover:bg-amber-600 transition-all transform hover:scale-110 focus:outline-none z-40 ${isOpen ? 'opacity-0 scale-0' : 'opacity-100 scale-100'}`}
                aria-label="Open Chat"
            >
                <ChatIcon />
            </button>
            
            <div className={`fixed bottom-6 right-6 w-[calc(100%-3rem)] max-w-sm h-[70vh] max-h-[600px] z-50 bg-white dark:bg-stone-800 rounded-2xl shadow-2xl flex flex-col transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16 pointer-events-none'}`}>
                <header className="flex items-center justify-between p-4 border-b border-stone-200 dark:border-stone-700">
                    <h3 className="font-bold text-lg text-stone-800 dark:text-white">Ask about Villa Luar</h3>
                    <button onClick={() => setIsOpen(false)} className="text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-white">
                        <CloseIcon />
                    </button>
                </header>

                <div className="flex-1 p-4 overflow-y-auto space-y-4">
                    {messages.map(msg => (
                        <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] p-3 rounded-2xl ${msg.sender === 'user' ? 'bg-amber-700 text-white rounded-br-lg' : 'bg-stone-200 dark:bg-stone-700 text-stone-800 dark:text-stone-200 rounded-bl-lg'}`}>
                                <p className="text-sm" style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</p>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                             <div className="p-3 rounded-2xl bg-stone-200 dark:bg-stone-700 rounded-bl-lg">
                                <TypingIndicator />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <footer className="p-4 border-t border-stone-200 dark:border-stone-700">
                    <div className="flex items-center bg-stone-100 dark:bg-stone-900 rounded-full p-1">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Type your question..."
                            className="flex-1 bg-transparent px-4 py-2 border-none focus:ring-0 text-stone-800 dark:text-white placeholder-stone-400"
                            disabled={isLoading}
                        />
                        <button onClick={handleSend} disabled={isLoading || inputValue.trim() === ''} className="bg-amber-700 text-white p-2 rounded-full disabled:bg-stone-400 dark:disabled:bg-stone-600 transition-colors">
                            <SendIcon />
                        </button>
                    </div>
                </footer>
            </div>
        </>
    );
};

export default Chatbot;
