const express = require('express');
const fileUpload = require('express-fileupload');  
const candidateController = require('../Controllers/candidateController');
const hrController = require('../Controllers/hrController'); 
const superAdminController = require('../Controllers/superAdminController'); 

const commoncontroller = require('../Controllers/Common/commonController'); 

const {verifyToken, SuperAdminmiddleware} = require('../Middlewares/auth');

const superAdminRouter = express.Router();

superAdminRouter.use(fileUpload());
superAdminRouter.use(verifyToken);
superAdminRouter.use(SuperAdminmiddleware);

// superAdminRouter.use(findRoleByHash);

superAdminRouter.post('/organization/create', superAdminController.createOrgDetails);
superAdminRouter.post('/organization/active', superAdminController.UpdateStatusOrgBySuperAdmin);
superAdminRouter.post('/dashboard', superAdminController.getSuperAdminDashboardOverview);


superAdminRouter.post('/name', commoncontroller.getName);
// superAdminRouter.post('/overview', commoncontroller.getDashboardOverview);


superAdminRouter.post('/applications', commoncontroller.getCandidatesByJobId);
superAdminRouter.post('/getfeedback', commoncontroller.getFeedback);
// superAdminRouter.post('/createfeedback', commoncontroller.createFeedback);

superAdminRouter.post('/all/candidates', candidateController.getAllCandidates);
// superAdminRouter.post('/all-hr-candidates', candidateController.getAllCandidatesByHR);


// superAdminRouter.post('/del', candidateController.candidateDelete);
// superAdminRouter.post('/all-jobdetails', hrController.getJobDetailsEnums);
superAdminRouter.post('/org/jobs', superAdminController.getJobDetailsByOrgId);
superAdminRouter.post('/org/candidates', superAdminController.getCandidateDetailsByOrgId);
superAdminRouter.post('/update/org', superAdminController.editOrgDetails);
superAdminRouter.post('/update/admin', superAdminController.editAdminDetails);



// superAdminRouter.post('/get/allhr', hrController.getAllHR);
superAdminRouter.post('/get/all/org', superAdminController.getAllOrg);

superAdminRouter.post('/org/delete', superAdminController.updateStatusOrgSuspended);
superAdminRouter.post('/all/hr/positions', superAdminController.getPositions);
superAdminRouter.post('/all/org/hr', superAdminController.getHRByOrganizationId);
// superAdminRouter.post('/all-hr-job-list', hrController.getAllJobsByHR);


// superAdminRouter.post('/get/all/jobs', commoncontroller.getAllJobDetails);
 

// superAdminRouter.post('/candidate/status', candidateController.updateCandidateStatus);
// superAdminRouter.post('/upload-excel',hrController.handleExcelUpload);
// superAdminRouter.post('/upload-resume',hrController.uploadCandidateResume);
// superAdminRouter.post('/status/roles',hrController.getJobRolesAndStatuses);

module.exports = superAdminRouter;
