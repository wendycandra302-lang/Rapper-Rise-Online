import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Mic2, ArrowRight } from 'lucide-react';

export default function MainMenu() {
  const { user, loading, signInWithEmail, signUpWithEmail, signOut } = useAuth();
  const navigate = useNavigate();
  const [hasArtist, setHasArtist] = useState<boolean | null>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

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

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);

    if (authMode === 'login') {
      const { error } = await signInWithEmail(email, password);
      if (error) setAuthError(error.message);
    } else {
      const { error } = await signUpWithEmail(email, password);
      if (error) setAuthError(error.message);
      else setAuthError('Registration successful! Please check your email to verify your account or login directly if email verification is disabled in Supabase.');
    }

    setAuthLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <p className="animate-pulse">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white relative overflow-hidden px-4">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-900/20 rounded-full blur-3xl -z-10 animate-pulse"></div>

      <div className="text-center z-10 flex flex-col items-center w-full max-w-sm">
        <div className="bg-indigo-600 p-4 rounded-full mb-6 shadow-lg shadow-indigo-600/50">
          <Mic2 size={64} className="text-white" />
        </div>
        
        <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 mb-2 tracking-tighter">
          RAPPER RISE
        </h1>
        <p className="text-slate-400 text-xl font-medium tracking-widest uppercase mb-12">Online</p>

        {!user ? (
          <div className="w-full bg-slate-900/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-800 shadow-xl">
            <h2 className="text-2xl font-bold mb-6">{authMode === 'login' ? 'Welcome Back' : 'Join the Label'}</h2>
            
            {authError && (
              <div className="bg-slate-800/50 border border-slate-700 text-sm text-slate-300 p-3 rounded-xl mb-6 text-left">
                {authError}
              </div>
            )}

            <form onSubmit={handleAuth} className="space-y-4">
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
                  required
                />
              </div>
              <div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={authLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_-5px_rgba(79,70,229,0.5)] disabled:opacity-50"
              >
                {authLoading ? 'PROCESSING...' : (authMode === 'login' ? 'LOGIN' : 'CREATE ACCOUNT')}
                {!authLoading && <ArrowRight size={18} />}
              </button>
            </form>
            
            <div className="mt-6 text-sm text-slate-400">
              {authMode === 'login' ? "Don't have an account?" : "Already have an account?"}
              <button 
                onClick={() => {
                  setAuthMode(authMode === 'login' ? 'register' : 'login');
                  setAuthError(null);
                }} 
                className="ml-2 text-indigo-400 hover:text-indigo-300 font-bold"
              >
                {authMode === 'login' ? 'Register' : 'Login'}
              </button>
            </div>
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
