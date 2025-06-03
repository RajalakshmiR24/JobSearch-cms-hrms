const express = require('express');
const fileUpload = require('express-fileupload');  
const candidateController = require('../Controllers/candidateController');
const hrController = require('../Controllers/hrController'); 
const commoncontroller = require('../Controllers/Common/commonController'); 

const {verifyToken, findRoleByHash, HRmiddleware} = require('../Middlewares/auth');

const hrRouter = express.Router();

hrRouter.use(fileUpload());
hrRouter.use(verifyToken);
hrRouter.use(HRmiddleware);


hrRouter.post('/name', commoncontroller.getName);
hrRouter.post('/applications', commoncontroller.getCandidatesByJobId);
hrRouter.post('/getfeedback', commoncontroller.getFeedback);
hrRouter.post('/createfeedback', commoncontroller.createFeedback);
hrRouter.post('/editfeedback', commoncontroller.editFeedback);
hrRouter.post('/deletefeedback', commoncontroller.deleteFeedback);
hrRouter.post('/overview', hrController.getAdminDashboard );
hrRouter.post('/update-walkin-details', hrController.updateWalkinDetails );




hrRouter.post('/all/candidates', candidateController.getAllCandidates);
hrRouter.post('/pool/candidates', candidateController.getCandidatePool);

hrRouter.post('/all-hr-candidates', candidateController.getAllCandidatesByHR);

hrRouter.post('/create/hr', hrController.createHRDetails);
hrRouter.post('/update/hr', hrController.updateHRDetailsAndStatus);
hrRouter.post('/getOrganization', hrController.getOrganization);


hrRouter.post('/del', candidateController.candidateDelete);
hrRouter.post('/create-jobrole', hrController.createJobRole);
hrRouter.post('/update-jobrole', hrController.editJobRole);
hrRouter.post('/all-jobdetails', commoncontroller.getJobDetailsForOtherRoles);

hrRouter.post('/get/allhr', hrController.getAllHR);

hrRouter.post('/hr/delete', hrController.updateStatusToSuspended);
hrRouter.post('/job/delete', hrController.updateJobDetailsStatusToSuspended);

hrRouter.post('/all-hr-job-list', hrController.getAllJobsByHR);

hrRouter.post('/get/all/jobs', commoncontroller.getAllJobDetails);

hrRouter.post('/update-status', candidateController.updateStatus);
hrRouter.post('/upload-excel',hrController.handleExcelUpload);
hrRouter.post('/upload-resume',hrController.uploadCandidateResume);
hrRouter.post('/status/roles',hrController.getJobRolesAndStatuses);
hrRouter.post('/create/single/candidate',hrController.createSingleCandidate);
hrRouter.post('/candidate/invite',hrController.InviteCandidate);


//assessments

hrRouter.get('/assessment/types', hrController.getEnums);

hrRouter.post('/assessment/create', hrController.createAssessment);
hrRouter.post('/assessment', hrController.getAllAssessments);
hrRouter.post('/byid/assessment', hrController.getAssessmentById);
hrRouter.post('/assessment/update', hrController.updateAssessment);
hrRouter.post('/assessment/delete', hrController.deleteAssessment);


module.exports = hrRouter;
