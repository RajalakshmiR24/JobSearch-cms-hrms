const express = require('express');
const fileUpload = require('express-fileupload');
const moment = require('moment');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const Assessment = require('../models/Assessments');

const Candidate = require('../models/candidate');
const HR = require('../models/hr');
const JobDetails = require('../models/JobDetails');


const app = express();
app.use(fileUpload());


const jobStatusDescription = (jobStatus) => {
  switch (jobStatus) {
    case 'SCHEDULED':
      return 'The candidate has been scheduled for the interview.';
    case 'RE-SCHEDULED':
      return 'The interview has been re-scheduled.';
    case 'COMPLETED':
      return 'The job has been completed.';
    case 'HIRED':
      return 'The candidate has been hired.';
    case 'SELECTED':
      return 'The candidate has been selected.';
    case 'REJECTED':
      return 'The candidate has been rejected.';
    case 'IN_PROGRESS':
      return 'The candidate is in progress.';
    default:
      return 'Status updated.';
  }
};




exports.handleExcelUpload = async (req, res) => {
  try {
    const hr_id = req.hr_id;
    let { excelData } = req.body;

    let results = { successCount: 0, errors: [] };
    let isExcelData = Array.isArray(excelData);

    if (isExcelData) {
      for (let record of excelData) {
        let { name, phone_number, job_role, candidate_Status, job_Status, walkin_date, files } = record;

        let parsedDate;


        if (walkin_date === 'NA' || !moment(walkin_date, 'DD-MM-YYYY', true).isValid()) {
          results.errors.push({
            record,
            error: `Invalid walkin date ${walkin_date}.`,
          });
          continue;
        } else {
          parsedDate = moment(walkin_date, 'DD-MM-YYYY').toDate();
        }

        let currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);


        let timeline;
        if (parsedDate.getTime() === currentDate.getTime()) {
          timeline = 'TODAY';
        } else if (parsedDate.getTime() > currentDate.getTime()) {
          timeline = 'UPCOMING';
        } else {
          timeline = 'PREVIOUS';
        }

        if (timeline === 'TODAY') {
          results.errors.push({
            record,
            error: 'Records with TODAY\'s date are not allowed to be saved.',
          });
          continue;
        }

        if (timeline === 'UPCOMING') {
          if (!candidate_Status) {
            candidate_Status = 'WAITING';
          }

          if (!job_Status) {
            job_Status = 'IN_PROGRESS';
          }
        }

        if (timeline === 'PREVIOUS') {
          if (!candidate_Status) {
            results.errors.push({
              record,
              error: 'Skipping record: Candidate status is required for PREVIOUS date.',
            });
            continue;
          }
          if (candidate_Status === 'PRESENT') {
            if (!job_Status) {
              results.errors.push({
                record,
                error: 'Job status is required when candidate status is PRESENT for PREVIOUS date.',
              });
              continue;
            }
          }

          if (candidate_Status === 'ABSENT') {
            job_Status = 'REJECTED';
            record.job_Status = job_Status;
            record.job_Status_Description = 'Candidate was absent; status set to REJECTED';
          }
        }

        const validStatuses = {
          TODAY: {
            candidate: ['PRESENT', 'ABSENT', 'RE-SCHEDULED', 'WAITING'],
            job: ['COMPLETED', 'HIRED', 'SELECTED', 'REJECTED', 'IN_PROGRESS'],
          },
          UPCOMING: {
            candidate: ['WAITING', 'RE-SCHEDULED'],
            job: ['IN_PROGRESS'],
          },
          PREVIOUS: {
            candidate: ['PRESENT', 'ABSENT'],
            job: ['COMPLETED', 'HIRED', 'SELECTED', 'REJECTED', 'IN_PROGRESS'],
          },
        };

        if (!validStatuses[timeline]) {
          return res.status(200).json({
            code: 400,
            message: 'Invalid timeline provided.',
          });
        }

        const { candidate: validCandidateStatuses, job: validJobStatuses } = validStatuses[timeline];

        if (!validCandidateStatuses.includes(candidate_Status)) {
          results.errors.push({
            record,
            error: `The candidate status ${candidate_Status} is not valid for the ${timeline} timeline.`,
          });
          continue;
        }

        if (job_Status && !validJobStatuses.includes(job_Status)) {
          results.errors.push({
            record,
            error: `The job status ${job_Status} is not valid for the ${timeline} timeline.`,
          });
          continue;
        }




        if (timeline === 'PREVIOUS') {
          if (!candidate_Status) {
            results.errors.push({
              record,
              error: 'Skipping record: Candidate status is required for PREVIOUS date.',
            });
            continue;
          }
          if (candidate_Status === 'PRESENT') {
            if (!job_Status) {
              results.errors.push({
                record,
                error: 'Job status is required when candidate status is PRESENT for PREVIOUS date.',
              });
              continue;
            }
          }

          if (candidate_Status === 'ABSENT') {
            job_Status = 'REJECTED';
            record.job_Status = job_Status;
            record.job_Status_Description = 'Candidate was absent; status set to REJECTED';
          }
        }

        try {
          let existingCandidate = await Candidate.findOne({ phone_number: phone_number });

          if (existingCandidate) {
            results.errors.push({
              record,
              error: `A candidate with the phone number ${phone_number} already exists.`,
            });
            continue;
          }

          let hashedPhoneNumber = crypto.createHash('sha256').update(phone_number.toString()).digest('hex');

          let newCandidate = new Candidate({
            name,
            phone_number,
            hash: hashedPhoneNumber,
            job_role,
            candidate_Status,
            job_Status,
            description: jobStatusDescription(job_Status),
            walkin_date: parsedDate,
            scheduled_date: parsedDate,
            timeline: timeline,
            invited: true,
            hr_id: hr_id
          });

          if (files && files.length > 0) {
            newCandidate.files = files.map(file => {
              file.file_id = file.file_id || uuidv4();
              return file;
            });
          }

          await newCandidate.save();
          results.successCount += 1;

        } catch (dbError) {
          results.errors.push({
            record,
            error: `Database error: ${dbError.message}`,
          });
        }
      }
    } else {
      return res.status(200).json({
        code: 400,
        message: 'Invalid data format. Please provide either form data or excel data.',
      });
    }

    res.status(201).json({
      message: "Data processing complete.",
      successCount: results.successCount,
      errors: results.errors,
    });

  } catch (error) {
    console.error(error.message);

    res.status(200).json({
      code: 500,
      message: error.message
    });
  }
};


