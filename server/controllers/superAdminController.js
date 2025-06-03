const HR = require("../models/Hr");
const Candidate = require("../models/Candidate");

const JobDetails = require("../models/JobDetails");
const SuperAdmin = require("../models/SuperAdmin");
const crypto = require('crypto');

exports.createOrgDetails = async (req, res) => {
    try {
        const { phone_number, name, email, position, organization_name, organization_address, organization_contact, organization_website } = req.body;
        const { hash } = req;
        const invited_by = req.hr_id;
        const existingHRWithHash = await SuperAdmin.findOne({ hash });
        
        if (!existingHRWithHash) {
            return res.status(200).json({
                message: 'Invalid hash. No HR found.',
            });
        }

        if (existingHRWithHash.role !== "superAdmin") {
            return res.status(200).json({
                message: 'Only an HR with position "HR Administrator" can create new HRs.',
            });
        }

        if (position === "HR") {
            return res.status(200).json({
                message: 'SuperAdmin cannot create an HR with the "HR" position. You can create an "HR Administrator" instead.',

            });
        }

        const [existingHR, existingCandidateEmail, existingHRPhone, existingCandidatePhone] = await Promise.all([
            HR.findOne({ email }),
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
            position,
            organization_name,
            organization_address,
            organization_contact,
            organization_website,
            hr_status: 'active',
            org_status: 'active',
            invited_by: invited_by
        });

        await newHR.save();

        res.status(201).json({
            message: 'HR details created successfully.',
        });
    } catch (error) {
        console.error(error.message);

        res.status(200).json({ code: 500, message: error.message });
    }
};



exports.editOrgDetails = async (req, res) => {
    try {
        const { orgId, organization_name, organization_address, organization_contact, organization_website } = req.body;
        const { hash } = req;
        
        const existingHRWithHash = await SuperAdmin.findOne({ hash });
        
        if (!existingHRWithHash) {
            return res.status(200).json({ code:400,message: 'Invalid hash. No HR found.' });
        }

        
        if (existingHRWithHash.role !== 'superAdmin') {
            return res.status(200).json({ code:403,message: 'Only SuperAdmin can edit organization details.' });
        }

        
        const org = await HR.findOne({ organization_id: orgId });
        if (!org) {
            return res.status(200).json({ code:404,message: 'Organization not found.' });
        }

        
        org.organization_name = organization_name || org.organization_name;
        org.organization_address = organization_address || org.organization_address;
        org.organization_contact = organization_contact || org.organization_contact;
        org.organization_website = organization_website || org.organization_website;
        
        await org.save();

        res.status(200).json({ message: 'Organization details updated successfully.' });
    } catch (error) {
        console.error(error.message);
        res.status(200).json({code:500, message: error.message });
    }
};




exports.editAdminDetails = async (req, res) => {
    try {
        const { hrId, name, email, phone_number } = req.body;
        const { hash } = req;
        
        
        const existingHRWithHash = await SuperAdmin.findOne({ hash });
        
        if (!existingHRWithHash) {
            return res.status(200).json({code:400, message: 'Invalid hash. No HR found.' });
        }

        
        if (existingHRWithHash.role !== 'superAdmin') {
            return res.status(200).json({ code:403,message: 'Only SuperAdmin can edit admin details.' });
        }

        
        const admin = await HR.findOne({ hr_id: hrId });
        if (!admin) {
            return res.status(200).json({ code:404,message: 'Admin not found.' });
        }

        
        if (phone_number) {
            const [existingHRPhone, existingCandidatePhone] = await Promise.all([
                HR.findOne({ phone_number }),
                Candidate.findOne({ phone_number }),
            ]);

            if (existingHRPhone) {
                return res.status(200).json({code:400, message: 'Phone number already exists in HR.' });
            }
            if (existingCandidatePhone) {
                return res.status(200).json({code:400, message: 'Phone number already exists in Candidate.' });
            }

            
            admin.phone_number = phone_number;
            admin.hash = crypto.createHash('sha256').update(phone_number).digest('hex');
        }

        
        admin.name = name || admin.name;
        admin.email = email || admin.email;

        
        await admin.save();

        res.status(200).json({ code:200,message: 'Admin details updated successfully.' });
    } catch (error) {
        console.error(error.message);
        res.status(200).json({ code:500,message: error.message });
    }
};



exports.UpdateStatusOrgBySuperAdmin = async (req, res) => {
    try {
        const hash = req.hash;
      const {  org_id, status } = req.body;  
      const invited_by = req.hr_id;  
  
      
      const existingHRWithHash = await SuperAdmin.findOne({ hash });
  
      if (!existingHRWithHash) {
        return res.status(200).json({
          message: 'Invalid hash. No HR found.',
        });
      }
  
      if (existingHRWithHash.role !== "superAdmin") {
        return res.status(200).json({
          message: 'Only an HR with position "superAdmin" can update organization status.',
        });
      }
  
      
      const orgRecord = await HR.findOne({ organization_id: org_id });
  
      if (!orgRecord) {
        return res.status(200).json({
            code:404,
          message: 'Organization not found.',
        });
      }
  
      
      if (status === 'active' && orgRecord.org_status === 'inactive') {
        orgRecord.org_status = 'active';  
        orgRecord.hr_status = 'active';   
        orgRecord.invited_by = invited_by;  
  
        await orgRecord.save();
  
        return res.status(200).json({
          message: 'Organization status updated to active successfully.',
        });
      } else {
        return res.status(200).json({
          message: 'The organization is already active or status change is unnecessary.',
        });
      }
  
    } catch (error) {
      console.error(error.message);
      res.status(200).json({ code: 500, message: error.message });
    }
  };
  

