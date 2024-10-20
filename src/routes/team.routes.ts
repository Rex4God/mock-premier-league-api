import { Router } from 'express';
import * as teamController from '../controller/team.controller';
import authMiddleware from '../middleware/auth.middleware';


const router = Router();

router.post(
  '/create-teams',
  authMiddleware(['admin']),
  teamController.createTeam
);

router.get(
  '/views',
  authMiddleware(['admin', 'user']),
  teamController.viewTeams
);

router.put(
  '/:teamId',
  authMiddleware(['admin']),
  teamController.updateTeam
);

router.delete(
  '/:teamId',
  authMiddleware(['admin']),
  teamController.deleteTeam
);

router.get(
  '/search/teams', 
teamController.searchTeams
);

export default router;
