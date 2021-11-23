import { Router } from 'express';
import { body, query } from 'express-validator';
import apicache from 'apicache';
import healthController from '../controllers/healthController';
import authController from '../controllers/authController';
import handleValidations from '../middleware/handleValidations';
import handleErrors from '../middleware/handleErrors';
import authenticated from '../middleware/authenticated';
import featureController from '../controllers/featureController';

const initRoutes = (): Router => {
  const router = Router();

  router.get('/health', apicache.middleware('1 minute'), healthController.handleHealthCheck);
  router.post('/register', [
    body('name.first').notEmpty().isString(),
    body('name.middle').optional().isString(),
    body('name.last').notEmpty().isString(),
    body('email').notEmpty().isEmail(),
    body('password').notEmpty().isString().isLength({ min: 7 }),
    handleValidations,
    authController.handleRegister,
    handleErrors,
  ]);
  router.post('/login', [
    body('email').notEmpty().isEmail(),
    body('password').notEmpty().isString().isLength({ min: 7 }),
    handleValidations,
    authController.handleLogin,
    handleErrors,
  ]);
  router.get('/logout', authController.handleLogout);
  router.post('/team', [
    authenticated,
    body('slug').notEmpty().isString(),
    body('name').notEmpty().isString(),
    handleValidations,
    featureController.handleCreateTeam,
    handleErrors,
  ])
  router.get('/team', [
    authenticated,
    query('slug').notEmpty().isString(),
    handleValidations,
    featureController.handleGetTeam,
    handleErrors,
  ]);
  router.get('/teams', [
    authenticated,
    featureController.handleGetUserTeams,
  ]);
  router.post('/delete-team', [
    authenticated,
    body('slug').notEmpty().isString(),
    handleValidations,
    featureController.handleDeleteTeam,
    handleErrors,
  ]);

  return router;
}

export {
  initRoutes,
};
