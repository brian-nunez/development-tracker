import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import ms from 'ms';
import _debug from 'debug';
import { buildErrorMessage, ErrorResponse, ErrorType } from '../utils/errorBuilder';
import User, {
  UserShape,
  generateHashedPassword,
  comparePassword,
  createUniqueUserId,
} from '../models/User';
import { SessionRequest } from '../middleware/authenticated';

const debug = _debug(`${process.env.npm_package_name}:authController`);

async function handleLogin(request: SessionRequest, response: Response) {
  try {
    const {
      body: {
        email,
        password,
      },
    } = request;
  
    const user = await User.findOne({ email });
    
    if (!user) {
      const error: ErrorResponse = buildErrorMessage(ErrorType.NOT_FOUND, 'User does not exist');
      debug(`handleLogin: ${JSON.stringify(error)}`);
      response.status(error.http_status_code).send(error.error_message);
      return;
    }
  
    const isPasswordMatch: boolean = await comparePassword(password, user.password);
  
    if (!isPasswordMatch) {
      const error: ErrorResponse = buildErrorMessage(ErrorType.INVALID_REQUEST, 'Incorrect Combination');
      debug(`handleLogin: ${JSON.stringify(error)}`);
      response.status(error.http_status_code).send(error.error_message);
      return;
    }

    const payload = {
      email: user.email,
      id: user.id,
      userId: user.userId,
    };

    user.lastLogin = Date.now();
    await user.save();
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: ms('1 day') },
      (error, token) => {
        if (error) {
          throw error;
        }

        debug('User successfully logged in');
        request.session.authToken = token;
        response.json({
          success: true,
        });
      }
    );

  } catch (e) {
    const error: ErrorResponse = buildErrorMessage(ErrorType.INTERNAL_SERVER_ERROR);
    debug(`Error handleRegister: ${JSON.stringify(e)} - Response: ${JSON.stringify(error)}`);
    response.status(error.http_status_code).send(error.error_message);
    return;
  }
}

async function handleRegister(request: Request, response: Response) {
  const {
    body: {
      name,
      email,
      password,
    },
  } = request;

  try {
    const user: UserShape = await User.findOne({ email });

    if (user) {
      const error: ErrorResponse = buildErrorMessage(ErrorType.INVALID_REQUEST, 'User already exists');
      debug(`handleRegister: ${JSON.stringify(error)}`);
      response.status(error.http_status_code).send(error.error_message);
      return;
    }

    const hashedPassword = await generateHashedPassword(password);
    const userId = await createUniqueUserId(name);
    const newUser: UserShape = new User({
      name,
      email,
      password: hashedPassword,
      userId,
    });
    await newUser.save();

    debug('User successfully created');

    response.json({ success: true });
  } catch (e) {
    const error: ErrorResponse = buildErrorMessage(ErrorType.INTERNAL_SERVER_ERROR);
    debug(`Error handleRegister: ${JSON.stringify(e)} - Response: ${JSON.stringify(error)}`);
    response.status(error.http_status_code).send(error.error_message);
    return;
  }
}

async function handleLogout(request: Request, response: Response) {
  request.session.destroy((e) => {
    if (e) {
      const error: ErrorResponse = buildErrorMessage(ErrorType.INTERNAL_SERVER_ERROR);
      debug(`Error handleRegister: ${JSON.stringify(e)} - Response: ${JSON.stringify(error)}`);
      response.status(error.http_status_code).send(error.error_message);
      return;
    }

    debug('User successfully logged out');
    response.json({ success: true });
  });
}

export default {
  handleLogin,
  handleRegister,
  handleLogout,
};
