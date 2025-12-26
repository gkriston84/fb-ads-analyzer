import React, { useEffect, useState } from 'react';
import { collection, getDocs, updateDoc, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { signOut, createUserWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from '../firebase';
// We need a secondary app for creating users without logging out the admin, 
// OR we just use Firestore to create the user RECORD and let them sign up separate?
// Requirement was "add new users". If we want to create Auth Use, we need a secondary app instance.
// For simplicity in this iteration, I'll handle "Create User" by flagging needing a secondary app or just create the Firestore profile and let them SignUp?
// Usually Admin panels use the Admin SDK (backend). Since this is client-side only:
// 1. We can create the Firestore document.
// 2. We CANNOT easily create the Auth user without logging out the current user unless we initialize a second App.
// I will initialize a second app for user creation.

import { initializeApp } from 'firebase/app';
import { getAuth as getAuthSecondary, createUserWithEmailAndPassword as createUserSecondary } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyAKkeWOnIF3FKDsvQV4OSC-wlKUSKa6dC4",
    authDomain: "fb-ads-analyzer.firebaseapp.com",
    projectId: "fb-ads-analyzer",
    storageBucket: "fb-ads-analyzer.firebasestorage.app",
    messagingSenderId: "987730250160",
    appId: "1:987730250160:web:47d3b99a8b97612c18ae75",
    measurementId: "G-ZWJKVW0W5X"
};

export default function Dashboard() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    // New User Form State
    const [newUserEmail, setNewUserEmail] = useState('');
    const [newUserPassword, setNewUserPassword] = useState('');
    const [newUserTier, setNewUserTier] = useState('starter');
    const [createMsg, setCreateMsg] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "users"));
            const userList = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setUsers(userList);
        } catch (error) {
            console.error("Error fetching users:", error);
            alert("Error fetching users. Ensure you have Admin permissions.");
        } finally {
            setLoading(false);
        }
    };

    const updateUserTier = async (userId, newTier) => {
        try {
            const userRef = doc(db, "users", userId);
            await updateDoc(userRef, { tier: newTier });
            // Update local state
            setUsers(users.map(u => u.id === userId ? { ...u, tier: newTier } : u));
        } catch (error) {
            console.error("Error updating tier:", error);
            alert("Failed to update tier.");
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        setCreateMsg('Creating user...');

        // Initialize secondary app to avoid logging out admin
        const secondaryApp = initializeApp(firebaseConfig, "Secondary");
        const secondaryAuth = getAuthSecondary(secondaryApp);

        try {
            // 1. Create Auth User
            const userCredential = await createUserSecondary(secondaryAuth, newUserEmail, newUserPassword);
            const uid = userCredential.user.uid;

            // 2. Create Firestore Profile
            await setDoc(doc(db, "users", uid), {
                email: newUserEmail,
                tier: newUserTier,
                runsCount: 0,
                lastRunMonth: new Date().toISOString().slice(0, 7),
                createdAt: serverTimestamp()
            });

            setCreateMsg('User created successfully!');
            setNewUserEmail('');
            setNewUserPassword('');
            setShowModal(false);
            fetchUsers(); // Refresh list

        } catch (error) {
            console.error("Error creating user:", error);
            setCreateMsg('Error: ' + error.message);
        }
    };

    const handleLogout = () => signOut(auth);

    if (loading) return <div className="p-10">Loading users...</div>;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
                    <button onClick={handleLogout} className="text-red-600 hover:text-red-800">Logout</button>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">

                {/* Actions */}
                <div className="mb-6 flex justify-end">
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                        + Add New User
                    </button>
                </div>

                {/* Users Table */}
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tier</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Runs Used</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Activity</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {users.map((user) => (
                                <tr key={user.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.tier === 'pro' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {user.tier}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.runsCount || 0}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.lastRunMonth}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <select
                                            value={user.tier}
                                            onChange={(e) => updateUserTier(user.id, e.target.value)}
                                            className="border rounded p-1 text-sm"
                                        >
                                            <option value="starter">Starter</option>
                                            <option value="pro">Pro</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>

            {/* Create User Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
                    <div className="bg-white rounded p-8 max-w-md w-full">
                        <h3 className="text-lg font-bold mb-4">Create New User</h3>
                        {createMsg && <p className="mb-2 text-sm text-blue-600">{createMsg}</p>}
                        <form onSubmit={handleCreateUser}>
                            <div className="mb-4">
                                <label className="block text-sm font-bold mb-2">Email</label>
                                <input
                                    type="email"
                                    className="w-full border p-2 rounded"
                                    value={newUserEmail}
                                    onChange={e => setNewUserEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-bold mb-2">Password</label>
                                <input
                                    type="password"
                                    className="w-full border p-2 rounded"
                                    value={newUserPassword}
                                    onChange={e => setNewUserPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="mb-6">
                                <label className="block text-sm font-bold mb-2">Initial Tier</label>
                                <select
                                    className="w-full border p-2 rounded"
                                    value={newUserTier}
                                    onChange={e => setNewUserTier(e.target.value)}
                                >
                                    <option value="starter">Starter</option>
                                    <option value="pro">Pro</option>
                                </select>
                            </div>
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                    Create
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
