import Joi, { ObjectSchema } from 'joi';
import { isEmpty as lodashIsEmpty } from 'lodash';
import dayjs from 'dayjs';

const dataToBeRemovedArray = ["", null, undefined];

/**
 * @param {object | any[]} value
 * @returns {object | any[]}
 */
export function removeFieldsWithEmptyValue(value: any): any {
  const objectTobeWorkingOn = { ...value };

  if (typeof value !== 'object' || value === null) return value;

  for (const key in objectTobeWorkingOn) {
    if (dataToBeRemovedArray.includes(objectTobeWorkingOn[key])) {
      delete objectTobeWorkingOn[key];
      continue;
    }

    if (Array.isArray(objectTobeWorkingOn[key])) {
      objectTobeWorkingOn[key] = objectTobeWorkingOn[key].map(removeFieldsWithEmptyValue);
      continue;
    }

    if (typeof objectTobeWorkingOn[key] === 'object') {
      objectTobeWorkingOn[key] = removeFieldsWithEmptyValue(objectTobeWorkingOn[key]);
    }
  }

  return objectTobeWorkingOn;
}

export const isEmpty = lodashIsEmpty;

/**
 * Validates a payload based on a Joi schema
 * 
 * @param {ObjectSchema} schema - The Joi validation schema
 * @param {object} payload - The object to validate
 * @returns {string | null} - Returns the error message or null if no error
 */
export const validate = (schema: ObjectSchema, payload: object): string | null => {
  const { error } = schema.validate(payload, {
    allowUnknown: true,
  });

  if (error) {
    return error.details[0].message.replace(/['"]/g, '');
  }

  return null;
};

/**
 * Resolves request query to a MongoDB query object
 * 
 * @param {object} requestQuery - The query parameters from a request
 * @returns {{filter: object, limit: number, page: number, sort: object}}
 */
export const resolveRequestQueryToMongoDBQuery = (requestQuery: any) => {
  const response = {
    page: 1,
    limit: 50,
    filter: {} as Record<string, any>,
    sort: { _id: -1 } as Record<string, any>,
  };

  for (const key in requestQuery) {
    if (!requestQuery.hasOwnProperty(key)) {
      continue;
    }

    if (key === 'page') {
      response.page = parseInt(requestQuery[key]);
      continue;
    }

    if (key === 'limit') {
      response.limit = parseInt(requestQuery[key]);
      continue;
    }

    if (key === 'sort') {
      const [sortKey, sortValue] = requestQuery[key].split(',');
      response.sort = { [sortKey]: sortValue || -1 };
      continue;
    }

    if (key === 'dateFrom') {
      response.filter.createdAt = {
        $gte: dayjs(requestQuery[key] || new Date(), 'DD-MM-YYYY')
          .startOf('day')
          .unix(),
      };
    }

    if (key === 'dateTo') {
      response.filter.createdAt = {
        $lte: dayjs(requestQuery[key] || new Date(), 'DD-MM-YYYY')
          .endOf('day')
          .unix(),
      };
    }

    if (key.endsWith('From') && key !== 'dateFrom') {
      const field = response.filter[key.replace(/From/i, '')] || {};
      field['$gte'] = dayjs(requestQuery[key] || new Date(), 'YYYY-MM-DD')
        .startOf('day').unix();
      response.filter[key.replace(/From/i, '')] = field;
      delete requestQuery[`${key}`];
    }

    if (key.endsWith('To') && key !== 'dateTo') {
      const field = response.filter[key.replace(/To/i, '')] || {};
      field['$lte'] = dayjs(requestQuery[key] || new Date(), 'YYYY-MM-DD')
        .startOf('day').unix();
      response.filter[key.replace(/To/i, '')] = field;
      delete requestQuery[`${key}`];
    }

    if (key === 'q') {
      response.filter.$text = {
        $search: requestQuery[key],
        $caseSensitive: false,
      };

      continue;
    }

    if (requestQuery[key]) response.filter[key] = requestQuery[key];
  }

  return response;
};
