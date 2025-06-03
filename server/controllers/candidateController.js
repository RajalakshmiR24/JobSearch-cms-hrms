
const Candidate = require('../models/Candidate');
const HR = require('../models/hr');
const JobDetails = require('../models/JobDetails');
const uuidv4 = require('uuid').v4;
const KYC = require('../models/KYC');
const updateFilesBasedOnJobTitle = require('../utils/updateFiles');
const mongoose = require('mongoose');



exports.getCandidate = async (req, res) => {
  try {
    const hash = req.hash;
    const user = await Candidate.findOne({ hash });

    if (user) {

      return res.status(200).json({
        code: 200,
        profile: true
      });
    }


    return res.status(200).json({
      code: 404,
      message: 'Candidate user not found.',
    });

  } catch (err) {
    res.status(200).json({ code: 500, error: err.message });
  }
};

exports.uploadResume = async (req, res) => {
  const { filename, contentType, data, job_id, job_title, hr_id, org_id } = req.body;


  if (!filename || !contentType || !data) {
    return res.status(200).json({ code: 400, error: 'All fields are required' });
  }

  try {
    const hash = req.hash;
    const candidate = await Candidate.findOne({ hash });


    if (!candidate) {
      return res.status(200).json({ code: 404, error: 'Candidate not found or invalid hash' });
    }


    const newFile = {
      filename,
      contentType,
      data,
      job_id,
      job_title,
      hr_id,
      org_id
    };


    const jobRole = candidate.job_role.find(job => job.job_id === job_id);


    if (!jobRole) {
      return res.status(200).json({ code: 404, error: 'Job role not found' });
    }


    jobRole.files.push(newFile);
    jobRole.candidate_Status = 'PRESENT';


    await candidate.save();


    res.status(201).json({
      code: 201,
      message: 'File uploaded successfully and status updated to PRESENT',
      file: newFile,
    });
  } catch (error) {
    console.error(error.message);

    res.status(200).json({ code: 500, error: error.message });
  }
};




function updateTimeline(candidate) {
  const currentDate = new Date();
  let candidateDate = candidate.walkin_date;

  if (!(candidateDate instanceof Date)) {
    candidateDate = new Date(candidateDate);
  }

  if (candidateDate.toDateString() === currentDate.toDateString()) {
    candidate.timeline = 'TODAY';
  } else if (candidateDate > currentDate) {
    candidate.timeline = 'UPCOMING';
  } else {
    candidate.timeline = 'PREVIOUS';
  }
}


