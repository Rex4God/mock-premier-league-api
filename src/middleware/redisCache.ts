import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';
import { redisClient } from '../config/redis.config';
import { parse } from 'url';
import querystring from 'querystring';

const normalizeKey = (keyPrefix: string, req: Request) => {
  const parsedUrl = parse(req.originalUrl, true);
  const queryParams = parsedUrl.query;
  const normalizedQuery = querystring.stringify(
    Object.keys(queryParams)
      .sort() 
      .reduce((acc: any, key: string) => {
        acc[key.toLowerCase()] = queryParams[key]; 
        return acc;
      }, {})
  );
  return `${keyPrefix}:${parsedUrl.pathname}?${normalizedQuery}`;
};

export const cacheMiddleware = (keyPrefix: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const key = normalizeKey(keyPrefix, req);
    try {
      const cacheData = await redisClient.get(key);
      if (cacheData) {
        logger.info(`Cache hit for key: ${key}`);
        return res.json(JSON.parse(cacheData));
      }
      logger.info(`Cache miss for key: ${key}`);
      res.locals.cacheKey = key; 
      next();
    } catch (error) {
      logger.error(`Error fetching cache data for key ${key}:`);
      next();
    }
  };
};


export const cacheResponse = (expiration: number) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const originalSend = res.send.bind(res);

    res.send = (body: any) => {
      if (res.locals.cacheKey) { 
        const responseBody = typeof body === 'string' ? body : JSON.stringify(body);
        redisClient
          .set(res.locals.cacheKey, responseBody, { EX: expiration })
          .then(() => {
            logger.info(`Cache set for key: ${res.locals.cacheKey} with expiration: ${expiration} seconds`);
          })
          .catch((error) => {
            logger.error(`Error setting cache data for key ${res.locals.cacheKey}: ${error.message}`);
          });
      }
      return originalSend(body);
    };

    next();
  };
};