exports.uploadCandidateResume = async (req, res) => {
  const hash = req.hash;
  const hr_id = req.hr_id;
  const org_id = req.organization_id;

  const { filename, contentType, data, candidate_id, } = req.body;


  if (!filename || !contentType || !data || !hash || !candidate_id) {
    return res.status(200).json({ code: 400, error: 'All fields are required' });
  }

  try {

    const Hr = await HR.findOne({ hash });
    if (!Hr) {
      return res.status(200).json({ code: 404, error: 'HR not found or invalid hash' });
    }


    const candidate = await Candidate.findOne({ candidate_id });
    if (!candidate) {
      return res.status(200).json({ code: 404, error: 'Candidate not found' });
    }


    const newFile = {
      filename,
      contentType,
      data,
      file_id: uuidv4(),
      hr_id: hr_id,
      org_id: org_id,
    };


    candidate.files.push(newFile);


    await candidate.save();


    res.status(201).json({
      code: 201,
      message: 'File uploaded successfully',
      file: newFile,
    });
  } catch (error) {
    console.error(error.message);

    res.status(200).json({ code: 500, error: error.message });
  }
};

exports.getJobRolesAndStatuses = async (req, res) => {
  try {
    const hr_id = req.hr_id;


    const jobRoles = await JobDetails.find({ hr_id: hr_id }).select('job_id postingTitle title');
    const jobRolesArray = jobRoles.map(job => ({
      job_id: job.job_id,
      postingTitle: job.postingTitle,
      job_title: job.title
    }));


    const candidateStatuses = Candidate.schema.path('job_role.candidate_Status').enumValues;
    const jobStatuses = Candidate.schema.path('job_role.job_Status').enumValues;

    const enums = {
      available_job_roles: jobRolesArray,
      available_candidate_statuses: candidateStatuses,
      available_job_statuses: jobStatuses,
    };

    return res.status(200).json({
      success: true,
      message: 'Enums and job roles fetched successfully.',
      data: enums,
    });
  } catch (error) {
    console.error(error.message);

    return res.status(200).json({
      code: 500,
      success: false,
      error: error.message,
    });
  }
};