exports.getAllCandidates = async (req, res) => {
  try {
    const hr_id = req.hr_id;
    const orgName = req.organization_name;
    const hrPosition = req.position;
    const orgId = req.organization_id;
    const role = req.role;

    if (role === 'superAdmin') {
      let candidates = await Candidate.find()
        .select('-hash -_id -files._id -geoLocation._id -geoLocation.action_details._id -__v -updatedAt -job_role.files -resume._id -job_role._id -experiences._id -education._id -feedback');

      if (candidates.length === 0) {
        const response = {
          code: 404,
          error: 'No data found',
          role: role,
        };
        return res.status(200).json(response);
      }

      const Last = await Promise.all(
        candidates.map(async (can) => {

          const kycData = await KYC.findOne({ candidate_id: can.candidate_id });
          const kycStatus = kycData ? kycData.kycStatus : null;

          const poiDob = kycData?.poi?.[0]?.dob;
          const poiGender = kycData?.poi?.[0]?.gender;
          const poiName = kycData?.poi?.[0]?.name;
          const poaCo = kycData?.poa?.[0]?.co;
          const imageData = kycData?.pht?.[0]?.imageData;
          const eaadhar_uid = kycData?.eaadhar_uid ?? null;
          const pan = kycData?.pan ?? null;
          const drivingLicense = kycData?.drivingLicenseCredential ?? null;


          const drivingLicenseWithoutPrefix = drivingLicense?.replace('in.gov.transport-DRVLC-', '') ?? null;

          const file = kycData?.fileResponse ?? null;


          const candi = await Promise.all(can.job_role.map(async (items) => {
            const orgDetails = await HR.findOne({ organization_id: items.org_id })
              .select('-_id -phone_number -hash -role -name -position -hr_status -hr_id -join_date -updatedAt -createdAt -__v -geoLocation');

            let organization;

            if (orgDetails) {
              organization = {
                name: orgDetails?.organization_name,
                email: orgDetails?.organization_contact.email,
                address: orgDetails?.organization_address,
                website: orgDetails?.organization_website,
              };
            } else {
              organization = {};
            }
            return { ...items.toObject(), ...organization };
          }));

          return {
            ...can.toObject(),
            job_role: [...candi],
            kyc_status: kycStatus,
            poi_dob: poiDob,
            poi_name: poiName,
            poi_gender: poiGender,
            poa_co: poaCo,
            eaadhar_uid: eaadhar_uid,
            pan: pan,
            imageData: imageData,
            file: file,
            drivingLicense: drivingLicenseWithoutPrefix,
            // eaadharfile: eaadharFile,
          };
        })
      )
      const response = {
        code: 200,
        data: Last,
        role: role,

      };
      res.status(200).json(response);
    } else {
      let candidates = await Candidate.find({
        $or: [
          { hr_id: hr_id },
          { 'job_role.hr_ids': hr_id },
          { 'job_role.org_id': orgId }
        ]
      })
        .select('-hash -_id -files._id -geoLocation._id -geoLocation.action_details._id -__v -updatedAt -createdAt -resume._id -job_role._id -experiences._id -education._id -feedback');

      if (candidates.length === 0) {
        const response = {
          code: 404,
          error: 'No data found',
          organization_Name: orgName,
          role: role,
          hrPosition: hrPosition,
        };
        return res.status(200).json(response);
      }

      for (let candidate of candidates) {
        for (let jobRole of candidate.job_role) {
          const orgDetails = await HR.findOne({ organization_id: jobRole.org_id })
            .select('-_id -phone_number -hash -role -name -position -hr_status -hr_id -join_date -updatedAt -createdAt -__v -geoLocation');

          if (orgDetails) {
            jobRole.organization = {
              name: orgDetails.organization_name,
              email: orgDetails.organization_contact.email,
              address: orgDetails.organization_address,
              website: orgDetails.organization_website,
            };
          } else {
            jobRole.organization = {};
          }
        }
        updateTimeline(candidate);
      }

      const Last = await Promise.all(
        candidates.map(async (can) => {
          const kycData = await KYC.findOne({ candidate_id: can.candidate_id });
          const kycStatus = kycData ? kycData.kycStatus : null;


          const poiDob = kycData?.poi?.[0]?.dob;
          const poaCo = kycData?.poa?.[0]?.co;

          const candi = await Promise.all(can.job_role.map(async (items) => {
            const CandiJobDetails = await JobDetails.findOne({ job_id: items.job_id })
              .select('-_id -phone_number -hash -role -name -position -hr_status -hr_id -join_date -updatedAt -createdAt -__v -geoLocation');

            let postingJobs

            if (CandiJobDetails) {
              postingJobs = {
                postingTitle: CandiJobDetails.postingTitle

              };
            } else {
              postingJobs = {};
            }
            return { ...items.toObject(), ...postingJobs }
          }));

          return {
            ...can.toObject(),
            job_role: [...candi],
            kyc_status: kycStatus,
            poi_dob: poiDob,
            poa_co: poaCo
          };
        })
      )
      const response = {
        code: 200,
        data: Last,
        role: role,

      };
      res.status(200).json(response);
    }
  } catch (error) {
    console.error("Error in getAllCandidates:", error.message);
    const response = {
      code: 500,
      message: error.message,
    };
    res.status(200).json(response);
  }
};

exports.getAllCandidatesByHR = async (req, res) => {
  try {
    const { hrId } = req.body;

    let candidates = await Candidate.find({ hr_id: hrId })
      .select('-hash -_id -files._id -__v -updatedAt -createdAt');


    if (candidates.length === 0) {
      return res.status(200).json({
        code: 404,
        success: false,
        message: 'No data found',
      });
    }


    candidates = candidates.map(candidate => {
      updateTimeline(candidate);
      return candidate;
    });

    res.status(200).json({
      code: 200,
      success: true,
      data: candidates,
    });
  } catch (error) {
    console.error(error.message);

    res.status(200).json({
      code: 500,
      success: false,
      message: error.message,
    });
  }
};


