import { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function ContactForm() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: '',
    });
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.email || !formData.message) return;

        setStatus('loading');

        try {
            await addDoc(collection(db, 'contacts'), {
                name: formData.name.trim() || 'Anonymous',
                email: formData.email.toLowerCase().trim(),
                message: formData.message.trim(),
                read: false,
                createdAt: serverTimestamp(),
            });

            setStatus('success');
            setFormData({ name: '', email: '', message: '' });
        } catch (error) {
            console.error('Error sending message:', error);
            setStatus('error');
        }
    };

    if (status === 'success') {
        return (
            <div className="text-center py-8">
                <div className="w-16 h-16 bg-[#10B981]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-[#10B981]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Message sent</h3>
                <p className="text-[#64748B]">We'll get back to you soon.</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your name (optional)"
                    className="stealth-input w-full"
                    disabled={status === 'loading'}
                />
            </div>
            <div>
                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your@email.ie"
                    className="stealth-input w-full"
                    required
                    disabled={status === 'loading'}
                />
            </div>
            <div>
                <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Your message..."
                    rows={4}
                    className="stealth-input w-full resize-none"
                    required
                    disabled={status === 'loading'}
                />
            </div>
            <button
                type="submit"
                disabled={status === 'loading'}
                className={`w-full glow-button px-8 py-4 rounded-xl font-semibold transition-all ${status === 'loading' ? 'opacity-70 cursor-wait' : ''
                    }`}
            >
                {status === 'loading' ? 'Sending...' : 'Send Message'}
            </button>
            {status === 'error' && (
                <p className="text-red-400 text-sm text-center">Something went wrong. Please try again.</p>
            )}
        </form>
    );
}
