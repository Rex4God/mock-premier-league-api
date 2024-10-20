import Joi from 'joi';
import { validate } from '../utils/helpers';
import { Types } from 'mongoose';

interface TeamBody {
  teamName: string;
  stadium: string;
  createdBy: string | Types.ObjectId;
  createdOn: Date;
  modifiedBy?: string | Types.ObjectId;
  modifiedOn?: Date;
}

const objectIdValidation = (value: any, helpers: any) => {
  if (Types.ObjectId.isValid(value)) {
    return value;
  }
  return helpers.message('Invalid ObjectId');
};

export const createTeam = async (body: TeamBody) => {
  const schema = Joi.object({
    teamName: Joi.string().min(2).max(50).required().messages({
      'string.empty': 'Team name is required',
      'string.min': 'Team name must be at least 2 characters long',
      'string.max': 'Team name cannot exceed 50 characters',
    }),
    stadium: Joi.string().min(2).max(100).required().messages({
      'string.empty': 'Stadium is required',
      'string.min': 'Stadium name must be at least 2 characters long',
      'string.max': 'Stadium name cannot exceed 100 characters',
    }),
    createdBy: Joi.alternatives()
      .try(Joi.string(), Joi.custom(objectIdValidation))
      .required()
      .messages({
        'any.required': 'Created by is required',
        'string.empty': 'Created by is required',
      }),
    createdOn: Joi.date().required().messages({
      'date.base': 'Please provide a valid date for creation',
      'any.required': 'Creation date is required',
    }),
  });

  return validate(schema, body);
};

export const updateTeam = async (body: Partial<TeamBody>) => {
  const schema = Joi.object({
    teamName: Joi.string().min(2).max(50).messages({
      'string.min': 'Team name must be at least 2 characters long',
      'string.max': 'Team name cannot exceed 50 characters',
    }),
    stadium: Joi.string().min(2).max(100).messages({
      'string.min': 'Stadium name must be at least 2 characters long',
      'string.max': 'Stadium name cannot exceed 100 characters',
    }),
    modifiedBy: Joi.alternatives()
      .try(Joi.string(), Joi.custom(objectIdValidation))
      .messages({
        'string.empty': 'Modified by cannot be empty',
      }),
    modifiedOn: Joi.date().messages({
      'date.base': 'Please provide a valid date for modification',
    }),
  })
    .min(1);

  return validate(schema, body);
};