exports.updateJobRoles = async (req, res) => {
  const candidate_id = req.candidate_id;
  const { job_id, job_title, postingTitle, resume_name, resume_Type, data } = req.body;

  try {
    if (!job_id || !job_title || !postingTitle) {
      return res.status(200).json({ code: 400, message: 'job_id, job_title and postingTitle are required.' });
    }

    const jobTitle = Array.isArray(job_title) ? job_title[0] : job_title;
    const candidate = await Candidate.findOne({ candidate_id });
    if (!candidate) {
      return res.status(200).json({ code: 404, message: 'Candidate not found' });
    }

    const existingJobRole = candidate.job_role.find(role => role.job_id === job_id);

    if (existingJobRole) {
      const jobDetails = await JobDetails.findOne({ job_id });

      if (!jobDetails) {
        return res.status(200).json({ code: 404, message: 'Job not found' });
      }

      const hr_id = jobDetails.hiringManager.hr_id;
      const org_id = jobDetails.org_id;

      if (!existingJobRole.hr_ids.includes(hr_id)) {
        existingJobRole.hr_ids.push(hr_id);
      }

      existingJobRole.org_id = org_id;
      existingJobRole.job_title = jobTitle;
      existingJobRole.postingTitle = postingTitle;

      // Check if resume already exists with this job_title
      const existingResume = candidate.resume.find(resume => resume.job_title === jobTitle);
      if (!existingResume) {
        // Create a new resume entry if it does not exist
        candidate.resume.push({
          job_title: jobTitle,
          resume_name: resume_name,      // Get resume_name from the request body
          resume_Type: resume_Type,      // Get resume_Type from the request body
          data: data,                    // Get the resume data (file content or path) from the request body
        });
      }

      await jobDetails.save();
      await candidate.save();

      return res.status(200).json({ code: 200, message: 'Job roles updated with additional hiring manager and org_id' });
    } else {
      const jobDetails = await JobDetails.findOne({ job_id });

      if (!jobDetails) {
        return res.status(200).json({ code: 404, message: 'Job not found' });
      }

      const hr_id = jobDetails.hiringManager.hr_id;
      const org_id = jobDetails.org_id;

      candidate.job_role.push({ job_id, job_title: jobTitle, hr_ids: [hr_id], org_id, applicationStatus: "Applied", postingTitle: postingTitle });

      // Check if resume already exists with this job_title
      const existingResume = candidate.resume.find(resume => resume.job_title === jobTitle);
      if (!existingResume) {
        // Create a new resume entry if it does not exist
        candidate.resume.push({
          job_title: jobTitle,
          resume_name: resume_name,      // Get resume_name from the request body
          resume_Type: resume_Type,      // Get resume_Type from the request body
          data: data,                    // Get the resume data (file content or path) from the request body
        });
      }

      await jobDetails.save();
      await candidate.save();

      return res.status(200).json({ code: 200, message: 'Job roles updated successfully with org_id' });
    }
  } catch (error) {
    console.error(error.message);
    return res.status(200).json({ code: 500, error: error.message });
  }
};


exports.updateCameraPermission = async (req, res) => {
  try {
    const hash = req.hash;
    const user = await Candidate.findOne({ hash });
    if (!user) {
      return res.status(200).json({ code: 404, message: 'User not found' });
    }
    const { cameraPermission } = req.body;
    if (typeof cameraPermission !== 'boolean') {
      return res.status(200).json({ code: 400, error: 'Camera permission must be a boolean' });
    }

    const candidate = await Candidate.findByIdAndUpdate(
      user._id,
      { cameraPermission },
      { new: true, runValidators: true }
    );


    if (!candidate) {
      return res.status(200).json({ code: 404, error: 'Candidate not found' });
    }


    res.status(200).json(candidate);
  } catch (error) {
    console.error(error.message);

    res.status(200).json({ code: 500, error: error.message });
  }
};




exports.candidateDelete = async (req, res) => {
  try {
    const hash = req.hash;
    const hr = await HR.findOne({ hash });
    if (!hr) {
      return res.status(200).json({ code: 404, error: 'HR not found' });
    }

    const { candidateId } = req.body;


    const candidate = await Candidate.findOne({ candidate_id: candidateId });

    if (!candidate) {
      return res.status(200).json({ code: 404, error: 'Candidate not found' });
    }


    if (candidate.deleteFlag === true) {
      return res.status(200).json({ code: 400, error: 'Candidate already marked as deleted' });
    }


    await Candidate.findOneAndUpdate(
      { candidate_id: candidateId },
      { deleteFlag: true }
    );

    return res.status(200).json({
      code: 200,
      message: 'Candidate marked as deleted successfully.',
    });
  } catch (error) {
    console.error(error.message);

    return res.status(200).json({ code: 500, error: 'Internal Server Error' });
  }
};

exports.getCandidateDetails = async (req, res) => {
  try {
    const candidateId = req.candidate_id;


    const candidate = await Candidate.find({ candidate_id: candidateId })
      .select('-_id -hash -__v -role -education._id -experiences._id -resume -invited_by_org -job_role -geoLocation -updatedAt -createdAt -walkin_date -timeline -candidate_Status -job_Status -description -cameraPermission -deleteFlag -invited -profile -files -feedback')
      .lean();

    if (!candidate || candidate.length === 0) {
      return res.status(200).json({ code: 404, message: 'Candidate not found' });
    }


    const kycDetails = await KYC.findOne({ candidate_id: candidateId })
      .select('kycStatus poi.dob poa.co')
      .lean();

    const data = {
      candidate: candidate[0],
      kycStatus: kycDetails ? kycDetails.kycStatus : null,
      poi: kycDetails ? kycDetails.poi : null,
      poa: kycDetails ? kycDetails.poa : null,
    };

    return res.status(200).json({
      code: 200,
      data,
      message: kycDetails ? undefined : 'KYC details not found',
    });

  } catch (error) {
    console.error(error.message);
    res.status(200).json({ code: 500, error: error.message });
  }
};