exports.getAllOrg = async (req, res) => {
    try {

        const hrPosition = req.position;
        const hrRecords = await HR.find(
            { position: { $ne: 'HR' } },
            {
                _id: 0,
                hash: 0,
                'files._id': 0,
                __v: 0,
                updatedAt: 0,
                createdAt: 0,
                invited_by: 0,
                role: 0
            }
        );

        if (hrRecords.length === 0) {
            return res.status(200).json({ code: 400, message: 'No Organization records found', hrPosition });
        }

        return res.status(200).json({ hrRecords, hrPosition });
    } catch (error) {
        console.error(error.message);
        return res.status(200).json({ code: 500, message: error.message });
    }
};

exports.getHRByOrganizationId = async (req, res) => {
    try {
        const { orgId } = req.body;

        if (!orgId) {
            return res.status(200).json({ code: 400, message: 'Organization ID is required.' });
        }
        const hrList = await HR.find({
            organization_id: orgId,
            position: 'HR'
        }).select({
            _id: 0,
            hash: 0,
            'files._id': 0,
            __v: 0,
            updatedAt: 0,
            createdAt: 0,
            hr_id: 0,
            invited_by: 0,
            role: 0,
            organization_contact: 0,
            organization_name: 0,
            organization_website: 0,
            organization_address: 0,
            organization_id: 0,
            org_status: 0
        });

        if (hrList.length === 0) {
            return res.status(200).json({ code: 404, message: 'No HR records found for this organization.' });
        }

        return res.status(200).json(hrList);
    } catch (error) {
        console.error('Error fetching HR records:', error.message);
        return res.status(200).json({ code: 500, message: error.message });
    }
};

exports.getCandidateDetailsByOrgId = async (req, res) => {
    try {
        const { orgId } = req.body;

        const candidateDetails = await Candidate.find({
            'job_role.org_id': orgId
        })
            .select(
                ' -_id -hash -__v -hr_id -updatedAt -createdAt -org_id -job_role._id -job_role.job_id'
            )
            .sort({ createdAt: 1 });

        if (!candidateDetails || candidateDetails.length === 0) {
            return res.status(200).json({ code: 404, error: 'No candidate details found for the given organization ID' });
        }
        return res.status(200).json({ code: 200, candidateDetails });

    } catch (error) {
    console.error(error.message);

        return res.status(200).json({ code: 500, error: error.message });
    }
};


exports.getJobDetailsByOrgId = async (req, res) => {
    try {
        const { orgId } = req.body;

        const jobDetails = await JobDetails.find({ org_id: orgId }).select(
            '-hiringManager.hr_id -hash -role  -_id -__v -hr_id -updatedAt -createdAt -org_id'
        );

        if (!jobDetails || jobDetails.length === 0) {
            return res.status(200).json({ code: 404, error: 'No job details found for the given organization ID' });
        }


        return res.status(200).json({ code: 200, jobDetails });

    } catch (error) {
    console.error(error.message);

        return res.status(200).json({ code: 500, error: error.message });
    }
};

exports.getPositions = (req, res) => {
    const positions = HR.schema.paths.position.enumValues;
    const filteredPositions = positions.filter(position => position !== 'HR' && position !== 'ZustPe_HR');

    return res.status(200).json({
        success: true,
        positions: filteredPositions,
    });
};

exports.updateStatusOrgSuspended = async (req, res) => {
    try {
        const { org_id } = req.body;
        const role = req.role;


        if (role !== 'superAdmin') {
            return res.status(200).json({
                code: 403,
                message: 'Unauthorized. Only superAdmin can update the status.',
            });
        }


        const existingHRWithHash = await HR.findOne({ organization_id: org_id });
        if (!existingHRWithHash) {
            return res.status(200).json({
                code: 404,
                message: 'No Organization found.',
            });
        }


        const updatedHR = await HR.updateMany(
            { organization_id: org_id },
            {
                $set: {
                    hr_status: 'suspended',
                    org_status: 'suspended',
                },
            }
        );

        if (!updatedHR) {
            return res.status(200).json({
                code: 404,
                message: 'HR not found or status not updated',
            });
        }

        const updatedJobs = await JobDetails.updateMany(
            { org_id: org_id },
            { $set: { job_status: 'inactive' } }
        );

        if (!updatedJobs) {
            return res.status(200).json({
                code: 404,
                message: 'No jobs found or job status not updated',
            });
        }


        return res.status(200).json({
            code: 200,
            message: 'HR, organization, and job statuses updated to suspended',
        });
    } catch (err) {
        console.error(err.message);
        return res.status(200).json({
            code: 500,
            message: 'Server error',
            error: err.message,
        });
    }
};


exports.getSuperAdminDashboardOverview = async (req, res) => {
    try {
        // Counting total candidates
        const totalCandidates = await Candidate.countDocuments();

        // Finding distinct organization_ids and counting them
        const distinctOrganizations = await HR.distinct('organization_id');
        const totalOrganizations = distinctOrganizations.length;

        res.status(200).json({
            success: true,
            totalCandidates: totalCandidates,
            totalOrganizations: totalOrganizations,
        });
    } catch (err) {
        console.error(err);
        res.status(200).json({
            success: false,
            message: "Server error",
        });
    }
};

