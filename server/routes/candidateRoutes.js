const express = require('express');
const candidateRoutes = express.Router();
const candidateController = require('../controllers/candidateController');
const KYCverificationController = require('../Controllers/KYCverificationController');
const commonController = require('../Controllers/Common/commonController');
const {verifyToken, checkCandidateEligibility,Candidatemiddleware, findRoleByHash, CandidateProfileCheck, checkKYCStatus} = require('../Middlewares/auth');



candidateRoutes.use(verifyToken);
candidateRoutes.use(Candidatemiddleware);

// candidateRoutes.use(findRoleByHash);
// candidateRoutes.use(checkCandidateEligibility);

candidateRoutes.post('/name',commonController.getName);
candidateRoutes.post('/candy',CandidateProfileCheck,candidateController.getCandidate);

candidateRoutes.post('/upload-resume', candidateController.uploadResume);

candidateRoutes.post('/profile', candidateController.getCandidateDetails);
candidateRoutes.post('/resume',  candidateController.getCandidateAllResume);
candidateRoutes.post('/appliedstatus', candidateController.getAppliedCandidateDetails);
candidateRoutes.post('/get-job-details', candidateController.getJobDetails);

candidateRoutes.get('/title',  commonController.getJobDetailsForCandidate);

candidateRoutes.post('/jobs', candidateController.getAllJob);
   
candidateRoutes.post('/update/profile',  candidateController.updateCandidate);
candidateRoutes.post('/resume/submit', CandidateProfileCheck, candidateController.addCandidateResume);
candidateRoutes.post('/resume/update', candidateController.updateCandidateResume);
candidateRoutes.post('/resume/delete', candidateController.deleteCandidateResume);
candidateRoutes.post('/feedback',  candidateController.getAllFeedback);

candidateRoutes.post('/update/job/role', CandidateProfileCheck,candidateController.updateJobRoles);

candidateRoutes.patch('/cameraPermission',candidateController.updateCameraPermission);
candidateRoutes.post('/by-org',candidateController.getInvitedByOrg );
candidateRoutes.post('/respond-to-invitation', CandidateProfileCheck,candidateController.respondToInvitation );


//kyc
candidateRoutes.post('/kyc',KYCverificationController.uploadKYC);
candidateRoutes.post('/redirect',KYCverificationController.redirectKYC);



module.exports = candidateRoutes;
