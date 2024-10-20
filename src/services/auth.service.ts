import User from '../models/user.model';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AuthDTO, AuthLoginDTO } from '../dto/auth.dto';
import { AuthResponse } from '../interfaces/responses/auth-response.interface';
import * as authValidator from '../validators/auth.validator';
import { StatusCodes } from 'http-status-codes';
import { redisClient } from '../config/redis.config';

class AuthService {
  
  async signUp(authDTO: AuthDTO): Promise<AuthResponse> {
    try {
      const validatorError = await authValidator.createUser(authDTO);

      if (validatorError) {
        return {
          status: 'error',
          message: validatorError,
          statusCode: StatusCodes.UNPROCESSABLE_ENTITY,
        };
      }

      const userExist = await User.findOne({ email: authDTO.email }).catch(
        (err) => {
          console.log('Error: ', err);
        }
      );
      if (userExist) {
        return {
          status: 'error',
          message: 'User already exists in the database',
          statusCode: StatusCodes.CONFLICT,
        };
      }

      const hashedPassword = await bcrypt.hash(authDTO.password, 10);
      const newUser = new User({
        firstName: authDTO.firstName,
        lastName: authDTO.lastName,
        email: authDTO.email,
        password: hashedPassword,
        role: authDTO.role,
      });

      await newUser.save();

      return {
        status: 'success',
        statusCode: StatusCodes.CREATED,
        message: 'User registered successfully',
      };
    } catch (e) {
      console.log('An unknown error has occurred. Please try again later: ' + e);
      return {
        status: 'error',
        message: 'Registration failed',
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      };
    }
  }

  async login(authLoginData: AuthLoginDTO): Promise<AuthResponse> {
    try {
      const validatorError = await authValidator.loginUser(authLoginData);
      if (validatorError) {
        return {
          status: 'error',
          message: validatorError,
          statusCode: StatusCodes.OK,
        };
      }

      const user = await User.findOne({ email: authLoginData.email });
      if (!user || !(await bcrypt.compare(authLoginData.password, user.password))) {
        return {
          status: 'error',
          message: 'Invalid credentials',
          statusCode: StatusCodes.BAD_REQUEST,
        };
      }

      const token = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET!,
        { expiresIn: '1h' }
      );

      redisClient.set(`session:${user._id}`, token, { EX: 3600 });

      return {
        status: 'success',
        token,
      };
    } catch (e) {
      console.log('An unknown error has occurred. Please try again later: ' + e);
      return {
        status: 'error',
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      };
    }
  }

  async validateToken(token: string): Promise<AuthResponse> {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string; role: 'admin' | 'user' };
      const user = await User.findById(decoded.userId);
  
      if (!user) {
        return {
          status: 'error',
          statusCode: StatusCodes.UNAUTHORIZED,
          message: 'User not found',
        };
      }
  
      return {
        status: 'success',
        statusCode: StatusCodes.OK,
        data: {
          userId: user._id,
          role: user.role as 'admin' | 'user', 
        },
        role: user.role as 'admin' | 'user', 
      };
    } catch (e) {
      console.error('An error occurred during token validation: ', e);
      return {
        status: 'error',
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        message: 'An unknown error has occurred. Please try again later.',
      };
    }
  }
  
}

export default new AuthService();
