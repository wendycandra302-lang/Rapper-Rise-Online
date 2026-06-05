import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Genre, Region } from '../types';
import { UploadCloud } from 'lucide-react';

const GENRES: Genre[] = ['Pop', 'Rap', 'Country', 'Kpop'];
const REGIONS: Region[] = ['Asia', 'Europe', 'America', 'Africa'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function CreateArtist() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [genre, setGenre] = useState<Genre>('Rap');
  const [region, setRegion] = useState<Region>('America');
  const [budget, setBudget] = useState<number>(1000);
  
  const [day, setDay] = useState('1');
  const [month, setMonth] = useState('1');
  const [year, setYear] = useState('2000');
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setError(null);
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${user?.id}/${fileName}`;

    const { error: uploadError, data } = await supabase.storage
      .from('artists_images')
      .upload(filePath, file);

    if (uploadError) {
      // Fallback or throw
      console.warn("Storage upload failed, relying on UI prompt for users to setup bucket.", uploadError);
      throw new Error("Failed to upload image. Make sure 'artists_images' public bucket exists in Supabase.");
    }

    const { data: publicUrlData } = supabase.storage
      .from('artists_images')
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!imageFile) {
        setError("Please upload an artist image.");
        return;
    }
    if (!name.trim()) {
        setError("Artist name is required.");
        return;
    }
    
    setLoading(true);
    setError(null);

    try {
      // 1. Upload image
      let imageUrl = '';
      try {
        imageUrl = await uploadImage(imageFile);
      } catch (err: any) {
        // If bucket is not setup, we gracefully inform the user
        setError(err.message);
        setLoading(false);
        return;
      }

      // 2. Format DOB
      const dob = new Date(parseInt(year), parseInt(month) - 1, parseInt(day)).toISOString();

      // 3. Insert into Supabase
      const { error: insertError } = await supabase
        .from('artists')
        .insert([
          {
            user_id: user.id,
            name,
            genre,
            region,
            budget,
            money: budget, // initial money is same as budget
            dob,
            image_url: imageUrl,
            pop_asia: 0,
            pop_europe: 0,
            pop_america: 0,
            pop_africa: 0,
            hype: 0,
            reputation: 0,
          }
        ]);

      if (insertError) {
        throw insertError;
      }

      navigate('/dashboard');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to create artist. Did you run the SQL schema?');
    } finally {
      setLoading(false);
    }
  };

  const daysInMonth = new Date(parseInt(year), parseInt(month), 0).getDate();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 flex justify-center">
      <div className="w-full max-w-2xl bg-slate-900 rounded-2xl border border-slate-800 p-8 shadow-2xl">
        <h1 className="text-3xl font-black text-white mb-2 uppercase tracking-tight">Create Artist</h1>
        <p className="text-slate-400 mb-8 border-b border-slate-800 pb-4">Define your persona and start your journey to the top.</p>

        {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl mb-6">
                {error}
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Artist Photo</label>
            <div className="flex items-center gap-6">
              <div 
                className="w-32 h-32 rounded-2xl bg-slate-800 border-2 border-dashed border-slate-600 flex items-center justify-center overflow-hidden relative group cursor-pointer"
                onClick={() => document.getElementById('image-upload')?.click()}
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <UploadCloud className="text-slate-500 group-hover:text-indigo-400 transition-colors" size={32} />
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-xs font-bold text-white">UPLOAD</span>
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm text-slate-400 mb-2">Upload a square image (JPG, PNG). This will represent you on the leaderboards.</p>
                <input 
                    id="image-upload" 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageChange} 
                    className="hidden" 
                />
                <button
                    type="button"
                    onClick={() => document.getElementById('image-upload')?.click()}
                    className="bg-slate-800 hover:bg-slate-700 text-sm font-medium py-2 px-4 rounded-lg transition-colors border border-slate-700"
                >
                    Choose File
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Stage Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
                  placeholder="e.g. Lil Thunder"
                  required
                />
              </div>

              {/* Genre */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Music Genre</label>
                <select 
                  value={genre}
                  onChange={(e) => setGenre(e.target.value as Genre)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium appearance-none"
                >
                  {GENRES.map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              {/* Region */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Origin Region</label>
                <select 
                  value={region}
                  onChange={(e) => setRegion(e.target.value as Region)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium appearance-none"
                >
                  {REGIONS.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              {/* Budget */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Initial Budget ($)</label>
                <select 
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium appearance-none"
                >
                  <option value={500}>$500 (Hard Mode)</option>
                  <option value={1000}>$1,000 (Standard)</option>
                  <option value={5000}>$5,000 (Easy Mode)</option>
                  <option value={10000}>$10,000 (Nepo Baby)</option>
                </select>
              </div>
          </div>

          {/* DOB */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Date of Birth</label>
            <div className="grid grid-cols-3 gap-4">
                <select 
                    value={day} 
                    onChange={(e) => setDay(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium appearance-none"
                >
                    {Array.from({length: daysInMonth}, (_, i) => i + 1).map(d => (
                        <option key={d} value={d}>{d}</option>
                    ))}
                </select>
                <select 
                    value={month} 
                    onChange={(e) => setMonth(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium appearance-none"
                >
                    {MONTHS.map((m, i) => (
                        <option key={m} value={i + 1}>{m}</option>
                    ))}
                </select>
                <select 
                    value={year} 
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium appearance-none"
                >
                    {Array.from({length: 50}, (_, i) => new Date().getFullYear() - 16 - i).map(y => (
                        <option key={y} value={y}>{y}</option>
                    ))}
                </select>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full mt-8 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-lg py-4 rounded-xl shadow-[0_0_20px_-5px_rgba(79,70,229,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'INITIALIZING CAREER...' : 'CREATE ARTIST'}
          </button>

        </form>
      </div>
    </div>
  );
}
