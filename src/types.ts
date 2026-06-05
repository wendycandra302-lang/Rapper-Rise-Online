export type Genre = 'Pop' | 'Rap' | 'Country' | 'Kpop';
export type Region = 'Asia' | 'Europe' | 'America' | 'Africa';

export interface Artist {
  id: string;
  user_id: string;
  name: string;
  genre: Genre;
  region: Region;
  image_url: string;
  budget: number;
  money: number;
  dob: string; // ISO date string or separate dd/mm/yyyy
  created_at: string;
  
  // Stats
  pop_asia: number;
  pop_europe: number;
  pop_america: number;
  pop_africa: number;
  
  hype: number;
  reputation: number;
}
