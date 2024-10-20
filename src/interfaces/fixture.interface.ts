import { Document } from 'mongoose';

export interface IFixture extends Document {
  homeTeam: string;
  awayTeam: string;
  date: Date;
  status: 'pending' | 'completed';
  score?: { home: number; away: number };
  uniqueLink: string;
}
