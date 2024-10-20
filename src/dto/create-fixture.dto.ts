
export class CreateFixtureDTO {
  homeTeam: string;
  awayTeam: string;
  date: Date;
  status: 'pending' | 'completed';
  score: { 
    home: number; 
    away: number
   };
  uniqueLink: string;

  constructor(
    homeTeam: string,
    awayTeam: string,
    date: Date,
    status: 'pending' | 'completed',
    score: { home: number; away: number },
    uniqueLink: string,
  ) {
    this.homeTeam = homeTeam;
    this.awayTeam = awayTeam;
    this.date = date;
    this.status = status;
    this.score = score;
    this.uniqueLink = uniqueLink;
  }
}
