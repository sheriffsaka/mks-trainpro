import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { supabase } from '../services/supabaseClient';
import { useAuthStore } from '../store/authStore';

export const ProfileTab = () => {
  const { user, profile } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    if (profile) {
      setEditForm({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        address: profile.address || ''
      });
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update(editForm)
        .eq('id', user.id);
      
      if (error) throw error;
      alert('Profile updated successfully!');
      setIsEditing(false);
      window.location.reload(); 
    } catch (err) {
      console.error('Error updating profile:', err);
      alert('Failed to update profile. Please try again.');
    }
  };

  if (!user) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Profile Settings</h2>
        <button 
          onClick={() => setIsEditing(!isEditing)}
          className={`px-6 py-2 rounded-xl font-bold transition-all ${
            isEditing ? 'bg-slate-100 text-slate-600' : 'bg-brand-blue text-white'
          }`}
        >
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Full Name</label>
              <input 
                type="text"
                disabled={!isEditing}
                value={editForm.full_name}
                onChange={(e) => setEditForm({...editForm, full_name: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-blue outline-none disabled:opacity-60"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Email Address</label>
              <input 
                type="email"
                disabled
                value={user.email}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl opacity-60 cursor-not-allowed"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Phone Number</label>
              <input 
                type="tel"
                disabled={!isEditing}
                value={editForm.phone}
                onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-blue outline-none disabled:opacity-60"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Role</label>
              <div className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="font-bold text-slate-900 capitalize">{profile?.role || 'Student'}</span>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Address</label>
            <textarea 
              disabled={!isEditing}
              value={editForm.address}
              onChange={(e) => setEditForm({...editForm, address: e.target.value})}
              rows={3}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-blue outline-none disabled:opacity-60 resize-none"
            />
          </div>

          {isEditing && (
            <div className="flex justify-end pt-4">
              <button 
                type="submit"
                className="bg-brand-blue text-white px-10 py-3 rounded-xl font-bold hover:bg-brand-blue-hover transition-all shadow-lg shadow-brand-blue/20"
              >
                Save Changes
              </button>
            </div>
          )}
        </form>
      </div>
    </motion.div>
  );
};
