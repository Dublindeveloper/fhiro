import { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function WaitlistForm() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        specialty: '',
        location: '',
    });
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.email || !formData.name) return;

        setStatus('loading');

        try {
            await addDoc(collection(db, 'waitlist'), {
                name: formData.name.trim(),
                email: formData.email.toLowerCase().trim(),
                specialty: formData.specialty || 'Not specified',
                location: formData.location.trim() || 'Not specified',
                source: 'landing_page',
                createdAt: serverTimestamp(),
            });

            setStatus('success');
            setMessage('You\'re on the list. We\'ll be in touch.');
            setFormData({ name: '', email: '', specialty: '', location: '' });
        } catch (error) {
            console.error('Error adding to waitlist:', error);
            setStatus('error');
            setMessage('Something went wrong. Please try again.');
        }
    };

    const specialties = [
        'Cardiology',
        'Dermatology',
        'Endocrinology',
        'Gastroenterology',
        'General Practice',
        'Geriatric Medicine',
        'Neurology',
        'Obstetrics & Gynaecology',
        'Oncology',
        'Ophthalmology',
        'Orthopaedics',
        'Paediatrics',
        'Psychiatry',
        'Radiology',
        'Respiratory Medicine',
        'Rheumatology',
        'Urology',
        'Other',
    ];

    const isDisabled = status === 'loading' || status === 'success';

    return (
        <form onSubmit={handleSubmit} className="max-w-lg mx-auto mb-4">
            <div className="space-y-3">
                {/* Name & Email Row */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Your name"
                        className="stealth-input flex-1"
                        required
                        disabled={isDisabled}
                    />
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="your@email.ie"
                        className="stealth-input flex-1"
                        required
                        disabled={isDisabled}
                    />
                </div>

                {/* Specialty & Location Row */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <select
                        name="specialty"
                        value={formData.specialty}
                        onChange={handleChange}
                        className="stealth-input flex-1 appearance-none cursor-pointer"
                        disabled={isDisabled}
                    >
                        <option value="">Select specialty...</option>
                        {specialties.map(s => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                    <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        placeholder="Location (e.g., Dublin)"
                        className="stealth-input flex-1"
                        disabled={isDisabled}
                    />
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isDisabled}
                    className={`w-full glow-button px-8 py-4 rounded-xl font-semibold transition-all ${status === 'loading' ? 'opacity-70 cursor-wait' : ''
                        } ${status === 'success' ? 'bg-emerald-600 cursor-default' : ''}`}
                >
                    {status === 'loading' ? 'Joining...' : status === 'success' ? '✓ You\'re on the list' : 'Request Early Access'}
                </button>
            </div>

            {/* Status Message */}
            {message && (
                <p className={`mt-3 text-sm text-center ${status === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {message}
                </p>
            )}
        </form>
    );
}