exports.createSingleCandidate = async (req, res) => {
  const hr_id = req.hr_id;
  const org_id = req.organization_id;

  const { name, phone_number, walkin_date, walkin_time, job_role, candidate_Status, job_Status } = req.body;


  if (!name || !phone_number || !walkin_date || !walkin_time || !job_role.job_id || !job_role.postingTitle || !job_role.job_title || !candidate_Status || !job_Status) {
    return res.status(200).json({ code: 400, error: 'All fields are required' });
  }

  let timeline;
  const inputDate = new Date(`${walkin_date}T${walkin_time}:00.000Z`);
  const currentDate = new Date();

  const hashedPhoneNumber = crypto.createHash('sha256').update(phone_number).digest('hex');

  try {

    const candidateExist = await Candidate.findOne({ phone_number: phone_number });
    if (candidateExist) {
      return res.status(200).json({ code: 400, error: 'Phone number already exists in Candidate data.' });
    }


    const hrExist = await HR.findOne({ phone_number: phone_number });
    if (hrExist) {
      return res.status(200).json({ code: 400, error: 'Phone number already exists in HR schema' });
    }


    let dateDifference = currentDate.getTime() - inputDate.getTime();

    if (dateDifference === 0) {
      timeline = 'TODAY';
    } else if (dateDifference > 0) {
      timeline = 'PREVIOUS';
    } else {
      timeline = 'UPCOMING';
    }

    if (timeline === 'TODAY') {
      return res.status(200).json({ code: 400, error: 'Creating candidates for today or with "TODAY" timeline is not allowed.' });
    }

    const jobRoleData = {
      job_id: job_role.job_id,
      job_title: job_role.job_title,
      postingTitle: job_role.postingTitle,
      hr_ids: job_role[0]?.hr_ids || [hr_id],
      org_id: org_id,
      applicationStatus: "Applied",
      walkin_date: inputDate,
      timeline,
    };

    const candidate = new Candidate({
      hash: hashedPhoneNumber,
      name,
      phone_number,
      job_role: [jobRoleData],
      invited: true,
      hr_id: hr_id,
      org_id: org_id,
      candidate_Status,
      job_Status,
    });
    await candidate.save();
    res.status(201).json({
      code: 201,
      message: 'New candidate created successfully',
    });
  } catch (error) {
    console.error(error.message);
    res.status(200).json({ code: 500, error: error.message });
  }
};


exports.InviteCandidate = async (req, res) => {
  try {
    const { candidate_id, job_role, walkin_date, walkin_time } = req.body;
    const hr_id = req.hr_id;
    const org_id = req.organization_id;


    if (!candidate_id || !job_role.job_id || !job_role.job_title || !job_role.postingTitle || !walkin_date || !walkin_time) {
      return res.status(200).json({ code: 400, message: 'Required fields are missing' });
    }


    if (!job_role || job_role.length === 0) {
      return res.status(200).json({ code: 400, message: 'Job role is required' });
    }

    const { job_id, job_title, postingTitle } = job_role;
    console.log(job_id, "job_id");



    const inputDate = new Date(`${walkin_date}T${walkin_time}:00.000Z`);
    const currentDate = new Date();
    let timeline;

    let dateDifference = currentDate.getTime() - inputDate.getTime();
    if (dateDifference === 0) {
      timeline = 'TODAY';
    } else if (dateDifference > 0) {
      timeline = 'PREVIOUS';
    } else {
      timeline = 'UPCOMING';
    }


    if (timeline === 'TODAY') {
      return res.status(200).json({ code: 400, message: 'Inviting candidates for today or with "TODAY" timeline is not allowed.' });
    }


    const candidate = await Candidate.findOne({ candidate_id });
    if (!candidate) {
      return res.status(200).json({ code: 404, message: 'Candidate not found' });
    }


    const jobAlreadyApplied = candidate.job_role.some(job => job.job_id === job_id);
    if (jobAlreadyApplied) {
      return res.status(200).json({ code: 400, message: 'Candidate has already applied for this job' });
    }
    const alreadyInvited = candidate.invited_by_org.some(job => job.job_id === job_id);
    if (alreadyInvited) {
      return res.status(200).json({ code: 400, message: 'This candidate has already been invited to apply for this job' });
    }

    const invitation = {
      job_id,
      job_title,
      postingTitle,
      hr_id,
      org_id,
      walkin_date: inputDate,
      candidate_Status: 'WAITING',
      job_Status: 'IN_PROGRESS',
      accepted: false,
      timeline,
    };


    candidate.invited_by_org.push(invitation);


    await candidate.save();


    return res.status(200).json({
      code: 200,
      message: 'Candidate invited successfully',
    });
  } catch (error) {
    console.error('Error inviting candidate:', error.message);
    return res.status(200).json({ code: 500, message: error.message });
  }
};


