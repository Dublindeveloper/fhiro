import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { db, auth, googleProvider } from '../lib/firebase';

const ALLOWED_EMAIL = 'connectjinish@gmail.com';

interface WaitlistEntry {
    id: string;
    name: string;
    email: string;
    specialty: string;
    location: string;
    createdAt: Timestamp | null;
}

interface ContactEntry {
    id: string;
    name: string;
    email: string;
    message: string;
    createdAt: Timestamp | null;
}

export default function AdminWaitlist() {
    const [user, setUser] = useState<User | null>(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'waitlist' | 'contacts'>('waitlist');
    const [entries, setEntries] = useState<WaitlistEntry[]>([]);
    const [contacts, setContacts] = useState<ContactEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setAuthLoading(false);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (!user || user.email !== ALLOWED_EMAIL) {
            setLoading(false);
            return;
        }

        const waitlistQuery = query(collection(db, 'waitlist'), orderBy('createdAt', 'desc'));
        const contactsQuery = query(collection(db, 'contacts'), orderBy('createdAt', 'desc'));

        const unsubWaitlist = onSnapshot(waitlistQuery, (snapshot) => {
            setEntries(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as WaitlistEntry[]);
            setLoading(false);
        });

        const unsubContacts = onSnapshot(contactsQuery, (snapshot) => {
            setContacts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ContactEntry[]);
        });

        return () => { unsubWaitlist(); unsubContacts(); };
    }, [user]);

    const handleSignIn = async () => {
        try { await signInWithPopup(auth, googleProvider); }
        catch (error) { console.error('Sign in error:', error); }
    };

    const handleSignOut = async () => {
        try { await signOut(auth); }
        catch (error) { console.error('Sign out error:', error); }
    };

    const formatDate = (timestamp: Timestamp | null) => {
        if (!timestamp) return 'N/A';
        return timestamp.toDate().toLocaleDateString('en-IE', {
            day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    if (authLoading) {
        return <div className="min-h-screen bg-[#0F172A] flex items-center justify-center"><div className="text-[#64748B]">Loading...</div></div>;
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-white mb-2"><span className="text-[#10B981]">F</span>hiro Admin</h1>
                    <p className="text-[#64748B] mb-8">Sign in to access the dashboard</p>
                    <button onClick={handleSignIn} className="flex items-center gap-3 px-6 py-3 bg-white text-[#0F172A] font-semibold rounded-lg hover:bg-gray-100 transition-colors mx-auto">
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Sign in with Google
                    </button>
                </div>
            </div>
        );
    }

    if (user.email !== ALLOWED_EMAIL) {
        return (
            <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
                    <p className="text-[#64748B] mb-6">{user.email} is not authorized.</p>
                    <button onClick={handleSignOut} className="px-6 py-2 bg-[#1E293B] text-white rounded-lg hover:bg-[#334155]">Sign out</button>
                </div>
            </div>
        );
    }

    const filteredEntries = entries.filter(e =>
        e.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.specialty?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.location?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredContacts = contacts.filter(c =>
        c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.message?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const exportCSV = () => {
        if (activeTab === 'waitlist') {
            const headers = ['Name', 'Email', 'Specialty', 'Location', 'Date'];
            const rows = filteredEntries.map(e => [e.name, e.email, e.specialty, e.location, formatDate(e.createdAt)]);
            const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
            downloadCSV(csv, 'fhiro-waitlist');
        } else {
            const headers = ['Name', 'Email', 'Message', 'Date'];
            const rows = filteredContacts.map(c => [c.name, c.email, c.message, formatDate(c.createdAt)]);
            const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
            downloadCSV(csv, 'fhiro-contacts');
        }
    };

    const downloadCSV = (csv: string, name: string) => {
        const blob = new Blob([csv], { type: 'text/csv' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `${name}-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    return (
        <div className="min-h-screen bg-[#0F172A] text-white p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div>
                        <h1 className="text-3xl font-bold"><span className="text-[#10B981]">F</span>hiro Admin</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                            className="px-4 py-2 bg-[#1E293B] border border-[#334155] rounded-lg text-white placeholder-[#64748B] focus:outline-none focus:border-[#10B981]" />
                        <button onClick={exportCSV} className="px-4 py-2 bg-[#10B981] text-[#0F172A] font-semibold rounded-lg hover:bg-[#34D399]">Export CSV</button>
                        <button onClick={handleSignOut} className="px-4 py-2 bg-[#1E293B] text-[#94A3B8] rounded-lg hover:bg-[#334155]" title="Sign out">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 mb-6 bg-[#1E293B] p-1 rounded-lg w-fit">
                    <button onClick={() => setActiveTab('waitlist')} className={`px-4 py-2 rounded-md font-medium transition-colors ${activeTab === 'waitlist' ? 'bg-[#10B981] text-[#0F172A]' : 'text-[#94A3B8] hover:text-white'}`}>
                        Waitlist ({entries.length})
                    </button>
                    <button onClick={() => setActiveTab('contacts')} className={`px-4 py-2 rounded-md font-medium transition-colors ${activeTab === 'contacts' ? 'bg-[#10B981] text-[#0F172A]' : 'text-[#94A3B8] hover:text-white'}`}>
                        Contacts ({contacts.length})
                    </button>
                </div>

                {/* Waitlist Tab */}
                {activeTab === 'waitlist' && (
                    <>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-4">
                                <p className="text-[#64748B] text-sm">Total</p>
                                <p className="text-2xl font-bold">{entries.length}</p>
                            </div>
                            <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-4">
                                <p className="text-[#64748B] text-sm">This Week</p>
                                <p className="text-2xl font-bold text-[#10B981]">{entries.filter(e => e.createdAt && e.createdAt.toDate() > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}</p>
                            </div>
                            <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-4">
                                <p className="text-[#64748B] text-sm">Top Specialty</p>
                                <p className="text-lg font-semibold truncate">{entries.length > 0 ? Object.entries(entries.reduce((a, e) => ({ ...a, [e.specialty]: (a[e.specialty] || 0) + 1 }), {} as Record<string, number>)).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A' : 'N/A'}</p>
                            </div>
                            <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-4">
                                <p className="text-[#64748B] text-sm">Top Location</p>
                                <p className="text-lg font-semibold truncate">{entries.length > 0 ? Object.entries(entries.reduce((a, e) => ({ ...a, [e.location]: (a[e.location] || 0) + 1 }), {} as Record<string, number>)).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A' : 'N/A'}</p>
                            </div>
                        </div>

                        {loading ? <div className="text-center py-12 text-[#64748B]">Loading...</div> : filteredEntries.length === 0 ? <div className="text-center py-12 text-[#64748B]">{searchTerm ? 'No results' : 'No signups yet'}</div> : (
                            <div className="bg-[#1E293B] border border-[#334155] rounded-xl overflow-hidden">
                                <table className="w-full">
                                    <thead><tr className="border-b border-[#334155]">
                                        <th className="text-left px-6 py-4 text-[#64748B] font-medium text-sm">Name</th>
                                        <th className="text-left px-6 py-4 text-[#64748B] font-medium text-sm">Email</th>
                                        <th className="text-left px-6 py-4 text-[#64748B] font-medium text-sm">Specialty</th>
                                        <th className="text-left px-6 py-4 text-[#64748B] font-medium text-sm">Location</th>
                                        <th className="text-left px-6 py-4 text-[#64748B] font-medium text-sm">Date</th>
                                    </tr></thead>
                                    <tbody>{filteredEntries.map((entry, i) => (
                                        <tr key={entry.id} className={`border-b border-[#334155] last:border-0 hover:bg-[#0F172A]/50 ${i % 2 === 0 ? 'bg-[#1E293B]' : 'bg-[#1a2536]'}`}>
                                            <td className="px-6 py-4 font-medium">{entry.name || 'N/A'}</td>
                                            <td className="px-6 py-4 text-[#94A3B8]">{entry.email}</td>
                                            <td className="px-6 py-4"><span className="px-2 py-1 bg-[#10B981]/10 text-[#10B981] rounded-md text-sm">{entry.specialty || 'N/A'}</span></td>
                                            <td className="px-6 py-4 text-[#94A3B8]">{entry.location || 'N/A'}</td>
                                            <td className="px-6 py-4 text-[#64748B] text-sm">{formatDate(entry.createdAt)}</td>
                                        </tr>
                                    ))}</tbody>
                                </table>
                            </div>
                        )}
                    </>
                )}

                {/* Contacts Tab */}
                {activeTab === 'contacts' && (
                    <>
                        {filteredContacts.length === 0 ? <div className="text-center py-12 text-[#64748B]">{searchTerm ? 'No results' : 'No messages yet'}</div> : (
                            <div className="space-y-4">
                                {filteredContacts.map((contact) => (
                                    <div key={contact.id} className="bg-[#1E293B] border border-[#334155] rounded-xl p-6">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <p className="font-semibold text-white">{contact.name}</p>
                                                <p className="text-[#94A3B8] text-sm">{contact.email}</p>
                                            </div>
                                            <span className="text-[#64748B] text-sm">{formatDate(contact.createdAt)}</span>
                                        </div>
                                        <p className="text-[#CBD5E1] whitespace-pre-wrap">{contact.message}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
