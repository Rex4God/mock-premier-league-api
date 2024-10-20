import Team from '../models/team.model';
import { CreateTeamDTO } from '../dto/create-team.dto';
import { UpdateTeamDTO } from '../dto/update-team.dto';
import { TeamResponse } from '../interfaces/responses/team-response.interface';
import * as teamValidator from '../validators/team.validator';
import { StatusCodes } from 'http-status-codes';
import {redisClient} from '../config/redis.config'


class TeamService {

    async createTeam(data: CreateTeamDTO): Promise<TeamResponse> {
      try {
        const validatorError = await teamValidator.createTeam(data);
  
        if (validatorError) {
          return {
            status: 'error',
            message: validatorError,
            statusCode: StatusCodes.UNPROCESSABLE_ENTITY,
          };
        }
        const team = new Team(data);
        const savedTeam = await team.save();
        return {
          status: 'success',
          data: savedTeam,
          statusCode: StatusCodes.CREATED,
        };
      } catch (e) {
        console.log('An unknown error has occurred. Please try again later' + e);
        return {
          status: 'error',
          data: null,
          message: 'Failed to create team',
          statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        };
      }
    }
  
    async viewTeams(page: number = 1, limit: number = 50): Promise<TeamResponse> {
      try {
        const skip = (page - 1) * limit;
    
        const cachedData = await redisClient.get('view-teams');
        
        if (cachedData) {
          const parsedCacheData = JSON.parse(cachedData);
          
          return {
            status: 'success',
            currentPage: page,
            totalPages: Math.ceil(parsedCacheData.totalTeams / limit),
            totalTeams: parsedCacheData.totalTeams,
            paginateData: parsedCacheData.teams,
            statusCode: StatusCodes.OK,
          };
        }

        const teams = await Team.find({}).skip(skip).limit(limit);
    
        const totalTeams = await Team.countDocuments();
    
        const cacheData = { totalTeams, teams };

        await redisClient.set('view-teams', JSON.stringify(cacheData), { EX: 3600 });
    
        return {
          status: 'success',
          currentPage: page,
          totalPages: Math.ceil(totalTeams / limit),
          totalTeams,
          paginateData: teams,
          statusCode: StatusCodes.OK,
        };
      } catch (e) {
        console.error('An unknown error has occurred. Please try again later: ', e);
        return {
          status: 'error',
          data: null,
          message: 'Failed to fetch teams',
          statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        };
      }
    }
    
  
    async updateTeam(teamId: string, data: UpdateTeamDTO)
    : Promise<TeamResponse> {
      try {
        const validatorError = await teamValidator.updateTeam(data);
        if (validatorError) {
          return {
            status: 'error',
            message: validatorError,
            statusCode: StatusCodes.UNPROCESSABLE_ENTITY,
          };
        }
  
        const existingTeam = await Team.findById(teamId);
  
        if (!existingTeam) {
          return {
            status: 'error',
            message: 'Team not found',
            statusCode: StatusCodes.NOT_FOUND,
          };
        }
  
        const updatedTeam = await Team.findByIdAndUpdate(teamId, data, {
          new: true,
        });
  
        return {
          status: 'success',
          data: updatedTeam,
          statusCode: StatusCodes.OK,
        };
      } catch (e) {
        console.error('An unknown error has occurred: ', e);
        return {
          status: 'error',
          data: null,
          message: 'Failed to update team',
          statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        };
      }
    }
  
    async deleteTeam(teamId: string): Promise<TeamResponse> {
      try {
        const team = await Team.findOne({ _id: teamId });
        if (!team) {
          return {
            status: 'error',
            message: "Team not found. Hence it can't be deleted",
            statusCode: StatusCodes.NOT_FOUND,
          };
        }
        await Team.deleteOne({ _id: teamId });
  
        return {
          status: 'success',
          data: team,
          statusCode: StatusCodes.OK,
        };
      } catch (e) {
        console.log('An unknown error has occurred. Please try again later' + e);
        return {
          status: 'error',
          data: null,
          message: 'Failed to delete team',
          statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        };
      };
    };
  
    async searchTeams(query: string): Promise<TeamResponse> {
      try {
        const cacheKey = `search-teams:${query}`;
        
        const cachedData = await redisClient.get(cacheKey);
        
        if (cachedData) {
          const parsedCacheData = JSON.parse(cachedData);
          return {
            status: 'success',
            data: parsedCacheData,
            message: 'Teams retrieved successfully (from cache)',
            statusCode: StatusCodes.OK,
          };
        }
    
        const regex = new RegExp(query, 'i');
        const teams = await Team.find({
          $or: [{ teamName: regex }, { stadium: regex }],
        });
    
        await redisClient.set(cacheKey, JSON.stringify(teams), {EX: 3600}); 
    
        return {
          status: 'success',
          data: teams,
          message: 'Teams retrieved successfully',
          statusCode: StatusCodes.OK,
        };
      } catch (e) {
        console.error('An error occurred while searching for teams: ' + e);
        return {
          status: 'error',
          data: null,
          message: 'Failed to retrieve teams',
          statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        };
      }
    }
    
    
  }
  
  export default new TeamService();
  