exports.getAllHR = async (req, res) => {
  try {


    const hr_id = req.hr_id;
    const hrPosition = req.position;
    const orgName = req.organization_name;
    let query = {};


    if (hrPosition !== 'ZustPe_HR' && hr_id) {
      query.$or = [
        { hr_id: hr_id },
        { invited_by: hr_id },
      ];


    }



    let hrRecords = await HR.find(query)
      .select('-hash -_id -files._id -__v -updatedAt -role -createdAt -invited_by -organization_id -org_status -organization_website -organization_address ');




    if (hrPosition === 'ZustPe_HR') {
      hrRecords = hrRecords.filter(record => record.position !== 'ZustPe_HR');

    }
    if (hrPosition === 'HR Administrator') {
      hrRecords = hrRecords.filter(record => record.position !== 'HR Administrator');

    }

    if (hrRecords.length === 0) {

      return res.status(200).json({ code: 400, message: 'No HR records found', orgName });
    }


    return res.status(200).json({ hrRecords, hrPosition, orgName });

  } catch (error) {
    console.error('Error occurred:', error.message);
    return res.status(200).json({ code: 500, message: error.message });
  }
};

exports.createJobRole = async (req, res) => {
  try {
    const hr_id = req.hr_id;
    const org_id = req.organization_id;

    const {
      postingTitle,
      title,
      departmentName,
      hiringManager,
      numOfPositions,
      targetDate,
      dateOpened,
      jobOpeningStatus,
      jobType,
      industry,
      workExp,
      minSalary,
      maxSalary,
      requiredSkills,
      address,
      notes,
      isPhoneNumberVisible,
      job_title,  
      other_job_title 
    } = req.body;

    
    if (job_title === 'Others' && !other_job_title) {
      return res.status(400).json({
        code: 400,
        error: 'Please provide a custom job title when "Others" is selected.'
      });
    }

    const existingPosting = await JobDetails.findOne({
      hr_id: hr_id,
      postingTitle: postingTitle,
    });

    if (existingPosting) {
      return res.status(400).json({
        code: 400,
        error: 'Posting Title must be unique for this HR.',
      });
    }

    const newJobDetail = new JobDetails({
      postingTitle,
      title,
      departmentName,
      hiringManager,
      numOfPositions,
      numOfOpenings: numOfPositions,
      targetDate,
      dateOpened,
      jobOpeningStatus,
      jobType,
      industry,
      workExp,
      minSalary,
      maxSalary,
      requiredSkills,
      address,
      notes,
      hr_id: hr_id,
      org_id: org_id,
      isPhoneNumberVisible,
      job_title,  
      other_job_title 
    });

    await newJobDetail.save();

    return res.status(201).json({
      code: 201,
      success: true,
      message: 'Job Details created successfully.',
    });
  } catch (error) {
    console.error('Error creating job details:', error.message);
    return res.status(500).json({
      code: 500,
      error: error.message,
    });
  }
};


