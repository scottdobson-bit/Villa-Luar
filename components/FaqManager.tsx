import React, { useRef, useEffect } from 'react';
import { useContent } from '../context/ContentContext';
import { FAQ } from '../types';

const FaqManager = () => {
    const { draftContent, updateDraftContent } = useContent();
    const newFaqRef = useRef<HTMLDivElement>(null);

    const localFaqs = draftContent?.faqs || [];

    useEffect(() => {
        if (newFaqRef.current) {
            newFaqRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [localFaqs.length]);


    if (!draftContent) return <div>Loading...</div>;

    const handleUpdate = (id: string, field: 'question' | 'answer', value: string) => {
        const newFaqs = localFaqs.map(faq => faq.id === id ? { ...faq, [field]: value } : faq);
        updateDraftContent({ ...draftContent, faqs: newFaqs });
    };

    const handleAdd = () => {
        const newFaq: FAQ = {
            id: crypto.randomUUID(),
            question: '',
            answer: ''
        };
        updateDraftContent({ ...draftContent, faqs: [...localFaqs, newFaq] });
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to delete this FAQ? This action cannot be undone.')) {
            const newFaqs = localFaqs.filter(faq => faq.id !== id);
            updateDraftContent({ ...draftContent, faqs: newFaqs });
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Manage Chatbot FAQs</h2>
            <div className="space-y-4">
                {localFaqs.map((faq, index) => (
                    <div 
                        key={faq.id} 
                        ref={index === localFaqs.length -1 && faq.question === '' ? newFaqRef : null}
                        className="p-4 border rounded-lg dark:border-stone-700"
                    >
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-sm font-medium text-stone-700 dark:text-stone-200">Question</label>
                            <button onClick={() => handleDelete(faq.id)} className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300">Delete</button>
                        </div>
                        <input
                            type="text"
                            value={faq.question}
                            onChange={(e) => handleUpdate(faq.id, 'question', e.target.value)}
                            className="w-full p-2 border rounded-md dark:bg-stone-700 dark:border-stone-600"
                            placeholder="e.g., How many bedrooms are there?"
                        />
                        <div className="mt-2">
                            <label className="text-sm font-medium text-stone-700 dark:text-stone-200">Answer</label>
                            <textarea
                                value={faq.answer}
                                onChange={(e) => handleUpdate(faq.id, 'answer', e.target.value)}
                                className="w-full p-2 border rounded-md mt-1 h-24 dark:bg-stone-700 dark:border-stone-600"
                                placeholder="e.g., There are 5 bedrooms and 5.5 bathrooms."
                            />
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8">
                 <button onClick={handleAdd} className="px-6 py-2 bg-stone-200 text-stone-800 font-semibold rounded-lg hover:bg-stone-300 dark:bg-stone-700 dark:text-stone-200 dark:hover:bg-stone-600">Add New FAQ</button>
            </div>
        </div>
    );
};

export default FaqManager;