const express = require('express');
const cmsrouter = express.Router();

const hrRouter = require('./hrRoutes');
const superAdminRouter = require('./superAdminRoutes');

const candidateRouter = require('./candidateRoutes');
const authRouter = require('./auth');

cmsrouter.use('/auth', authRouter);
cmsrouter.use('/candidate', candidateRouter);
cmsrouter.use('/hr', hrRouter);
cmsrouter.use('/superadmin', superAdminRouter);


module.exports = cmsrouter;