exports.getCandidateAllResume = async (req, res) => {
  try {
    const candidateId = req.candidate_id;
    const name = req.name;

    const candidate = await Candidate.findOne({ candidate_id: candidateId }).select('resume');

    if (!candidate) {
      return res.status(200).json({ code: 404, message: 'Candidate not found' });
    }

    return res.status(200).json({ code: 200, resumes: candidate.resume, name });
  } catch (error) {
    console.error(error.message);
    return res.status(200).json({ code: 500, message: error.message });
  }
};


exports.addCandidateResume = async (req, res) => {
  try {
    const candidateId = req.candidate_id;
    const { resumes } = req.body;

    if (!candidateId) {
      return res.status(200).json({ code: 400, message: 'Candidate ID is required.' });
    }

    if (!Array.isArray(resumes) || resumes.length === 0) {
      return res.status(200).json({ code: 400, message: 'Please provide at least one resume.' });
    }

    const candidate = await Candidate.findOne({ candidate_id: candidateId });
    if (!candidate) {
      return res.status(200).json({ code: 404, message: 'Candidate not found' });
    }


    for (const resume of resumes) {
      const { job_title, resume_name, resume_Type, data } = resume;

      if (!job_title || !resume_name || !resume_Type || !data) {
        return res.status(200).json({
          code: 400,
          message: 'All fields in each resume (job_title, resume_name, resume_Type, data) are required.'
        });
      }

      if (resume_name.length > 255) {
        return res.status(200).json({ code: 400, message: 'Resume name cannot be longer than 255 characters' });
      }

      if (typeof data !== 'string' || !data.trim()) {
        return res.status(200).json({ code: 400, message: `Invalid resume data for job title '${job_title}'` });
      }


      const existingJobTitleIndex = candidate.resume.findIndex(r => r.job_title === job_title);
      if (existingJobTitleIndex !== -1) {
        return res.status(200).json({
          code: 400,
          message: `Resume with job title '${job_title}' already exists. If you want to update it, please modify the existing resume.`
        });
      }


      resume.resume_id = uuidv4();
    }


    candidate.resume.push(...resumes);

    await candidate.save();

    return res.status(200).json({
      code: 200,
      message: 'Resumes added successfully',
    });
  } catch (error) {
    console.error(error.message);
    return res.status(200).json({ code: 500, message: error.message });
  }
};

exports.deleteCandidateResume = async (req, res) => {
  try {
    const { resumeId } = req.body;
    const candidateId = req.candidate_id;

    if (!resumeId) {
      return res.status(200).json({ code: 400, message: 'Resume ID is required.' });
    }

    if (!candidateId) {
      return res.status(200).json({ code: 400, message: 'Candidate ID is required.' });
    }


    const candidate = await Candidate.findOne({ candidate_id: candidateId });

    if (!candidate) {
      return res.status(200).json({ code: 404, message: 'Candidate not found' });
    }


    const resumeIndex = candidate.resume.findIndex(r => r.resume_id === resumeId);

    if (resumeIndex === -1) {
      return res.status(200).json({ code: 404, message: 'Resume not found' });
    }


    candidate.resume.splice(resumeIndex, 1);


    await candidate.save();

    return res.status(200).json({
      code: 200,
      message: 'Resume deleted successfully',
    });
  } catch (error) {
    console.error(error.message);
    return res.status(200).json({ code: 500, message: error.message });
  }
};


exports.updateCandidateResume = async (req, res) => {
  try {
    const candidateId = req.candidate_id;
    const { resume_id, job_title, resume_name, resume_Type, data } = req.body;

    if (!candidateId) {
      return res.status(200).json({ code: 400, message: 'Candidate ID is required.' });
    }

    if (!resume_id) {
      return res.status(200).json({ code: 400, message: 'Resume ID is required.' });
    }

    if (!job_title || !resume_name || !resume_Type || !data) {
      return res.status(200).json({
        code: 400,
        message: 'All fields (job_title, resume_name, resume_Type, data) are required.'
      });
    }

    if (resume_name.length > 255) {
      return res.status(200).json({ code: 400, message: 'Resume name cannot be longer than 255 characters' });
    }

    if (typeof data !== 'string' || !data.trim()) {
      return res.status(200).json({ code: 400, message: 'Invalid resume data provided.' });
    }


    const candidate = await Candidate.findOne({ candidate_id: candidateId });
    if (!candidate) {
      return res.status(200).json({ code: 404, message: 'Candidate not found' });
    }


    const resumeIndex = candidate.resume.findIndex(r => r.resume_id === resume_id);
    if (resumeIndex === -1) {
      return res.status(200).json({ code: 404, message: 'Resume not found' });
    }


    const existingJobTitles = candidate.resume.map(r => r.job_title);
    if (existingJobTitles.includes(job_title) && candidate.resume[resumeIndex].job_title !== job_title) {
      return res.status(200).json({ code: 400, message: `Resume with job title '${job_title}' already exists.` });
    }


    candidate.resume[resumeIndex].job_title = job_title;
    candidate.resume[resumeIndex].resume_name = resume_name;
    candidate.resume[resumeIndex].resume_Type = resume_Type;
    candidate.resume[resumeIndex].data = data;


    await candidate.save();

    return res.status(200).json({
      code: 200,
      message: 'Resume updated successfully',
      resume: candidate.resume[resumeIndex],
    });
  } catch (error) {
    console.error(error.message);
    return res.status(200).json({ code: 500, message: error.message });
  }
};



