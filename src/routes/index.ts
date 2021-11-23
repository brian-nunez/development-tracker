import { Router } from 'express';
import { body, query } from 'express-validator';
import apicache from 'apicache';
import healthController from '../controllers/healthController';
import authController from '../controllers/authController';
import handleValidations from '../middleware/handleValidations';
import handleErrors from '../middleware/handleErrors';
import authenticated from '../middleware/authenticated';
import teamController from '../controllers/teamController';

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
    teamController.handleCreateTeam,
    handleErrors,
  ])
  router.get('/team', [
    authenticated,
    query('slug').notEmpty().isString(),
    handleValidations,
    teamController.handleGetTeam,
    handleErrors,
  ]);
  router.get('/teams', [
    authenticated,
    teamController.handleGetUserTeams,
  ]);
  router.post('/delete-team', [
    authenticated,
    body('slug').notEmpty().isString(),
    handleValidations,
    teamController.handleDeleteTeam,
    handleErrors,
  ]);
  router.post('/change-team-owner', [
    authenticated,
    body('slug').notEmpty().isString(),
    body('targetUserId').notEmpty().isString(),
    handleValidations,
    teamController.handleOwnerChange,
    handleErrors,
  ]);
  router.post('/add-team-member', [
    authenticated,
    body('slug').notEmpty().isString(),
    body('userId').notEmpty().isString(),
    handleValidations,
    teamController.handleAddTeamMember,
    handleErrors,
  ])

  return router;
}

export {
  initRoutes,
};
