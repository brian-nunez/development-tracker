import { Router } from 'express';
import { body, query } from 'express-validator';
import apicache from 'apicache';
import healthController from '../controllers/healthController';
import authController from '../controllers/authController';
import handleValidations from '../middleware/handleValidations';
import handleErrors from '../middleware/handleErrors';
import authenticated from '../middleware/authenticated';
import teamController from '../controllers/teamController';
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
  router.post('/team/delete', [
    authenticated,
    body('slug').notEmpty().isString(),
    handleValidations,
    teamController.handleDeleteTeam,
    handleErrors,
  ]);
  router.post('/team/change-owner', [
    authenticated,
    body('slug').notEmpty().isString(),
    body('targetUserId').notEmpty().isString(),
    handleValidations,
    teamController.handleOwnerChange,
    handleErrors,
  ]);
  router.post('/team/add-member', [
    authenticated,
    body('slug').notEmpty().isString(),
    body('userId').notEmpty().isString(),
    handleValidations,
    teamController.handleAddTeamMember,
    handleErrors,
  ]);
  router.post('/team/add-story', [
    authenticated,
    body('slug').notEmpty().isString(),
    body('name').notEmpty().isString(),
    handleValidations,
    teamController.handleAddStory,
    handleErrors,
  ]);
  router.post('/team/delete-story', [
    authenticated,
    body('slug').notEmpty().isString(),
    body('storyId').notEmpty().isString(),
    handleValidations,
    teamController.handleDeleteStory,
    handleErrors,
  ]);
  router.post('/team/update-story', [
    authenticated,
    body('slug').notEmpty().isString(),
    body('storyId').notEmpty().isString(),
    body('name').optional().notEmpty().isString(),
    body('estimate').optional().notEmpty().isNumeric(),
    body('notes').optional().notEmpty().isString(),
    body('acceptenceCriteria').optional().notEmpty().isString(),
    body('status').optional().notEmpty().isString(),
    handleValidations,
    teamController.handleStoryUpdate,
    handleErrors,
  ]);
  router.post('/feature', [
    authenticated,
    body('slug').notEmpty().isString(),
    body('name').notEmpty().isString(),
    handleValidations,
    featureController.handleCreateFeature,
    handleErrors,
  ]);
  router.get('/features', [
    authenticated,
    query('slug').notEmpty().isString(),
    handleValidations,
    featureController.handleGetAllFeatures,
    handleErrors,
  ]);
  router.get('/feature', [
    authenticated,
    query('slug').notEmpty().isString(),
    query('featureId').notEmpty().isString(),
    handleValidations,
    featureController.handleGetFeature,
    handleErrors,
  ]);
  router.delete('/feature', [
    authenticated,
    body('slug').notEmpty().isString(),
    body('featureId').notEmpty().isString(),
    handleValidations,
    featureController.handleDeleteFeature,
    handleErrors,
  ]);

  return router;
}

export {
  initRoutes,
};