exports.editJobRole = async (req, res) => {
  try {
    const hr_id = req.hr_id;
    const org_id = req.organization_id;

    const { jobId } = req.body;

    const {
      postingTitle,
      title,
      departmentName,
      hiringManager,
      numOfPositions,
      targetDate,
      dateOpened,
      jobOpeningStatus,
      jobType,
      industry,
      workExp,
      minSalary,
      maxSalary,
      requiredSkills,
      address,
      notes,
      isPhoneNumberVisible,
    } = req.body;

    const existingJobDetail = await JobDetails.findOne({
      job_id: jobId,
      hr_id: hr_id,
      org_id: org_id,
    });

    if (!existingJobDetail) {
      return res.status(200).json({
        code: 404,
        error: 'Job Role not found.',
      });
    }

    const validStatus = ["pending", "closed", "completed", "open"];
    const statusChanged = validStatus.includes(jobOpeningStatus.toLowerCase());

    if (statusChanged) {
      if (["Pending", "Closed", "Completed"].includes(jobOpeningStatus)) {

        existingJobDetail.deleteFlag = true;
        existingJobDetail.job_status = "inactive";
      } else if (jobOpeningStatus === "Open") {

        existingJobDetail.deleteFlag = false;
        existingJobDetail.job_status = "active";
      }
    }


    existingJobDetail.postingTitle = postingTitle || existingJobDetail.postingTitle;
    existingJobDetail.title = title || existingJobDetail.title;
    existingJobDetail.departmentName = departmentName || existingJobDetail.departmentName;
    existingJobDetail.hiringManager = hiringManager || existingJobDetail.hiringManager;
    existingJobDetail.numOfPositions = numOfPositions || existingJobDetail.numOfPositions;
    existingJobDetail.numOfOpenings = numOfPositions || existingJobDetail.numOfOpenings;
    existingJobDetail.targetDate = targetDate || existingJobDetail.targetDate;
    existingJobDetail.dateOpened = dateOpened || existingJobDetail.dateOpened;
    existingJobDetail.jobOpeningStatus = jobOpeningStatus || existingJobDetail.jobOpeningStatus;
    existingJobDetail.jobType = jobType || existingJobDetail.jobType;
    existingJobDetail.industry = industry || existingJobDetail.industry;
    existingJobDetail.workExp = workExp || existingJobDetail.workExp;
    existingJobDetail.minSalary = minSalary || existingJobDetail.minSalary;
    existingJobDetail.maxSalary = maxSalary || existingJobDetail.maxSalary;
    existingJobDetail.requiredSkills = requiredSkills || existingJobDetail.requiredSkills;
    existingJobDetail.address = address || existingJobDetail.address;
    existingJobDetail.notes = notes || existingJobDetail.notes;
    existingJobDetail.isPhoneNumberVisible = isPhoneNumberVisible !== undefined ? isPhoneNumberVisible : existingJobDetail.isPhoneNumberVisible;


    await existingJobDetail.save();

    return res.status(200).json({
      success: true,
      message: 'Job Details updated successfully.',
    });
  } catch (error) {
    console.error('Error updating job details:', error.message);
    return res.status(200).json({
      code: 500,
      error: error.message,
    });
  }
};


exports.updateStatusToSuspended = async (req, res) => {
  try {
    const { hr_id } = req.body;
    const shr_id = req.hr_id;
    const sposition = req.position;


    const existingHRWithHash = await HR.findOne({ hr_id: shr_id });

    if (!existingHRWithHash) {
      return res.status(200).json({
        message: 'Invalid hash. No HR found.',
      });
    }

    if (existingHRWithHash.position !== sposition) {
      return res.status(200).json({
        message: `Only the position ${sposition} can delete this HR record.`,
      });
    }


    const updatedHR = await HR.findOneAndUpdate(
      { hr_id },
      { hr_status: 'suspended' },
      { new: true }
    );

    if (!updatedHR) {
      return res.status(200).json({ code: 404, message: 'HR not found' });
    }

    return res.status(200).json({
      code: 200,
      message: 'HR status updated to suspended',
    });
  } catch (err) {
    console.error(err.message);
    return res.status(200).json({ code: 500, message: 'Server error', error: err.message });
  }
};

exports.updateJobDetailsStatusToSuspended = async (req, res) => {
  try {
    const { job_id } = req.body;
    const shr_id = req.hr_id;

    const existingHRWithHash = await JobDetails.findOne({ hr_id: shr_id });

    if (!existingHRWithHash) {
      return res.status(200).json({
        message: 'Invalid hash. No HR found.',
      });
    }

    const updatedJobDetails = await JobDetails.findOneAndUpdate(
      { job_id },
      {
        jobOpeningStatus: 'Closed',
        job_status: 'inactive',
        deleteFlag: true,
      },
      { new: true }
    );

    if (!updatedJobDetails) {
      return res.status(200).json({ code: 404, message: 'Job not found' });
    }

    return res.status(200).json({
      code: 200,
      message: 'Job status updated to suspended and deleteFlag set to true',
    });
  } catch (err) {
    console.error(err.message);
    return res.status(200).json({ code: 500, message: 'Server error', error: err.message });
  }
};


