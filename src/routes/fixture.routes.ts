import { Router } from 'express';
import * as fixtureController from '../controller/fixture.controller';
import authMiddleware from '../middleware/auth.middleware';


const router = Router();

router.post(
  '/create-fixtures',
  authMiddleware(['admin']),
  fixtureController.createFixture
);

router.get(
  '/fixtures',
  authMiddleware(['admin', 'user']),
  fixtureController.viewAllFixtures
);

router.put(
  '/:fixtureId',
  authMiddleware(['admin']),
  fixtureController.updateFixture
);

router.get(
  '/view-fixtures',
  authMiddleware(['admin', 'user']),
  fixtureController.viewFixtures                 
);

router.delete(
  '/:fixtureId',
  authMiddleware(['admin']),
  fixtureController.deleteFixture
);

router.get(
  '/search/fixtures', 
  fixtureController.searchFixtures              
);

export default router;