exports.updateCandidate = async (req, res) => {
  try {
    const candidate_id = req.candidate_id;
    const { email, address, skills, linkedin, github, education, experiences, name, phone_number } = req.body;

    if (!email || !address || !skills || !education || education.length === 0) {
      return res.status(200).json({
        code: 400,
        message: 'Email, Address, skills, and Education are required to update the candidate.',
      });
    }

    const candidate = await Candidate.findOne({ candidate_id: candidate_id });

    if (!candidate) {
      return res.status(200).json({ code: 404, message: 'Candidate not found' });
    }

    candidate.email = email || candidate.email;
    candidate.address = address || candidate.address;
    candidate.skills = skills || candidate.skills;
    candidate.linkedin = linkedin || candidate.linkedin;
    candidate.github = github || candidate.github;
    candidate.name = name || candidate.name;
    candidate.phone_number = phone_number || candidate.phone_number;

    if (education && education.length > 0) {
      const validEducation = education.map(edu => {
        if (!edu.qualification || !edu.institution || !edu.passingYear) {
          throw new Error('Each education entry must have a qualification, institution, and passing year');
        }
        return {
          qualification: edu.qualification,
          institution: edu.institution,
          passingYear: edu.passingYear,
          marks: edu.marks || ' ',
        };
      });
      candidate.education = validEducation;
    }

    if (experiences && experiences.length > 0) {
      candidate.experiences = experiences.map(exp => ({
        company: exp.company,
        role: exp.role,
        fromDate: exp.fromDate ? new Date(exp.fromDate) : null,
        toDate: exp.toDate ? new Date(exp.toDate) : null,
        skillsUsed: exp.skillsUsed,
      }));
    }

    candidate.profile = true;
    await candidate.save();

    return res.status(200).json({ message: 'Candidate updated successfully!' });
  } catch (error) {
    console.error(error.message);

    return res.status(200).json({ code: 500, message: 'Error updating candidate', error: error.message });
  }
};