exports.createHRDetails = async (req, res) => {
  try {
    const invited_by = req.hr_id;
    const { phone_number, name, email } = req.body;

    if (!name || !email || !phone_number) {
      return res.status(200).json({ code: 400, message: 'Name, email, and phone number are required.' });
    }

    const phoneRegex = /^[6-9][0-9]{9}$/;
    if (!phoneRegex.test(phone_number)) {
      return res.status(200).json({ code: 400, message: 'Phone number must start with 6, 7, 8, or 9 and be 10 digits long.' });
    }

    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailRegex.test(email)) {
      return res.status(200).json({ code: 400, message: 'Please enter a valid email address.' });
    }

    const hash = req.hash;
    const organizationName = req.organization_name;
    const organizationAddress = req.organization_address;
    const organizationPhNo = req.phone_number;
    const organizationEmail = req.email;
    const organizationId = req.organization_id

    const organizationWebsite = req.organization_website;
    const existingHRWithHash = await HR.findOne({ hash });

    if (!existingHRWithHash) {
      return res.status(200).json({
        code: 400,
        message: 'Invalid hash. No HR found.',
      });
    }


    if (existingHRWithHash.position === 'HR') {
      return res.status(200).json({
        code: 400,
        message: 'An HR with position "HR" cannot create another HR.',
      });
    }


    const [existingHR, existingCandidateEmail, existingHRPhone, existingCandidatePhone] = await Promise.all([
      HR.findOne({ email }),
      Candidate.findOne({ email }),
      HR.findOne({ phone_number }),
      Candidate.findOne({ phone_number }),
    ]);

    if (existingHR) {
      return res.status(200).json({ code: 400, message: 'Email already exists in HR.' });
    }
    if (existingCandidateEmail) {
      return res.status(200).json({ code: 400, message: 'Email already exists in Candidate.' });
    }
    if (existingHRPhone) {
      return res.status(200).json({ code: 400, message: 'Phone number already exists in HR.' });
    }
    if (existingCandidatePhone) {
      return res.status(200).json({ code: 400, message: 'Phone number already exists in Candidate.' });
    }


    const hashedPhoneNumber = crypto.createHash('sha256').update(phone_number).digest('hex');


    const newHR = new HR({
      phone_number,
      hash: hashedPhoneNumber,
      name,
      email,
      position: 'HR',
      organization_name: organizationName,
      organization_address: organizationAddress,
      organization_contact: { phone_number: organizationPhNo, email: organizationEmail },
      organization_website: organizationWebsite,
      organization_id: organizationId,

      status: 'active',
      invited_by: invited_by,
    });


    await newHR.save();

    res.status(201).json({
      message: 'HR details created successfully.',
    });
  } catch (error) {
    console.error('Error creating HR details:', error.message);
    res.status(200).json({ code: 500, error: error.message });
  }
};



exports.updateHRDetailsAndStatus = async (req, res) => {
  try {
    const { hr_id, name, email, phone_number, hr_status } = req.body;

    if (!hr_id) {
      return res.status(200).json({ code: 400, message: 'HR ID is required.' });
    }

    const hrRecord = await HR.findOne({ hr_id });

    if (!hrRecord) {
      return res.status(200).json({ code: 404, message: 'HR record not found.' });
    }


    if (email || phone_number) {
      const [existingHR, existingCandidateEmail, existingHRPhone, existingCandidatePhone] = await Promise.all([
        HR.findOne({ email }),
        Candidate.findOne({ email }),
        HR.findOne({ phone_number }),
        Candidate.findOne({ phone_number }),
      ]);

      if (existingHR && existingHR.email !== hrRecord.email) {
        return res.status(200).json({ code: 400, message: 'Email already exists in HR.' });
      }
      if (existingCandidateEmail) {
        return res.status(200).json({ code: 400, message: 'Email already exists in Candidate.' });
      }
      if (existingHRPhone && existingHRPhone.phone_number !== hrRecord.phone_number) {
        return res.status(200).json({ code: 400, message: 'Phone number already exists in HR.' });
      }
      if (existingCandidatePhone) {
        return res.status(200).json({ code: 400, message: 'Phone number already exists in Candidate.' });
      }
    }

    if (name || email || phone_number) {
      if (!name || !email || !phone_number) {
        return res.status(200).json({ code: 400, message: 'Name, email, and phone number are required for updating details.' });
      }

      const phoneRegex = /^[6-9][0-9]{9}$/;
      if (!phoneRegex.test(phone_number)) {
        return res.status(200).json({ code: 400, message: 'Phone number must start with 6, 7, 8, or 9 and be 10 digits long.' });
      }

      const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
      if (!emailRegex.test(email)) {
        return res.status(200).json({ code: 400, message: 'Please enter a valid email address.' });
      }

      if (name) hrRecord.name = name;
      if (email) hrRecord.email = email;

      if (phone_number) {
        hrRecord.phone_number = phone_number;

        const hashedPhoneNumber = crypto.createHash('sha256').update(phone_number).digest('hex');
        hrRecord.hash = hashedPhoneNumber;
      }
    }

    if (hr_status !== undefined) {
      const allowedStatuses = ['active', 'suspended', 'inactive'];
      if (!allowedStatuses.includes(hr_status)) {
        return res.status(200).json({ code: 400, message: 'Invalid HR status provided.' });
      }
      hrRecord.hr_status = hr_status;
    }

    await hrRecord.save();

    res.status(200).json({
      message: 'HR details and/or status updated successfully.',
    });

  } catch (error) {
    console.error('Error updating HR details or status:', error.message);
    res.status(200).json({ code: 500, error: error.message });
  }
};




