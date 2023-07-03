'use strict';

const express = require('express');
const authRouter = express.Router();
const SECRET = process.env.SECRET || 'secretstring';

const { users } = require('../models/index');
const basicAuth = require('../middleware/basic.js')
const bearerAuth = require('../middleware/bearer.js')
const permissions = require('../middleware/acl')
const jwt = require('jsonwebtoken');


authRouter.post('/signup', async (req, res, next) => {
  try {
    // console.log(users)
    let userRecord = await users.create(req.body);
    const output = {
      user: userRecord,
      token: userRecord.token
    };
    res.status(201).json(output);
  } catch (e) {
    next(e.message,"rotuer.js")
  }
});

authRouter.post('/signin', basicAuth, (req, res, next) => {
  // console.log(req.user.token)
  // console.log(req.user)
  // let token = jwt.sign({ username: req.user.username }, SECRET);
  // console.log(token,"0000000000000000000000")
  const user = {
    user: req.user,
    token: req.user.token
  };
  res.status(200).json(user);
});

authRouter.get('/users', bearerAuth, permissions('read'), async (req, res, next) => {
  const userRecords = await users.findAll({});
  const list = userRecords.map(user => user.username);
  res.status(200).json(list);
});

authRouter.get('/secret', bearerAuth, async (req, res, next) => {
  res.status(200).send('Welcome to the secret area')
});

module.exports = authRouter;