exports.checkUpdateCandidate = async (req, res) => {
  try {
    const candidate_id = req.candidate_id;
    if (profile === undefined) {
      return res.status(200).json({ code: 400, message: 'Profile status is required.' });
    }
    const candidate = await Candidate.findOne({ candidate_id: candidate_id });
    if (!candidate) {
      return res.status(200).json({ code: 404, message: 'Candidate not found' });
    }
    candidate.profile = profile;
    await candidate.save();
    res.status(200).json({ profile: candidate.profile, message: 'Profile updated successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(200).json({ code: 500, message: 'Server error' });
  }
};

exports.getAllJob = async (req, res) => {
  const candidateId = req.candidate_id;
  const haveResume = req.haveResume;

  try {
    const jobDetails = await JobDetails.find({}).select('-hash -hiringManager -_id -files._id -__v -updatedAt -createdAt -candidate');

    if (!jobDetails || jobDetails.length === 0) {
      return res.status(200).json({
        code: 400,
        message: 'No jobs found',
        haveResume: haveResume,
      });
    }


    const filteredJobDetails = jobDetails.filter(job =>
      job.numOfOpenings > 0 &&
      job.deleteFlag !== true &&
      job.job_status !== "inactive" &&
      job.jobOpeningStatus !== "Closed"
    );

    if (filteredJobDetails.length === 0) {
      return res.status(200).json({
        code: 400,
        message: 'No job details with open positions found',
        haveResume: job_title,

      });
    }

    const jobWithHRDetails = [];

    for (let job of filteredJobDetails) {
      const jobWithHr = { ...job.toObject() };

      if (job.hr_id) {
        try {
          const hrDetails = await HR.findOne({ hr_id: job.hr_id });
          if (hrDetails) {
            jobWithHr.hrDetails = {
              email: hrDetails.email,
              organization_name: hrDetails.organization_name,
              organization_website: hrDetails.organization_website,
              organization_address: hrDetails.organization_address,
            };

            if (job.isPhoneNumberVisible) {
              jobWithHr.hrDetails.phone_number = hrDetails.phone_number;
            }
          } else {
            jobWithHr.hrDetails = { message: `No HR details found for hr_id: ${job.hr_id}` };
          }
        } catch (hrError) {
          jobWithHr.hrDetails = { message: 'Error fetching HR details' };
          console.error('Error fetching HR details:', hrError);
        }
      } else {
        jobWithHr.hrDetails = { message: 'No HR assigned to this job' };
      }

      if (candidateId) {
        try {
          const candidate = await Candidate.findOne({ candidate_id: candidateId });

          if (candidate && candidate.job_role && Array.isArray(candidate.job_role)) {
            const jobStatus = candidate.job_role.find(role => role.job_id === job.job_id);
            if (jobStatus) {
              jobWithHr.applicationStatus = jobStatus.applicationStatus;
            } else {
              jobWithHr.applicationStatus = 'Not_Applied';
            }
          } else {
            jobWithHr.applicationStatus = 'Not_Applied';
          }
        } catch (candidateError) {
          jobWithHr.applicationStatus = 'Error fetching application status';
          console.error('Error fetching candidate application status:', candidateError);
        }
      } else {
        jobWithHr.applicationStatus = 'Not_Applied';
      }

      jobWithHRDetails.push(jobWithHr);
    }

    if (jobWithHRDetails.length === 0) {
      return res.status(200).json({
        code: 400,
        message: 'No data found',
        haveResume: haveResume,

      });
    }

    return res.status(200).json({
      code: 200,
      data: jobWithHRDetails,
      haveResume: haveResume,
    });

  } catch (error) {
    console.error('Error fetching job details:', error.message);
    return res.status(200).json({
      code: 500,
      error: error.message,
      haveResume: haveResume,

    });
  }
};


exports.getAppliedCandidateDetails = async (req, res) => {
  const candidate_id = req.candidate_id;

  try {
    const candidate = await Candidate.find({
      candidate_id,
      'job_role.applicationStatus': 'Applied',
    })
      .select(
        '-name -role -invited -profile -timeline -job_role.files -invited_by_org -feedback -cameraPermission -phone_number -hash -github -linkedin -createdAt -geoLocation -skills -email -dob -address -_id -files._id -files.hr_id -__v -updatedAt -job_role._id -job_role.hr_ids -experiences -education'
      );

    if (!candidate || candidate.length === 0) {
      return res.status(200).json({
        code: 404,
        message: 'Applied Jobs not found',
      });
    }

    candidate.forEach((candidateItem) => {

      if (Array.isArray(candidateItem.feedback)) {
        candidateItem.feedback = candidateItem.feedback.filter(
          (feedback) => feedback.feedback_deleteFlag !== true
        );
      }
    });

    return res.status(200).json({
      code: 200,
      message: 'Candidate details retrieved successfully',
      candidate: candidate,
    });
  } catch (err) {
    return res.status(200).json({
      code: 500,
      error: err.message,
    });
  }
};

exports.getAllFeedback = async (req, res) => {
  const candidate_id = req.candidate_id;

  try {

    const candidate = await Candidate.findOne({ candidate_id: candidate_id }).select('feedback');

    if (!candidate) {
      return res.status(200).json({ code: 404, message: 'Candidate not found' });
    }


    if (!candidate.feedback || candidate.feedback.length === 0) {
      return res.status(200).json({ code: 404, message: 'No feedback available for this candidate' });
    }


    const filteredFeedback = candidate.feedback.filter(feedback => !feedback.feedback_deleteFlag);


    const orgIds = [...new Set(filteredFeedback.map(feedback => feedback.org_id))];
    const hrIds = [...new Set(filteredFeedback.map(feedback => feedback.created_by))];


    const organizations = await HR.find({ organization_id: { $in: orgIds } }).select('organization_name organization_id');
    const hrUsers = await HR.find({ hr_id: { $in: hrIds } }).select('position hr_id');


    const organizationMap = organizations.reduce((acc, org) => {
      acc[org.organization_id] = org.organization_name;
      return acc;
    }, {});

    const hrUserMap = hrUsers.reduce((acc, hr) => {
      acc[hr.hr_id] = hr.position;
      return acc;
    }, {});


    const feedbackWithOrgAndHR = filteredFeedback.map(feedback => ({
      ...feedback.toObject(),
      organization_name: organizationMap[feedback.org_id] || 'Unknown Organization',
      hr_position: hrUserMap[feedback.created_by] || 'Unknown Position',
    }));


    return res.status(200).json({
      code: 200,
      feedback: feedbackWithOrgAndHR,
    });
  } catch (err) {
    console.error(err);
    return res.status(200).json({ code: 500, message: 'Server error', error: err.message });
  }
};


exports.getCandidatePool = async (req, res) => {
  try {
    const role = req.role;

    if (role === 'hr' || role === 'superAdmin') {

      const candidates = await Candidate.find()
        .select('-hash -_id -files._id -__v -updatedAt -job_role._id -geoLocation._id -geoLocation.ip_address -geoLocation.action_details._id -experiences._id -education._id -feedback');

      if (!candidates || candidates.length === 0) {
        return res.status(200).json({
          code: 404,
          message: 'No candidates found',
        });
      }


      const candidatePromises = candidates.map(async (candidate) => {

        const kyc = await KYC.findOne({ candidate_id: candidate.candidate_id }).select('kycStatus');


        const kycStatus = kyc ? kyc.kycStatus : 'null';

        return {
          ...candidate.toObject(),
          kycStatus: kycStatus,
        };
      });


      const updatedCandidates = await Promise.all(candidatePromises);

      return res.status(200).json({
        code: 200,
        success: true,
        data: updatedCandidates,
      });

    } else {

      return res.status(200).json({
        code: 403,
        message: 'Access denied. Only HR and superAdmin can view all candidates.',
      });
    }
  } catch (error) {

    console.error(error.message);
    return res.status(200).json({
      code: 500,
      message: error.message,
    });
  }
};

exports.getInvitedByOrg = async (req, res) => {
  try {
    const { candidate_id } = req;


    const candidate = await Candidate.findOne({ candidate_id })
      .select('invited_by_org -_id')
      .lean();

    if (!candidate) {
      return res.status(200).json({
        code: 404,
        success: false,
        message: 'Candidate not found',
      });
    }


    candidate.invited_by_org = candidate.invited_by_org.filter(invite => !invite.accepted);


    for (let invite of candidate.invited_by_org) {
      try {

        const orgDetails = await HR.findOne({ organization_id: invite.org_id });

        if (orgDetails) {
          invite.organization_name = orgDetails.organization_name;
          invite.organization_website = orgDetails.organization_website;
          invite.organization_address = orgDetails.organization_address;

          invite.organization_email = orgDetails.organization_contact.email;
        } else {
          invite.organization_name = 'No organization found';
          invite.organization_website = 'N/A';
        }
      } catch (orgError) {
        invite.organization_name = 'Error fetching organization details';
        invite.organization_website = 'N/A';
        console.error('Error fetching organization details:', orgError);
      }
    }

    return res.status(200).json({
      code: 200,
      success: true,
      data: candidate,
    });

  } catch (error) {
    console.error('Error fetching candidate:', error.message);
    return res.status(200).json({
      code: 500,
      success: false,
      message: 'Server Error: ' + error.message,
    });
  }
};


exports.respondToInvitation = async (req, res) => {
  try {
    const { candidate_id } = req;
    const { inviteId, responseType, rejectionMessage } = req.body;

    if (!['accept', 'reject'].includes(responseType)) {
      return res.status(200).json({
        code: 400,
        success: false,
        message: 'Invalid response type. Must be "accept" or "reject".',
      });
    }

    const candidate = await Candidate.findOne({ candidate_id });

    if (!candidate) {
      return res.status(200).json({
        code: 404,
        success: false,
        message: 'Candidate not found',
      });
    }

    const invitedJobIndex = candidate.invited_by_org.findIndex(job => job.invite_id === inviteId);

    if (invitedJobIndex === -1) {
      return res.status(200).json({
        code: 404,
        success: false,
        message: 'Invitation not found',
      });
    }

    const job = candidate.invited_by_org[invitedJobIndex];

    if (responseType === 'accept') {

      job.accepted = true;
      job.rejection_message = null;
      job.job_Status = 'IN_PROGRESS';
      job.candidate_Status = 'WAITING';


      candidate.job_role.push({
        job_id: job.job_id,
        job_title: job.job_title,
        postingTitle: job.postingTitle,
        hr_ids: job.hr_id,
        org_id: job.org_id,
        walkin_date: job.walkin_date,
        timeline: 'UPCOMING',
        applicationStatus: 'Applied',
        appliedAt: new Date(),
        candidate_Status: 'WAITING',
        job_Status: 'SHORTLISTED',
        description: 'Status updated.',
      });


      candidate.invited_by_org.splice(invitedJobIndex, 1);

      await candidate.save();


      const jobUpdate = {
        $push: {
          job_role: {
            candidate_id: candidate.candidate_id,
            candidate_name: candidate.name,
            candidate_status: 'WAITING',
            job_Status: 'SHORTLISTED',
            accepted_at: new Date(),
            job_title: job.job_title,
            postingTitle: job.postingTitle,
          },
        },
      };

      await Candidate.findOneAndUpdate({ job_id: job.job_id }, jobUpdate, { new: true });

      return res.status(200).json({
        code: 200,
        success: true,
        message: 'Invitation accepted successfully.',
      });
    }

    if (responseType === 'reject') {
      job.accepted = false;
      job.rejection_message = rejectionMessage || 'No message provided';
      job.job_Status = 'REJECTED';
      job.candidate_Status = 'REJECTED';

      candidate.invited_by_org[invitedJobIndex].rejection_message = rejectionMessage || 'No message provided';

      await candidate.save();

      const jobRejectUpdate = {
        $set: {
          job_Status: 'REJECTED',
          candidate_Status: 'REJECTED',
          rejection_message: rejectionMessage || 'No message provided',
        },
      };

      await Candidate.findOneAndUpdate({ job_id: job.job_id }, jobRejectUpdate, { new: true });

      return res.status(200).json({
        code: 200,
        success: true,
        message: 'Invitation rejected successfully',
      });
    }
  } catch (error) {
    console.error('Error responding to invitation:', error.message);
    return res.status(200).json({
      code: 500,
      success: false,
      message: 'Server Error: ' + error.message,
    });
  }
};


exports.getJobDetails = async (req, res) => {
  try {
    const { jobId } = req.body;

    if (!jobId) {
      return res.status(200).json({ code: 400, message: 'Job ID is required' });
    }

    const jobDetails = await JobDetails.findOne({ job_id: jobId }).select('-hash -hiringManager -_id -files._id -__v -updatedAt -createdAt -candidate');

    if (!jobDetails) {
      return res.status(200).json({ code: 404, message: 'Job not found' });
    }


    if (jobDetails.numOfOpenings <= 0 || jobDetails.deleteFlag === true || jobDetails.job_status === "inactive" || jobDetails.jobOpeningStatus === "Closed") {
      return res.status(200).json({ code: 404, message: 'Job is not available' });
    }


    const jobWithHrDetails = { ...jobDetails.toObject() };


    if (jobDetails.hr_id) {
      try {
        const hrDetails = await HR.findOne({ hr_id: jobDetails.hr_id });
        if (hrDetails) {
          jobWithHrDetails.hrDetails = {
            email: hrDetails.email,
            organization_name: hrDetails.organization_name,
            organization_website: hrDetails.organization_website,
            organization_address: hrDetails.organization_address,
          };

          if (jobDetails.isPhoneNumberVisible) {
            jobWithHrDetails.hrDetails.phone_number = hrDetails.phone_number;
          }
        } else {
          jobWithHrDetails.hrDetails = { message: `No HR details found for hr_id: ${jobDetails.hr_id}` };
        }
      } catch (hrError) {
        jobWithHrDetails.hrDetails = { message: 'Error fetching HR details' };
        console.error('Error fetching HR details:', hrError);
      }
    } else {
      jobWithHrDetails.hrDetails = { message: 'No HR assigned to this job' };
    }


    const candidateId = req.candidate_id;
    if (candidateId) {
      try {
        const candidate = await Candidate.findOne({ candidate_id: candidateId });

        if (candidate && candidate.job_role && Array.isArray(candidate.job_role)) {
          const jobStatus = candidate.job_role.find(role => role.job_id === jobDetails.job_id);
          if (jobStatus) {
            jobWithHrDetails.applicationStatus = jobStatus.applicationStatus;
          } else {
            jobWithHrDetails.applicationStatus = 'Not_Applied';
          }
        } else {
          jobWithHrDetails.applicationStatus = 'Not_Applied';
        }
      } catch (candidateError) {
        jobWithHrDetails.applicationStatus = 'Error fetching application status';
        console.error('Error fetching candidate application status:', candidateError);
      }
    } else {
      jobWithHrDetails.applicationStatus = 'Not_Applied';
    }

    return res.status(200).json({
      code: 200,
      data: jobWithHrDetails,
    });

  } catch (err) {
    console.error('Error fetching job details:', err.message);
    return res.status(200).json({
      code: 500,
      error: err.message,
    });
  }
};


exports.updateStatus = async (req, res) => {
  const org_id = req.organization_id;
  const { candidate_id, job_id, job_Status, candidate_Status } = req.body;


  if (!job_Status && !candidate_Status) {
    return res.status(200).json({ code: 400, message: "Either job_Status or candidate_Status must be provided" });
  }

  try {

    const candidate = await Candidate.findOne({ candidate_id });

    if (!candidate) {
      return res.status(200).json({ code: 404, message: "Candidate not found" });
    }

    if (candidate.job_role[0]?.org_id !== org_id) {
      return res.status(200).json({ code: 403, message: "You are not authorized to edit this candidate's status" });
    }


    const jobIndex = candidate.job_role.findIndex(job => job.job_id === job_id);

    if (jobIndex === -1) {
      return res.status(200).json({ code: 404, message: "Job not found in candidate's job roles" });
    }


    const walkinDate = candidate.job_role[jobIndex]?.walkin_date;


    const today = new Date().toISOString().split('T')[0];
    const walkinDateFormatted = new Date(walkinDate).toISOString().split('T')[0];

    if (walkinDateFormatted !== today) {
      return res.status(200).json({ code: 400, message: "Status can only be updated if the walk-in date is today" });
    }


    if (job_Status) {
      candidate.job_role[jobIndex].job_Status = job_Status;
    }

    if (candidate_Status) {
      candidate.job_role[jobIndex].candidate_Status = candidate_Status;
    }


    await candidate.save();

    return res.status(200).json({ code: 200, message: "Status updated successfully" });

  } catch (error) {
    console.error("Error updating status:", error.message);
    return res.status(200).json({ code: 500, message: error.message });
  }
};