exports.getAllJobsByHR = async (req, res) => {
  try {
    const { hrId } = req.body;

    if (!hrId) {
      return res.status(200).json({
        code: 400,
        error: 'HR ID is required',
      });
    }

    const jobDetails = await JobDetails.find({ hr_id: hrId }).select('-hash -_id -files._id -__v -updatedAt -createdAt');

    if (!jobDetails || jobDetails.length === 0) {
      return res.status(200).json({
        code: 400,
        error: 'No job found',
      });
    }

    return res.status(200).json({
      code: 200, data: jobDetails,
    });
  } catch (error) {
    console.error('Error fetching job details:', error.message);
    return res.status(200).json({
      code: 500, error: error.message,
    });
  }
};

exports.getOrganization = async (req, res) => {
  try {
    const organization_address = req.organization_address;
    const organization_name = req.organization_name;
    const organization_email = req.organization_email;
    const organization_website = req.organization_website;
    const org_status = req.org_status;
    const org_join_date = req.org_join_date;

    const organization = {
      organization_name: organization_name,
      organization_address: organization_address,
      organization_email: organization_email,
      organization_website: organization_website,
      org_status: org_status,
      org_join_date: org_join_date,
    };

    return res.status(200).json({ organization });
  } catch (error) {
    console.error(error.message);
    return res.status(200).json({ code: 500, error: error.message });
  }
};



exports.getAdminDashboard = async (req, res) => {
  try {
    const { role, name: HRname, position: HRposition, organization_id } = req;


    const upcomingInterviews = await JobDetails.aggregate([
      {
        $match: {
          org_id: organization_id,
          jobOpeningStatus: 'Open',
          targetDate: { $gt: new Date() },
          deleteFlag: false
        }
      },
      {
        $project: {
          numOfPositions: 1,
          job_id: 1,
          postingTitle: 1,
          numOfOpenings: 1,
          targetDate: 1,
          jobOpeningStatus: 1,
          _id: 0,
        }
      }
    ]);


    const completedInterviews = await JobDetails.aggregate([
      {
        $match: {
          org_id: organization_id,
          jobOpeningStatus: 'Completed',
          deleteFlag: false
        }
      },
      {
        $project: {
          numOfPositions: 1,
          job_id: 1,
          postingTitle: 1,
          numOfOpenings: 1,
          targetDate: 1,
          jobOpeningStatus: 1,
          _id: 0,
        }
      }
    ]);


    const allJobDetails = await JobDetails.aggregate([
      {
        $match: {
          org_id: organization_id,
          deleteFlag: false
        }
      },
      {
        $project: {
          numOfPositions: 1,
          job_id: 1,
          postingTitle: 1,
          numOfOpenings: 1,
          targetDate: 1,
          jobOpeningStatus: 1,
          _id: 0,
        }
      }
    ]);


    res.status(200).json({
      code: 200,
      message: "Dashboard data fetched successfully",
      allJobDetails,
      upcomingInterviews,
      completedInterviews,
      HRname,
      HRposition,
      role
    });

  } catch (error) {
    console.error("Error fetching job details:", error);
    res.status(200).json({
      message: "Error fetching data",
      error: error.message
    });
  }
};

