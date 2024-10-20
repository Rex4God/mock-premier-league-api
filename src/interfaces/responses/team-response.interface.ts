import { ITeam } from '../team.interface';

export interface TeamResponse {
  status: 'success' | 'error';  
  data?: ITeam | ITeam[] | null; 
  message?: string;  
  statusCode?: any | 200;
  error?: any;
  paginateData?: any;
  currentPage?: number;
  totalPages?: number
  totalTeams?: any
  cachedData?: any
  
}
