
import { logger }     from '~/app/configs/runtime/logger';

import express from 'express';
const router =  express.Router();

import {errorResp} from '~/app/routes/utils';

import UserController     from '~/app/controllers/users';
import UserAuthController from '~/app/controllers/users/auth';

const userController      = new UserController();
const userAuthController  =  new UserAuthController();

const meId = 'me';

/**
 * @api {post} /signup Create new user
 * @apiName CreateUser
 * @apiGroup Users
 *
 * @apiSuccess (Success_200) {Object} User obj
 *
 */
router.post('/signup', async (req, res) => {
  const query = req.body;
  const {username, password} = query;

  if (username && password) {
      logger.info(`Incoming create new user with username: ${username}`);
      try {
          const {user, token} = await userController.create({query});

          res.setHeader("Kinto-Session-User-Token", token);

          res.status(200).send({ data: {user} });
      } catch (e) {
          errorResp({res, code:500, e, _in: 'signup'});
      }
  } else {
      errorResp({res, _in: 'signup'});
  }
});

/**
 * @api {get} /:id Get user by id
 * @apiName GetUser
 * @apiGroup Users
 *
 * @apiSuccess (Success_200) {Object} User obj
 *
 */
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const query = req.body;
  if (query) {
      try {
          const isMe = id === meId;

          // TODO get stuff from session

          const {user} = isMe
              ? await userController.get({ query })
              : await userController.get({
                  query,
                  roles: [UserRoles.ROLE_ADMIN],
              });
          res.status(200).send({ data: {user} });
      } catch (e) {
          errorResp({res, code:500, e, _in: 'users/:id'});
      }
  } else {
      errorResp({res, _in: 'getting users'});
  }
});

// SESSION
/**
 * @api {post} /login Login user
 * @apiName LoginUser
 * @apiGroup Users
 *
 * @apiSuccess (Success_200) {Object} User obj
 *
 */
router.post('/login', async (req, res) => {
  const query = req.body;
  if (query) {
      try {
          logger.info(`Incoming login request`);
          const {user} = await userAuthController.login({ query });

          res.status(200).send({ data: { token }});
      } catch (e) {
          errorResp({res, code:500, e, _in: 'users/login'});
      }
  } else {
      errorResp({res, _in: 'login'});
  }
});

/**
 * @api {post} /login Login user
 * @apiName LogoutUser
 * @apiGroup Users
 *
 * @apiSuccess (Success_200) {Object} Ok response
 *
 */
router.post('/logout', async (req, res) => {
  const query = req.body;
  const { token } = query;
  if (token) {
      try {
          // TODO

          res.status(200).send({ ok: true });
      } catch (e) {
          errorResp({res, code:500, e, _in: 'users/auth/logout'});
      }
  } else {
      errorResp({res, _in: 'logout'});
  }
});

module.exports = router;