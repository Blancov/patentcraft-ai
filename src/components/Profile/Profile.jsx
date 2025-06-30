import React, { useState, useEffect } from 'react';
import { getCurrentUser, updateProfile, signOut } from '../../services/supabase';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [website, setWebsite] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const { data: { user } } = await getCurrentUser();
    if (user) {
      setUser(user);
      setEmail(user.email);
      setUsername(user.user_metadata.username || '');
      setWebsite(user.user_metadata.website || '');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { error } = await updateProfile({
      data: {
        username,
        website
      }
    });
    
    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/login';
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Profile Management</h2>
      {message && <div className={`mb-4 p-2 rounded ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{message}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Email</label>
          <input 
            type="email" 
            value={email} 
            disabled
            className="w-full p-2 border border-gray-300 rounded bg-gray-100"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Username</label>
          <input 
            type="text" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 mb-2">Website</label>
          <input 
            type="url" 
            value={website} 
            onChange={(e) => setWebsite(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        
        <div className="flex justify-between">
          <button 
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Update Profile
          </button>
          
          <button 
            type="button"
            onClick={handleSignOut}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            Sign Out
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;