import Fixture from '../models/fixture.model';
import { CreateFixtureDTO } from '../dto/create-fixture.dto';
import { UpdateFixtureDTO } from '../dto/update-fixture.dto';
import { FixtureResponse } from '../interfaces/responses/fixture-response.interface';
import * as fixtureValidator from '../validators/fixture.validator';
import { StatusCodes } from 'http-status-codes';
import { generateUniqueLink } from '../utils/generateUniqueLink';
import {redisClient} from '../config/redis.config'

class FixtureService {
  async createFixture(data: CreateFixtureDTO): Promise<FixtureResponse> {
    try {
      const validatorError = await fixtureValidator.createFixture(data);

      if (validatorError) {
        return {
          status: 'error',
          message: validatorError,
          statusCode: StatusCodes.UNPROCESSABLE_ENTITY,
        };
      }
      const uniqueLink = generateUniqueLink();

      const fixture = new Fixture({
        homeTeam: data.homeTeam,
        awayTeam: data.awayTeam,
        date: data.date,
        status: data.status,
        score: data.score,
        uniqueLink: uniqueLink,
      });
      const savedFixture = await fixture.save();
      return {
        status: 'success',
        data: savedFixture,
        statusCode: StatusCodes.CREATED,
      };
    } catch (e) {
      console.log('An unknown error has occurred. Please try again later' + e);
      return {
        status: 'error',
        data: null,
        message: 'Failed to create fixture',
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      };
    }
  }

  async viewAllFixtures(page: number = 1, limit: number = 50)
  : Promise<FixtureResponse> {
    try {
      const skip = (page - 1) * limit;
  
      const cachedData = await redisClient.get('view-fixtures');
      
      if (cachedData) {
        const parsedCacheData = JSON.parse(cachedData);

        return {
          status: 'success',
          currentPage: page,
          totalPages: Math.ceil(parsedCacheData.totalFixtures / limit),
          totalFixtures: parsedCacheData.totalFixtures,
          paginateData: parsedCacheData.fixtures,
          statusCode: StatusCodes.OK,
        };
      }
  
      const fixtures = await Fixture.find({}).skip(skip).limit(limit);
  
      
      const totalFixtures = await Fixture.countDocuments();
  
      const cacheData = { totalFixtures, fixtures };
      await redisClient.set('view-fixtures', JSON.stringify(cacheData), {EX: 3600});
  
      return {
        status: 'success',
        currentPage: page,
        totalPages: Math.ceil(totalFixtures / limit),
        totalFixtures,
        paginateData: fixtures,
        statusCode: StatusCodes.OK,
      };
    } catch (e) {
      console.error('An unknown error has occurred. Please try again later: '+ e);
      return {
        status: 'error',
        data: null,
        message: 'Failed to fetch fixtures',
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      };
    }
  }
  
  async updateFixture(fixtureId: string, data: UpdateFixtureDTO)
  : Promise<FixtureResponse> {
    try {
      const validatorError = await fixtureValidator.updateFixture(data);
      if (validatorError) {
        return {
          status: 'error',
          message: validatorError,
          statusCode: StatusCodes.UNPROCESSABLE_ENTITY,
        };
      }

      const existingFixture = await Fixture.findById(fixtureId);

      if (!existingFixture) {
        return {
          status: 'error',
          message: 'Fixture not found',
          statusCode: StatusCodes.NOT_FOUND,
        };
      }

      const updatedFixture = await Fixture.findByIdAndUpdate(fixtureId, data, {
        new: true,
      });

      return {
        status: 'success',
        data: updatedFixture,
        statusCode: StatusCodes.OK,
      };
    } catch (e) {
      console.error('An unknown error has occurred: ', e);
      return {
        status: 'error',
        data: null,
        message: 'Failed to update fixture',
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      };
    }
  }

  async viewFixtures(status?: 'pending' | 'completed'):
   Promise<FixtureResponse> {
    try {
      const cacheKey = status ? `view-fixtures:${status}` : 'view-fixtures:all';
  
      const cachedData = await redisClient.get(cacheKey);
      
      if (cachedData) {
        const parsedCacheData = JSON.parse(cachedData);
        return {
          status: 'success',
          data: parsedCacheData,
          message: 'Fixtures retrieved successfully (from cache)',
          statusCode: StatusCodes.OK,
        };
      }
  
      const query = status ? { status } : {};

      const fixtures = await Fixture.find(query);
  
      await redisClient.set(cacheKey, JSON.stringify(fixtures), {EX: 3600});
  
      return {
        status: 'success',
        data: fixtures,
        message: 'Fixtures retrieved successfully',
        statusCode: StatusCodes.OK,
      };
    } catch (e) {
      console.error('An error occurred while fetching fixtures: ' + e);
      return {
        status: 'error',
        data: null,
        message: 'Failed to retrieve fixtures',
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      };
    }
  }
  

  async deleteFixture(fixtureId: string): Promise<FixtureResponse> {
    try {
      const fixture = await Fixture.findOne({ _id: fixtureId });
      if (!fixture) {
        return {
          status: 'error',
          message: "Fixture not found. Hence it can't be deleted",
          statusCode: StatusCodes.NOT_FOUND,
        };
      }
      await Fixture.deleteOne({ _id: fixtureId });

      return {
        status: 'success',
        data: fixture,
        statusCode: StatusCodes.OK,
      };
    } catch (e) {
      console.log('An unknown error has occurred. Please try again later' + e);
      return {
        status: 'error',
        data: null,
        message: 'Failed to delete fixture',
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      };
    }
  }

  async searchFixtures(query: string): Promise<FixtureResponse> {
    try {
      const cacheKey = `search-fixtures:${query}`;
      
      const cachedData = await redisClient.get(cacheKey);
      
      if (cachedData) {
        const parsedCacheData = JSON.parse(cachedData);
        return {
          status: 'success',
          data: parsedCacheData,
          message: 'Fixtures retrieved successfully (from cache)',
          statusCode: StatusCodes.OK,
        };
      }
  
      const regex = new RegExp(query, 'i');
      const fixtures = await Fixture.find({
        $or: [{ homeTeam: regex }, { awayTeam: regex }, { status: regex }],
      });
  
      await redisClient.set(cacheKey, JSON.stringify(fixtures), {EX: 3600});
  
      return {
        status: 'success',
        data: fixtures,
        message: 'Fixtures retrieved successfully',
        statusCode: StatusCodes.OK,
      };
    } catch (e) {
      console.error('An error occurred while searching for fixtures: ' + e);
      return {
        status: 'error',
        data: null,
        message: 'Failed to retrieve fixtures',
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      };
    }
  }
  
}

export default new FixtureService();
