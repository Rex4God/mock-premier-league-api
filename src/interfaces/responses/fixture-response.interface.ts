import { IFixture } from '../fixture.interface';

export interface FixtureResponse {
  status: 'success' | 'error';  
  data?: IFixture | IFixture[] | null; 
  message?: string;  
  statusCode?: any | 200;
  error?: any;
  paginateData?: any;
  currentPage?: number;
  totalPages?: number
  totalFixtures?: any
  cachedData?: any
  
}