exports.updateWalkinDetails = async (req, res) => {
  try {
    const { candidate_id, job_id, walkin_date, walkin_time } = req.body;
    const { hr_id, org_id } = req;

    if (!candidate_id || !job_id || !walkin_date || !walkin_time) {
      return res.status(200).json({ code: 400, message: 'Required fields are missing' });
    }

    const inputDate = new Date(`${walkin_date}T${walkin_time}:00.000Z`);
    if (isNaN(inputDate)) {
      return res.status(200).json({ code: 400, message: 'Invalid date or time format' });
    }

    const candidate = await Candidate.findOne({ candidate_id: candidate_id });

    if (!candidate) {
      return res.status(200).json({ code: 404, message: 'Candidate not found' });
    }

    const jobIndex = candidate.job_role.findIndex(job => job.job_id === job_id);

    if (jobIndex === -1) {
      return res.status(200).json({ code: 404, message: 'Job role not found for this candidate' });
    }

    const job = candidate.job_role[jobIndex];
    if (job.organization_id !== org_id) {
      return res.status(200).json({ code: 403, message: 'You do not have permission to update this job role' });
    }

    if (walkin_date) {
      candidate.job_role[jobIndex].walkin_date = inputDate;
      candidate.job_role[jobIndex].job_Status = 'SHORTLISTED';
    }


    console.log('Candidate job_role before save:', candidate.job_role);

    candidate.markModified('job_role');
    await candidate.save();

    return res.status(200).json({ code: 200, message: 'Walk-in details updated successfully' });

  } catch (error) {
    console.error('Error updating walk-in details:', error.message);
    return res.status(200).json({ code: 500, message: error.message });
  }
};

const getEnumValues = (path, model) => {
  const schemaPath = model.schema.path(path);
  if (!schemaPath) {
    return [];
  }
  if (!schemaPath.enumValues) {
    return [];
  }
  return schemaPath.enumValues;
};

exports.getEnums = (req, res) => {
  try {
    const enums = {};
    enums.assessmentType = getEnumValues('assessment_type', Assessment);
    enums.questionType = getEnumValues('questions.question_type', Assessment);

    return res.status(200).json({
      code: 200,
      success: true,
      enums,
    });
  } catch (error) {
    return res.status(200).json({
      code: 500,
      success: false,
      message: "Error retrieving enums",
      error: error.message,
    });
  }
};


exports.createAssessment = async (req, res) => {
  try {
    const hr_id = req.hr_id;
    const org_id = req.organization_id;

    
    const { job_id, assessment_title, assessment_type, description, questions, deadline_date, deadline_time } = req.body;

    
    if (!job_id || !assessment_title || !assessment_type || !description || !deadline_date || !deadline_time) {
      return res.status(200).json({ code: 400, message: "All fields are required." });
    }

    
    const existingAssessment = await Assessment.findOne({ hr_id, assessment_title });
    if (existingAssessment) {
      return res.status(200).json({ code: 400, message: "Assessment title must be unique." });
    }

    
    const updatedQuestions = questions.map((question) => ({
      ...question,
      isRequired: question.isRequired !== undefined ? question.isRequired : false,
      options: question.options.map((option) => ({
        ...option,
        is_correct: option.is_correct === "on" ? true : false,
      }))
    }));

    
    const newAssessment = new Assessment({
      hr_id,
      job_id,
      org_id,
      assessment_title,
      assessment_type,
      description,
      questions: updatedQuestions,
      deadline: new Date(`${deadline_date}T${deadline_time}:00.000+00:00`),
    });

    
    await newAssessment.save();

    
    res.status(201).json({ code: 201, message: "Assessment created successfully." });
  } catch (error) {
    res.status(200).json({ code: 500, message: error.message });
  }
};


exports.getAllAssessments = async (req, res) => {
  try {
    const { hr_id, organization_id } = req; 
    const { job_id } = req.body; 
    if (!job_id) {
      return res.status(400).json({ code: 400, message: "Job Id required." });
    }

    const assessments = await Assessment.find({
      hr_id: hr_id,
      org_id: organization_id,
      job_id: job_id,
    });

    if (assessments.length > 0) {
      res.status(200).json({code:200,assessments});
    } else {
      res.status(404).json({ code: 404, message: 'No assessments found for the given criteria.' });
    }
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
};



exports.getAssessmentById = async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id);
    if (!assessment) {
      return res.status(404).json({ message: 'Assessment not found' });
    }
    res.status(200).json(assessment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


exports.updateAssessment = async (req, res) => {
  try {
    const updatedAssessment = await Assessment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedAssessment) {
      return res.status(404).json({ message: 'Assessment not found' });
    }
    res.status(200).json(updatedAssessment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


exports.deleteAssessment = async (req, res) => {
  try {
    const deletedAssessment = await Assessment.findByIdAndDelete(req.params.id);
    if (!deletedAssessment) {
      return res.status(404).json({ message: 'Assessment not found' });
    }
    res.status(200).json({ message: 'Assessment deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

