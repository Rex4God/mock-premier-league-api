import { Request, Response } from 'express';
import { AuthDTO, AuthLoginDTO} from '../dto/auth.dto';
import  authService  from '../services/auth.service';


export const signUp = async (req: Request, res: Response) => {
  const { firstName, lastName, email, password, role} = req.body;
  const authData = new AuthDTO(firstName, lastName, email, password, role);

  const response = await authService.signUp(authData);
  res.status(response.status === 'success' ? 201 : 500).json(response);
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const authLoginData = new AuthLoginDTO(email, password);

  const response = await authService.login(authLoginData);
  res.status(response.status === 'success' ? 200 : 400).json(response);
};
