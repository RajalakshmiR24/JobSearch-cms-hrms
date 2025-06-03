const Candidate = require('../models/Candidate');
const HR = require("../models/Hr");
const SuperAdmin = require('../models/SuperAdmin');
const KYC = require('../models/KYC');

const Token = require('../models/Token');
const axios = require('axios');

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(200).json({ code: 400, message: 'Token is required.' });
  }

  try {
    const storedToken = await Token.findOne({ accessToken: token });

    if (!storedToken) {
      return res.status(200).json({ code: 404, message: 'Token not found in database.' });
    }

    if (storedToken.used) {
      return res.status(200).json({ code: 403, message: 'This token has already been used and is no longer valid.' });
    }

    storedToken.used = true;
    await storedToken.save();

    const user = await Token.findOne({ userhash: storedToken.userhash });

    if (!user) {
      return res.status(200).json({ code: 401, message: 'User not found.' });
    }

    const role = storedToken.role || user.role;

    if (role === 'hr' || role === 'candidate' || role === 'superAdmin') {
      req.user = user;
      req.role = role;
      req.hash = storedToken.hash;
      req.externalData = { hash: storedToken.userhash }; // for compatibility

      next();
    } else {
      return res.status(200).json({ code: 403, message: 'Access denied. Only HR and CANDIDATE roles are allowed.' });
    }

  } catch (error) {
    console.error(error.message);
    return res.status(200).json({ code: 500, error: error.message });
  }
};


const checkCandidateEligibility = async (req, res, next) => {
  try {
    const hash = req.hash;

    if (!hash) {
      return res.status(200).json({
        code: 400,
        message: "Phone number not provided.",
      });
    }

    const candidate = await Candidate.findOne({ hash: hash });

    if (!candidate) {
      return res.status(200).json({
        code: 400,
        message: "Candidate not found.",
      });
    }

    req.jobRole = candidate.job_role;

    if (candidate.invited === false) {
      return res.status(200).json({
        code: 400,
        message: "You're not invited by any HR, please contact HR.",
      });
    }

    const lastInterviewDate = new Date(candidate.walkin_date);
    if (isNaN(lastInterviewDate)) {
      return res.status(200).json({
        code: 400,
        message: "Invalid last interview date.",
      });
    }

    const currentDate = new Date();
    const sixMonthsLater = new Date(lastInterviewDate);
    sixMonthsLater.setMonth(sixMonthsLater.getMonth() + 6);

    const candidateWalkinDate = new Date(candidate.walkin_date);
    if (isNaN(candidateWalkinDate)) {
      return res.status(200).json({
        code: 400,
        message: "Invalid walk-in date.",
      });
    }

    const candidateInterviewDate = candidateWalkinDate.setHours(0, 0, 0, 0);
    const todayDate = new Date().setHours(0, 0, 0, 0);

    if (candidateInterviewDate === todayDate) {
      return next();
    }

    if (candidate.job_Status === "IN_PROGRESS") {
      return res.status(200).json({
        code: 200,
        message: `Not eligible for today's interview, please wait until ${candidate.walkin_date.toLocaleDateString()}.`,
      });
    }

    const diffInTime = sixMonthsLater - currentDate;
    const diffInMonths = Math.floor(diffInTime / (1000 * 3600 * 24 * 30));
    const remainingDaysInMonth = Math.floor((diffInTime % (1000 * 3600 * 24 * 30)) / (1000 * 3600 * 24));

    if (currentDate < sixMonthsLater) {
      return res.status(200).json({
        code: 400,
        message: `You are "${candidate.description}" for the role of "${candidate.job_role}". Not eligible for interview, please wait ${diffInMonths} months and ${remainingDaysInMonth} days until ${sixMonthsLater.toLocaleDateString()}.`,
        waitMonths: diffInMonths,
        waitDays: remainingDaysInMonth,
      });
    }

    return res.status(200).json({
      code: 200,
      message: `You are "${candidate.description}" for the role of "${candidate.job_role}". Not eligible for today's interview, please wait ${diffInMonths} months and ${remainingDaysInMonth} days until ${sixMonthsLater.toLocaleDateString()}.`,
    });

  } catch (error) {
    console.error(error.message);

    return res.status(200).json({
      code: 500,
      error: error.message,
    });
  }
};

const findRoleByHash = async (req, res, next) => {
  const userHash = req.headers['user-hash'];

  if (!userHash) {
    return res.status(200).json({ code: 400, error: 'User hash is required.' });
  }

  try {

    let user = await HR.findOne({ hash: userHash }) ||
      await Candidate.findOne({ hash: userHash });

    if (!user) {
      return res.status(200).json({ code: 404, error: 'User not found.' });
    }


    req.hash = user.hash;


    next();
  } catch (error) {
    console.error('Error:', error.message);
    return res.status(200).json({ code: 500, error: error.message });
  }
};

