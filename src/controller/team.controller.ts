import { Request, Response } from 'express';
import { CreateTeamDTO } from '../dto/create-team.dto';
import { UpdateTeamDTO } from '../dto/update-team.dto';
import teamService from '../services/team.service';


export const createTeam = async (req: Request, res: Response) => {
  const { teamName, stadium, createdBy, createdOn } = req.body;
  const teamData = new CreateTeamDTO(teamName, stadium, createdBy, createdOn);

  const response = await teamService.createTeam(teamData);
  res.status(response.status === 'success' ? 201 : 500).json(response);
};

export const viewTeams = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string, 10) || 1;
  const limit = parseInt(req.query.limit as string, 10) || 10;

  const response = await teamService.viewTeams(page, limit);

  res.status(response.statusCode).json(response);
};

export const updateTeam = async (req: Request, res: Response) => {
  const { teamName, stadium, modifiedBy, modifiedOn } = req.body;
  const fixtureData = new UpdateTeamDTO(
  teamName,
  stadium,
  modifiedBy,
  modifiedOn
  );

  const response = await teamService.updateTeam(
    req.params.teamId,
    fixtureData
  );
  res.status(200).json(response);
};

export const deleteTeam = async (req: Request, res: Response) => {
  const response = await teamService.deleteTeam(req.params.teamId);
  res.status(200).json(response);
};

export const searchTeams = async (req: Request, res: Response) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ message: 'Query parameter is required' });
  }
  const teams = await teamService.searchTeams(query as string);
  res.json(teams);
};
