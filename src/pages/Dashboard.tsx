import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Artist } from '../types';
import { Home, Music, TrendingUp, User as UserIcon, LogOut } from 'lucide-react';
import { format } from 'date-fns';

// Helper to calculate a globally synced game date and countdown.
// For Rapper Rise, let's say 1 game day = 1 real hour.
// For testing purposes, let's say 1 game day = 5 real minutes (300,000 ms)
const GAME_DAY_MS = 5 * 60 * 1000;
const BASE_DATE = new Date(2024, 0, 1).getTime(); // Starting game date: Jan 1, 2024

function getGameState() {
  const now = Date.now();
  const elapsedDays = Math.floor(now / GAME_DAY_MS);
  const currentGameDate = new Date(BASE_DATE + elapsedDays * 24 * 60 * 60 * 1000);
  
  const msUntilNextDay = GAME_DAY_MS - (now % GAME_DAY_MS);
  const secondsUntilNext = Math.floor(msUntilNextDay / 1000);
  
  const m = Math.floor(secondsUntilNext / 60);
  const s = secondsUntilNext % 60;
  
  return {
    date: currentGameDate,
    countdown: `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  };
}

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const [artist, setArtist] = useState<Artist | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [gameState, setGameState] = useState(getGameState());

  useEffect(() => {
    // Tick game clock
    const interval = setInterval(() => {
      setGameState(getGameState());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (user) {
      loadArtist();
    }
  }, [user]);

  const loadArtist = async () => {
    const { data, error } = await supabase
      .from('artists')
      .select('*')
      .eq('user_id', user!.id)
      .single();
    
    if (data) {
      setArtist(data);
    } else if (error) {
      console.error(error);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <p className="animate-pulse">Loading Career...</p>
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white flex-col gap-4">
        <p>No artist found.</p>
        <button onClick={signOut} className="text-indigo-400">Sign Out</button>
      </div>
    );
  }

  const avgPop = Math.round((artist.pop_asia + artist.pop_europe + artist.pop_america + artist.pop_africa) / 4);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-20">
      
      {/* Top Header */}
      <header className="bg-slate-900 border-b border-slate-800 p-4 sticky top-0 z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-800 overflow-hidden border border-slate-700">
            {artist.image_url ? (
              <img src={artist.image_url} alt={artist.name} className="w-full h-full object-cover" />
            ) : (
              <UserIcon className="w-full h-full p-2 text-slate-500" />
            )}
          </div>
          <div>
            <h2 className="font-bold text-sm leading-tight text-white">{artist.name}</h2>
            <p className="text-xs text-indigo-400 font-medium">{artist.genre} â€¢ {artist.region}</p>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-sm font-black text-green-400">
            ${artist.money.toLocaleString()}
          </div>
          <button onClick={signOut} className="text-[10px] text-slate-500 hover:text-slate-300 uppercase tracking-wider">
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 flex flex-col gap-6 max-w-lg mx-auto w-full">
        
        {/* Game Time Card */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
            <p className="text-sm text-slate-400 font-medium tracking-widest uppercase mb-1">Game Date</p>
            <p className="text-2xl font-black text-white mb-4 tracking-tight">
                {format(gameState.date, 'MMM do, yyyy')}
            </p>
            
            <div className="bg-slate-950 rounded-xl px-6 py-3 border border-slate-800 flex flex-col items-center">
                <p className="text-xs text-slate-500 font-semibold mb-1 uppercase tracking-wider">Next Day In</p>
                <div className="text-3xl font-mono font-bold text-indigo-400">
                    {gameState.countdown}
                </div>
            </div>
        </div>

        {/* Stats Title */}
        <div className="flex items-center gap-2 px-1">
            <TrendingUp size={18} className="text-slate-400" />
            <h3 className="font-bold text-slate-300 uppercase tracking-widest text-sm">Career Stats</h3>
        </div>

        {/* Popularity Bar */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5">
            <div className="flex justify-between items-end mb-2">
                <div>
                    <h4 className="font-bold text-white text-lg">Global Popularity</h4>
                    <p className="text-xs text-slate-500">Avg across 4 regions</p>
                </div>
                <div className="text-xl font-black text-white">{avgPop}%</div>
            </div>
            <div className="h-4 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800 relative">
                <div 
                    className="h-full bg-gradient-to-r from-pink-500 to-rose-500 transition-all duration-1000 ease-out"
                    style={{ width: `${avgPop}%` }}
                ></div>
            </div>
            
            {/* Breakdown (Optional detail as requested by design prompt to be distinctive) */}
            <div className="grid grid-cols-4 gap-2 mt-4">
                {[
                    { label: 'Asia', val: artist.pop_asia },
                    { label: 'EU', val: artist.pop_europe },
                    { label: 'NA', val: artist.pop_america },
                    { label: 'AF', val: artist.pop_africa },
                ].map(r => (
                    <div key={r.label} className="text-center bg-slate-950 rounded-lg py-2 border border-slate-800">
                        <div className="text-[10px] text-slate-500 font-bold uppercase">{r.label}</div>
                        <div className="text-sm font-semibold text-slate-300">{r.val}%</div>
                    </div>
                ))}
            </div>
        </div>

        {/* Hype & Reputation Bars */}
        <div className="grid grid-cols-1 gap-4">
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5">
                <div className="flex justify-between items-end mb-3">
                    <h4 className="font-bold text-white">Hype</h4>
                    <div className="text-sm font-black text-amber-400">{artist.hype} / 100</div>
                </div>
                <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div 
                        className="h-full bg-amber-400 transition-all duration-1000"
                        style={{ width: `${artist.hype}%` }}
                    ></div>
                </div>
            </div>

            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5">
                <div className="flex justify-between items-end mb-3">
                    <h4 className="font-bold text-white">Reputation</h4>
                    <div className="text-sm font-black text-blue-400">{artist.reputation} / 100</div>
                </div>
                <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div 
                        className="h-full bg-blue-500 transition-all duration-1000"
                        style={{ width: `${artist.reputation}%` }}
                    ></div>
                </div>
            </div>
        </div>

      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 w-full bg-slate-900 border-t border-slate-800 pb-safe">
        <div className="flex justify-around items-center h-16 max-w-lg mx-auto px-4">
          <button className="flex flex-col items-center justify-center w-full h-full text-indigo-400">
            <Home size={20} className="mb-1" />
            <span className="text-[10px] font-bold">Home</span>
          </button>
          <button className="flex flex-col items-center justify-center w-full h-full text-slate-500 hover:text-slate-300 transition-colors">
            <Music size={20} className="mb-1" />
            <span className="text-[10px] font-bold">Studio</span>
          </button>
          <button className="flex flex-col items-center justify-center w-full h-full text-slate-500 hover:text-slate-300 transition-colors">
            <UserIcon size={20} className="mb-1" />
            <span className="text-[10px] font-bold">Profile</span>
          </button>
        </div>
      </nav>

    </div>
  );
}
