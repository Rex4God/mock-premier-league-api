import Joi from 'joi';
import { validate } from '../utils/helpers';
import { STATUS } from '../utils/constant';

interface FixtureBody {
  homeTeam: string;
  awayTeam: string;
  date: Date;
  status: 'pending' | 'completed';
  score: { home: number; away: number };
  uniqueLink: string;
}

export const createFixture = async (body: FixtureBody) => {

  const schema = Joi.object({
    homeTeam: Joi.string().min(2).max(50).required().messages({
      'string.empty': 'Home team is required',
      'string.min': 'Home team name must be at least 2 characters long',
      'string.max': 'Home team name cannot exceed 50 characters',
    }),
    awayTeam: Joi.string().min(2).max(50).required().messages({
      'string.empty': 'Away team is required',
      'string.min': 'Away team name must be at least 2 characters long',
      'string.max': 'Away team name cannot exceed 50 characters',
    }),
    date: Joi.date().greater('now').required().messages({
      'date.base': 'Please provide a valid date',
      'date.greater': 'The date must be in the future',
      'any.required': 'Date is required',
    }),
    status:Joi.string().valid('pending', 'completed').default('pending').messages({
      'any.only': 'status must be either "pending" or "completed"',
      'string.empty': 'status is required',
    }),
    score:Joi.object({
      home: Joi.number().integer().min(0).required().messages({
        'number.base': 'Home score must be a valid number',
        'number.min': 'Home score cannot be less than 0',
      }),
      away: Joi.number().integer().min(0).required().messages({
        'number.base': 'Away score must be a valid number',
        'number.min': 'Away score cannot be less than 0',
      }),
    }),
    uniqueLink: Joi.string().uri().messages({
      'string.uri': 'Unique link must be a valid URL',
    }),
  })

    return validate(schema, body);
};

export const updateFixture = async (body: Partial<FixtureBody>) => {
  const schema = Joi.object({
    homeTeam: Joi.string().min(2).max(50).messages({
      'string.min': 'Home team name must be at least 2 characters long',
      'string.max': 'Home team name cannot exceed 50 characters',
    }),
    awayTeam: Joi.string().min(2).max(50).messages({
      'string.min': 'Away team name must be at least 2 characters long',
      'string.max': 'Away team name cannot exceed 50 characters',
    }),
    date: Joi.date().greater('now').messages({
      'date.base': 'Please provide a valid date',
      'date.greater': 'The date must be in the future',
    }),
    status: Joi.string().valid(STATUS.PENDING, STATUS.COMPLETED).messages({
      'any.only': 'status must be either "pending" or "completed"',
    }),
    score: Joi.object({
      home: Joi.number().integer().min(0).messages({
        'number.base': 'Home score must be a valid number',
        'number.min': 'Home score cannot be less than 0',
      }),
      away: Joi.number().integer().min(0).messages({
        'number.base': 'Away score must be a valid number',
        'number.min': 'Away score cannot be less than 0',
      }),
    })
      .optional()
      .messages({
        'object.base': 'Score must be an object with home and away properties',
      }),
    uniqueLink: Joi.string().uri().messages({
      'string.uri': 'Unique link must be a valid URL',
    }),
  }).min(1);

  return validate(schema, body);
};