const HRmiddleware = async (req, res, next) => {
  const hash = req.hash;

  if (!hash) {
    return res.status(200).json({
      code: 400,
      message: 'Hash is required.',
    });
  }

  try {
    const user = await HR.findOne({ hash });

    if (!user) {
      return res.status(200).json({
        code: 404,
        message: 'User not founddddddddddddddddddddd.',
      });
    }


    if (user.hr_status !== 'active') {
      return res.status(200).json({
        code: 403,
        message: 'Your account is pending approval. Please wait for confirmation from your organization.',
      });
    }
    


    req.hr_id = user.hr_id;
    req.name = user.name;
    req.role = user.role;
    req.position = user.position;
    req.phone_number = user.phone_number;
    req.organization_website = user.organization_website;
    req.organization_address = user.organization_address;
    req.organization_name = user.organization_name;
    req.organization_email = user.organization_contact.email;
    req.organization_id = user.organization_id;
    req.org_status = user.org_status;
    req.org_join_date = user.join_date;
    req.photo = user.photo;
    req.email = user.email;
    req.organization_logo = user.organization_logo;




    next();
  } catch (error) {
    console.error(error.message);
    return res.status(200).json({
      code: 500,
      error: error.message,
    });
  }
};


const Candidatemiddleware = async (req, res, next) => {
  const hash = req.hash;

  if (!hash) {
    return res.status(200).json({
      code: 400,
      message: 'Hash is required.',
    });
  }

  try {

    const users = await Candidate.find({ hash: hash });
    if (users.length === 0) {
      return res.status(200).json({
        code: 404,
        message: 'User not found.',
      });
    }

    const user = users[0];

    req.candidate_id = user.candidate_id;
    req.name = user.name;
    req.role = user.role;
    req._id = user._id;
    req.jobRole = user.job_role.job_title;
    req.photo = user.photo;
    req.email = user.email;
    req.haveResume = user.resume?.map(item => item.job_title);
    


    next();
  } catch (error) {
    console.error("Error occurred during user retrieval:", error.message);
    return res.status(200).json({
      code: 500,
      error: error.message,
    });
  }
};

const SuperAdminmiddleware = async (req, res, next) => {
  const hash = req.hash;

  if (!hash) {
    return res.status(200).json({
      code: 400,
      message: 'Hash is required.',
    });
  }

  try {

    const users = await SuperAdmin.find({ hash: hash });
    if (users.length === 0) {
      return res.status(200).json({
        code: 404,
        message: 'Super Admin not found.',
      });
    }

    const user = users[0];
    req.superadmin_id = user.superAdmin_id;
    req.name = user.name;
    req.role = user.role;
    req.phone_number = user.phone_number;
    req.photo = user.photo;
    req.email = user.email;


    next();
  } catch (error) {
    console.error("Error occurred during user retrieval:", error.message);
    return res.status(200).json({
      code: 500,
      error: error.message,
    });
  }
};

const CandidateProfileCheck = async (req, res, next) => {
  const candidate_id = req.candidate_id;

  if (!candidate_id) {
    return res.status(200).json({
      code: 400,
      message: 'Candidate ID is required.',
    });
  }

  try {
    const candidate = await Candidate.findOne({ candidate_id: candidate_id });

    if (!candidate) {
      return res.status(200).json({
        profile: false,
        message: "Need to fill all information",
        code: 404,
      });
    }

    if (candidate.profile === true) {
      return next();
    } else {
      return res.status(200).json({
        profile: false,
        message: "Need to fill all information",
        code: 200,
      });
    }
  } catch (error) {
    console.error(error.message);
    return res.status(200).json({
      code: 500,
      error: error.message,
    });
  }
};

const checkKYCStatus = async (req, res, next) => {
  try {
    
    const  candidate_hash  = req.hash; 

    
    const kycRecord = await KYC.findOne({ candidate_hash });

    if (!kycRecord) {
      return res.status(200).json({ code:404, message: 'KYC record not found.' });
    }

    
    if (kycRecord.kycStatus === 'approved') {
      return next(); 
    } else {
      return res.status(200).json({ code:404,message: 'KYC status is not approved.' });
    }
  } catch (err) {
    console.error(err);
    return res.status(200).json({code:500, message: err.message });
  }
};

module.exports = { verifyToken, checkCandidateEligibility,checkKYCStatus, SuperAdminmiddleware, findRoleByHash, HRmiddleware, Candidatemiddleware, CandidateProfileCheck };
