export interface AuthResponse {
  status: 'success' | 'error';
  token?: string;
  role?: 'admin' | 'user'; 
  message?: string;
  statusCode?: any;
  data?: any;

}
