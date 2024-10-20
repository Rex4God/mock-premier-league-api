import { Request, Response } from 'express';
import { CreateFixtureDTO } from '../dto/create-fixture.dto';
import { UpdateFixtureDTO } from '../dto/update-fixture.dto';
import fixtureService from '../services/fixture.service';

export const createFixture = async (req: Request, res: Response) => {

  const { homeTeam, awayTeam, date, status, score, uniqueLink } = req.body;
  const fixtureData = new CreateFixtureDTO(
    homeTeam,
    awayTeam,
    date,
    status,
    score,
    uniqueLink
  );

  const response = await fixtureService.createFixture(fixtureData);
  res.status(response.status === 'success' ? 201 : 500).json(response);
};

export const viewAllFixtures = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string, 10) || 1;
  const limit = parseInt(req.query.limit as string, 10) || 10;

  const response = await fixtureService.viewAllFixtures(page, limit);

  res.status(response.statusCode).json(response);
};

export const updateFixture = async (req: Request, res: Response) => {

  const { homeTeam, awayTeam, date, status, score, uniqueLink } = req.body;
  const fixtureData = new UpdateFixtureDTO(
    homeTeam,
    awayTeam,
    date,
    status,
    score,
    uniqueLink
  );

  const response = await fixtureService.updateFixture(
    req.params.fixtureId,
    fixtureData
  );
  res.status(201).json(response);
};

export const viewFixtures = async (req: Request, res: Response) => {
  const fixtures = await fixtureService.viewFixtures(
    req.query.status as 'pending' | 'completed'
  );
  res.json(fixtures);
};

export const deleteFixture = async (req: Request, res: Response) => {
  const response = await fixtureService.deleteFixture(req.params.fixtureId);
  res.status(200).json(response);
};

export const searchFixtures = async (req: Request, res: Response) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ message: 'Query parameter is required' });
  }
  const fixtures = await fixtureService.searchFixtures(query as string);
  res.json(fixtures);
};

