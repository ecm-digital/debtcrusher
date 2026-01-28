import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, Sparkles, TrendingUp, Calculator } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getCoachResponse } from '../utils/coachLogic';

export default function AICoach({ context }) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, text: "Cześć! Jestem Twoim Trenerem Finansowym. Jak mogę Ci dziś pomóc? 🤖", sender: 'bot' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = (text = inputValue) => {
        if (!text.trim()) return;

        // Add User Message
        const userMsg = { id: Date.now(), text, sender: 'user' };
        setMessages(prev => [...prev, userMsg]);
        setInputValue('');

        // Process Bot Response
        setTimeout(() => {
            const responseText = getCoachResponse(text, context);
            const botMsg = { id: Date.now() + 1, text: responseText, sender: 'bot' };
            setMessages(prev => [...prev, botMsg]);
        }, 600);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') handleSend();
    };

    return (
        <>
            {/* Floating Action Button */}
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full shadow-2xl flex items-center justify-center z-50 text-white border-2 border-white/20"
            >
                {isOpen ? <X size={24} /> : <Bot size={28} />}
            </motion.button>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20, x: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20, x: 20 }}
                        className="fixed bottom-24 right-4 md:right-6 w-[90vw] md:w-96 h-[500px] bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden backdrop-blur-xl bg-gray-900/95"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-indigo-600 to-purple-700 p-4 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                                <Bot size={18} className="text-white" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-white">Trener Finansowy</h3>
                                <p className="text-[10px] text-indigo-200 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                                    Online
                                </p>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed ${msg.sender === 'user'
                                                ? 'bg-indigo-600 text-white rounded-tr-none'
                                                : 'bg-gray-800 text-gray-200 rounded-tl-none border border-gray-700'
                                            }`}
                                    >
                                        {msg.text.split('\n').map((line, i) => (
                                            <p key={i} className="mb-1 last:mb-0">{line}</p>
                                        ))}
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Quick Actions */}
                        <div className="p-2 bg-gray-900/50 border-t border-gray-800 flex gap-2 overflow-x-auto no-scrollbar">
                            <button onClick={() => handleSend("Jak mi idzie?")} className="flex items-center gap-1 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-full text-xs text-gray-300 whitespace-nowrap border border-gray-700 transition-colors">
                                <TrendingUp size={12} className="text-emerald-400" /> Status
                            </button>
                            <button onClick={() => handleSend("Co jeśli wpłacę 200 zł?")} className="flex items-center gap-1 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-full text-xs text-gray-300 whitespace-nowrap border border-gray-700 transition-colors">
                                <Calculator size={12} className="text-blue-400" /> Symulacja
                            </button>
                            <button onClick={() => handleSend("Daj motywację")} className="flex items-center gap-1 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-full text-xs text-gray-300 whitespace-nowrap border border-gray-700 transition-colors">
                                <Sparkles size={12} className="text-yellow-400" /> Motywacja
                            </button>
                        </div>

                        {/* Input Area */}
                        <div className="p-3 bg-gray-900/80 border-t border-gray-800 flex gap-2">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Zapytaj o radę..."
                                className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-gray-500"
                            />
                            <button
                                onClick={() => handleSend()}
                                className="bg-indigo-600 hover:bg-indigo-500 text-white p-2 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={!inputValue.trim()}
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
