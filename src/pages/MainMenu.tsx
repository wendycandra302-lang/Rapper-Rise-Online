import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Mic2, Apple, Mail } from 'lucide-react'; // Simulating Google with generic, or just text

export default function MainMenu() {
  const { user, loading, signInWithGoogle, signInWithApple, signOut } = useAuth();
  const navigate = useNavigate();
  const [hasArtist, setHasArtist] = useState<boolean | null>(null);

  useEffect(() => {
    if (user) {
      checkArtistStatus();
    }
  }, [user]);

  const checkArtistStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('artists')
        .select('id')
        .eq('user_id', user!.id)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error checking artist:', error);
      }

      setHasArtist(!!data);
    } catch (err) {
      console.error('Unexpected error:', err);
    }
  };

  const handlePlay = () => {
    if (hasArtist === null) return;
    if (hasArtist) {
      navigate('/dashboard');
    } else {
      navigate('/create-artist');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <p className="animate-pulse">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-900/20 rounded-full blur-3xl -z-10 animate-pulse"></div>

      <div className="text-center z-10 flex flex-col items-center">
        <div className="bg-indigo-600 p-4 rounded-full mb-6 shadow-lg shadow-indigo-600/50">
          <Mic2 size={64} className="text-white" />
        </div>
        
        <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 mb-2 tracking-tighter">
          RAPPER RISE
        </h1>
        <p className="text-slate-400 text-xl font-medium tracking-widest uppercase mb-12">Online</p>

        {!user ? (
          <div className="w-full max-w-sm flex flex-col gap-4">
            <button
              onClick={signInWithGoogle}
              className="w-full bg-white text-slate-900 font-bold py-3 px-6 rounded-xl hover:bg-slate-200 transition-colors flex items-center justify-center gap-3"
            >
              <svg width="24" height="24" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Login with Google
            </button>
            <button
              onClick={signInWithApple}
              className="w-full bg-black border border-slate-700 text-white font-bold py-3 px-6 rounded-xl hover:bg-slate-900 transition-colors flex items-center justify-center gap-3"
            >
              <Apple size={24} />
              Login with Apple
            </button>
          </div>
        ) : (
          <div className="w-full flex justify-center animate-fade-in">
            <button
              onClick={handlePlay}
              disabled={hasArtist === null}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-black text-2xl py-4 px-16 rounded-2xl shadow-[0_0_40px_-10px_rgba(79,70,229,1)] transition-all transform hover:scale-105 disabled:opacity-50 disabled:pointer-events-none"
            >
              {hasArtist === null ? 'LOADING...' : 'PLAY'}
            </button>
          </div>
        )}

      </div>
        {user && (
          <button 
            onClick={signOut} 
            className="absolute bottom-8 text-slate-500 hover:text-slate-300 font-medium transition-colors"
          >
            Sign out ({user.email})
          </button>
        )}
    </div>
  );
}
