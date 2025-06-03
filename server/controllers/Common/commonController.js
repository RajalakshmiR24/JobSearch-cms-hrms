const HR = require("../../models/Hr");
const Candidate = require("../../models/Candidate");
const JobDetails = require("../../models/JobDetails");
const crypto = require("crypto");

const moment = require("moment");
const { v4: uuidv4 } = require("uuid");
const SuperAdmin = require("../../models/SuperAdmin");
const Hr = require("../../models/Hr");

exports.logout = async (req, res, next) => {
  try {
    console.log("-----------------------------");
    console.log("/end logout handler");

    const ip = req.ip || "122.165.57.87";
    const geoLocation = logGeoLocationOnLogout(ip) || { action_details: [] };

    const newGeoAction =
      geoLocation.action_details && geoLocation.action_details.length > 0
        ? geoLocation.action_details[geoLocation.action_details.length - 1]
        : {};

    const hash = req.user?.hash;
    if (!hash) {
      return res
        .status(200)
        .json({ code: 400, error: "Invalid request: missing hash" });
    }

    const [existingHR, existingCandidate, existingSuperAdmin] =
      await Promise.all([
        HR.findOne({ hash }),
        Candidate.findOne({ hash }),
        SuperAdmin.findOne({ hash }),
      ]);

    const updateGeoLocation = async (Model, user) => {
      if (user) {
        await Model.updateOne(
          { hash },
          { $push: { "geoLocation.action_details": newGeoAction } }
        );
      }
    };

    await Promise.all([
      updateGeoLocation(HR, existingHR),
      updateGeoLocation(Candidate, existingCandidate),
      updateGeoLocation(SuperAdmin, existingSuperAdmin),
    ]);

    const issuer = process.env.OIDC_ISSUER_AUTH;
    const logoutUrl = `${issuer}/account/session/end`;
    return res.redirect(logoutUrl);
  } catch (error) {
    console.error("Error in logout handler:", error.message);
    return res.status(200).json({ code: 500, error: error.message });
  }
};

exports.getAllJobDetails = async (req, res) => {
  try {
    const orgName = req.organization_name;
    const hrPosition = req.position;
    const orgId = req.organization_id;

    let jobDetails = await JobDetails.find({ org_id: orgId }).select(
      "-hash -_id -files._id -__v -updatedAt -createdAt -job_role._id"
    );

    if (!jobDetails || jobDetails.length === 0) {
      return res.status(200).json({
        code: 400,
        error: "No job found",
        orgName: orgName,
      });
    }

    return res.status(200).json({
      code: 200,
      data: jobDetails,
      orgName: orgName,
    });
  } catch (error) {
    console.log("Error fetching job details:", error.message);
    return res.status(200).json({
      code: 500,
      error: error.message,
    });
  }
};


exports.getAllJob = async (req, res) => {
  try {
    const jobDetails = await JobDetails.aggregate([
      {
        $match: {
          deleteFlag: false,
          job_status: "active",
        },
      },
      {
        $lookup: {
          from: "hrs",
          localField: "org_id",
          foreignField: "organization_id",
          as: "organization",
        },
      },
      {
        $unwind: "$organization",
      },
      {
        $match: {
          "organization.org_status": "active",
        },
      },
      {
        $project: {
          _id: 0,
          postingTitle: 1,
          jobType: 1,
          maxSalary: 1,
          minSalary: 1,
          "address.city": 1,
          "address.state": 1,
          organization_logo: "$organization.organization_logo",
          organization_name: "$organization.organization_name",
        },
      },
    ]);
    const jobTopCompanies = await JobDetails.aggregate([
      {
        $match: {
          deleteFlag: false,
          job_status: "active",
        },
      },
      {
        $lookup: {
          from: "hrs",
          localField: "org_id",
          foreignField: "organization_id",
          as: "organization",
        },
      },
      {
        $unwind: "$organization",
      },
      {
        $match: {
          "organization.org_status": "active",
        },
      },
      {
        $group: {
          _id: "$org_id",
          count: { $sum: 1 },
          organization_logo: { $first: "$organization.organization_logo" },
          organization_name: { $first: "$organization.organization_name" },
          address: { $first: "$address" }, // <-- Group address as object
        },
      },
      {
        $project: {
          _id: 0,
          organization_logo: 1,
          organization_name: 1,
          "address.city": 1,
          "address.state": 1,
          job_opening_count: "$count",
        },
      },
    ]);
    
    const departmentCategoryMap = {
      Design: "Graphics & Design",
      Marketing: "Digital Marketing",
      "Public Relations": "Digital Marketing",
      Engineering: "Code & Programming",
      IT: "Code & Programming",
      Technology: "Code & Programming",
      "R&D": "Data & Science",
      Finance: "Account & Finance",
      Operations: "Account & Finance",
      Compliance: "Account & Finance",
      Healthcare: "Health & Care",
      HR: "Health & Care",
      "Training and Development": "Health & Care",
      Product: "Graphics & Design",
      Sales: "Digital Marketing",
      Legal: "Others",
      Admin: "Others",
      "Customer Support": "Others",
      Logistics: "Others",
      "Quality Assurance": "Data & Science",
      "Supply Chain": "Others",
      "Business Development": "Others",
      Others: "Others",
    };

    const getEnumValues = (path) => {
      const schemaPath = JobDetails.schema.path(path);
      return schemaPath && schemaPath.enumValues ? schemaPath.enumValues : [];
    };

    const titleEnums = getEnumValues("title");
    const filteredEnum = titleEnums.filter((title) => title !== "Others");
    const shuffled = filteredEnum.sort(() => 0.5 - Math.random());
    const Suggestions = shuffled.slice(0, 5);

    const totalJob = await JobDetails.countDocuments({
      jobOpeningStatus: "Open",
      deleteFlag: false,
      job_status: "active",
    });

    const totalHr = await Hr.countDocuments({ hr_status: "active" });

    const totalCompanies = await Hr.distinct("organization_id", {
      org_status: "active",
    }).then((ids) => ids.length);

    const totalCandidate = await Candidate.countDocuments({ profile: true });

    const departmentCounts = await JobDetails.aggregate([
      {
        $match: {
          jobOpeningStatus: "Open",
          deleteFlag: false,
          job_status: "active",
        },
      },
      {
        $group: {
          _id: "$departmentName",
          count: { $sum: 1 },
        },
      },
    ]);

    const categoryCount = {};
    departmentCounts.forEach(({ _id, count }) => {
      const category = departmentCategoryMap[_id] || "Others";
      categoryCount[category] = (categoryCount[category] || 0) + count;
    });

    return res.status(200).json({
      code: 200,
      totalCount: { totalJob, totalCandidate, totalCompanies, totalHr },
      categoryCount,
      Suggestions,
      Jobs: jobDetails,
      TopCompanies: jobTopCompanies.slice(0, 5),
    });
  } catch (error) {
    console.error("Error fetching job details:", error.message);
    return res.status(500).json({
      code: 500,
      error: error.message,
    });
  }
};

exports.getJobById = async (req, res) => {
  try {
    const { jobId } = req.body;
    const jobDetails = await JobDetails.find({ job_id: jobId }).select(
      "-hash -_id -files._id -__v -updatedAt -createdAt -hr_id -hiringManager.hr_id"
    );

    if (!jobDetails) {
      return res.status(200).json({
        code: 400,
        message: "Job not found",
      });
    }

    return res.status(200).json({
      code: 200,
      data: jobDetails,
    });
  } catch (error) {
    console.error("Error fetching job details by jobId:", error.message);
    return res.status(200).json({
      code: 500,
      error: error.message,
    });
  }
};

exports.getName = async (req, res) => {
  try {
    const name = req.name;
    const role = req.role;
    const position = req.position;
    const orgName = req.organization_name;
    const geoLocation = req.geoLocation;
    const photo = req.photo;
    const email = req.email;
    const logo = req.organization_logo;

    return res.status(200).json({
      code: 200,
      name: name,
      role: role,
      position: position,
      orgName: orgName,
      geoLocation: geoLocation,
      photo: photo,
      email: email,
      logo: logo,
    });
  } catch (err) {
    console.log(err.message, "error message");
    res.status(200).json({ code: 500, error: err.message });
  }
};

exports.getDashboardOverview = async (req, res) => {
  try {
    const role = req.role;
    const HRname = req.name;
    const HRposition = req.position;

    const { timeline, month } = req.body;

    let candidateQuery = {};
    let totalCandidates = 0;

    if (role === "superAdmin") {
      totalCandidates = await Candidate.countDocuments({});
    } else {
      if (timeline === "UPCOMING") {
        candidateQuery = { walkin_date: { $gt: newwalkin_date() } };
      } else if (timeline === "TODAY") {
        candidateQuery = {
          walkin_date: {
            $gte: moment().startOf("day").toDate(),
            $lte: moment().endOf("day").toDate(),
          },
        };
      } else if (timeline === "PREVIOUS") {
        candidateQuery = {
          walkin_date: { $lt: moment().startOf("month").toDate() },
        };
      }

      totalCandidates = await Candidate.countDocuments(candidateQuery);
    }

    const startOfMonth = moment().startOf("month").toDate();
    const endOfMonth = moment().endOf("month").toDate();
    const hiresThisMonthQuery = {
      job_Status: "HIRED",
      walkin_date: { $gte: startOfMonth, $lte: endOfMonth },
    };

    const hiresThisMonth = await Candidate.countDocuments(hiresThisMonthQuery);

    let hiresInSelectedMonth = 0;
    let totalCandidatesMonthWise = {};

    if (month) {
      const startOfSelectedMonth = moment(month, "MM")
        .startOf("month")
        .toDate();
      const endOfSelectedMonth = moment(month, "MM").endOf("month").toDate();
      hiresInSelectedMonth = await Candidate.countDocuments({
        job_Status: "HIRED",
        walkin_date: { $gte: startOfSelectedMonth, $lte: endOfSelectedMonth },
      });

      totalCandidatesMonthWise = await Candidate.aggregate([
        {
          $match: {
            walkin_date: {
              $gte: startOfSelectedMonth,
              $lte: endOfSelectedMonth,
            },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
          },
        },
      ]);
    }

    if (!month) {
      totalCandidatesMonthWise = await Candidate.aggregate([
        {
          $match: {
            walkin_date: { $gte: startOfMonth, $lte: endOfMonth },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
          },
        },
      ]);
    }

    res.status(200).json({
      totalCandidates,
      totalCandidatesMonthWise: totalCandidatesMonthWise.length
        ? totalCandidatesMonthWise[0].total
        : 0,
      hiresThisMonth,
      hiresInSelectedMonth,
      HRname,
      HRposition,
      role,
    });
  } catch (error) {
    console.error(error.message);

    res.status(200).json({
      code: 500,
      error: error.message,
    });
  }
};

exports.getCandidatesByJobId = async (req, res) => {
  try {
    const { job_id } = req.body;
    const { role, organization_id: org_id } = req;

    const candidates = await Candidate.find({
      "job_role.job_id": job_id,
    }).exec();

    if (!candidates || candidates.length === 0) {
      return res.status(200).json({
        code: 404,
        message: "No candidates found for the specified job_id.",
        role,
      });
    }

    return res.status(200).json({
      code: 200,
      message: "Candidates retrieved successfully.",
      candidates: candidates.map((candidate) => {
        const jobRole = Array.isArray(candidate.job_role)
          ? candidate.job_role
          : [];
        const resume = Array.isArray(candidate.resume) ? candidate.resume : [];

        const filteredJobRoles = jobRole.filter(
          (role) => role.job_id === job_id
        );
        const allResumes = resume;

        const jobTitlesFromRoles = jobRole
          .filter((role) => role.org_id === org_id)
          .map((role) => role.postingTitle);

        const jobTitles = [
          ...new Set(
            jobTitlesFromRoles.filter(
              (title) => title !== filteredJobRoles[0]?.postingTitle
            )
          ),
        ];

        return {
          name: candidate.name,
          email: candidate.email,
          phone_number: candidate.phone_number,
          skills: candidate.skills,
          address: candidate.address,
          dob: candidate.dob,
          walkin_date: candidate.walkin_date,
          timeline: candidate.timeline,
          description: candidate.description,
          candidate_Status: candidate.candidate_Status,
          job_Status: candidate.job_Status,
          candidate_id: candidate.candidate_id,
          education: candidate.education,
          experiences: candidate.experiences,
          job_role: filteredJobRoles,
          resumes: allResumes,
          Duplicate: jobTitles,
          createdAt: candidate.createdAt,
        };
      }),
      role,
    });
  } catch (error) {
    console.error(error.message);

    return res.status(200).json({
      code: 500,
      error: error.message,
      role,
    });
  }
};

exports.getFeedback = async (req, res) => {
  try {
    const role = req.role;
    const hrId = req.hr_id;

    const { candidate_id } = req.body;
    const candidate = await Candidate.findOne({ candidate_id }).select(
      "feedback"
    );

    if (!candidate) {
      return res
        .status(200)
        .json({ code: 404, message: "Candidate not found", role: role });
    }

    const filteredFeedback = candidate.feedback.filter(
      (feedback) => !feedback.feedback_deleteFlag
    );

    const orgIds = [
      ...new Set(filteredFeedback.map((feedback) => feedback.org_id)),
    ];
    const hrIds = [
      ...new Set(filteredFeedback.map((feedback) => feedback.created_by)),
    ];

    const organizations = await HR.find({
      organization_id: { $in: orgIds },
    }).select("organization_name organization_id");
    const hrUsers = await HR.find({ hr_id: { $in: hrIds } }).select(
      "position hr_id"
    );

    const organizationMap = organizations.reduce((acc, org) => {
      acc[org.organization_id] = org.organization_name;
      return acc;
    }, {});

    const hrUserMap = hrUsers.reduce((acc, hr) => {
      acc[hr.hr_id] = hr.position;
      return acc;
    }, {});

    const feedbackWithOrgAndHR = filteredFeedback.map((feedback) => ({
      ...feedback.toObject(),
      organization_name:
        organizationMap[feedback.org_id] || "Unknown Organization",
      hr_position: hrUserMap[feedback.created_by] || "Unknown Position",
    }));

    res.status(200).json({
      code: 200,
      feedback: feedbackWithOrgAndHR,
      role: role,
      hrId: hrId,
    });
  } catch (error) {
    console.error(error.message);

    res.status(200).json({ code: 500, error: error.message });
  }
};

exports.createFeedback = async (req, res) => {
  try {
    const hr_id = req.hr_id;
    const org_id = req.organization_id;

    if (!hr_id || !org_id) {
      return res
        .status(200)
        .json({ code: 400, message: "HR or Organization ID not found" });
    }

    const { candidate_id, rating, feedback_text } = req.body;

    if (rating < 1 || rating > 5) {
      return res
        .status(200)
        .json({ code: 400, message: "Rating must be between 1 and 5" });
    }

    if (!feedback_text || feedback_text.length < 2) {
      return res.status(200).json({
        code: 400,
        message: "Feedback text must be at least 2 characters",
      });
    }

    const candidate = await Candidate.findOne({ candidate_id });

    if (!candidate) {
      return res
        .status(200)
        .json({ code: 404, message: "Candidate not found" });
    }

    const existingFeedback = candidate.feedback.find(
      (feedback) => feedback.created_by.toString() === hr_id
    );

    if (existingFeedback) {
      return res.status(200).json({
        code: 400,
        message:
          "You have already provided feedback for this candidate. Please edit the existing feedback.",
      });
    }

    const newFeedback = {
      feedback_id: uuidv4(),
      rating,
      feedback_text,
      created_by: hr_id,
      org_id: org_id,
      created_at: new Date(),
    };

    candidate.feedback.push(newFeedback);

    await candidate.save();

    res.status(201).json({
      code: 201,
      message: "Feedback created successfully",
      feedback: newFeedback,
    });
  } catch (error) {
    console.error(error.message);
    res.status(200).json({
      code: 500,
      message: "Error creating feedback",
      error: error.message,
    });
  }
};

exports.editFeedback = async (req, res) => {
  try {
    const { candidate_id, feedback_id, rating, feedback_text } = req.body;
    const hr_id = req.hr_id;
    const org_id = req.organization_id;

    if (!hr_id || !org_id) {
      return res
        .status(200)
        .json({ code: 400, message: "HR or Organization ID not found" });
    }

    if (rating < 1 || rating > 5) {
      return res
        .status(200)
        .json({ code: 400, message: "Rating must be between 1 and 5" });
    }

    if (!feedback_text || feedback_text.length < 10) {
      return res.status(200).json({
        code: 400,
        message: "Feedback text must be at least 10 characters",
      });
    }

    const candidate = await Candidate.findOne({ candidate_id });

    if (!candidate) {
      return res
        .status(200)
        .json({ code: 404, message: "Candidate not found" });
    }

    const feedback = candidate.feedback.find(
      (f) => f.feedback_id === feedback_id
    );

    if (!feedback) {
      return res.status(200).json({ code: 404, message: "Feedback not found" });
    }

    if (feedback.created_by !== hr_id) {
      return res.status(200).json({
        code: 403,
        message: "You do not have permission to edit this feedback",
      });
    }

    feedback.rating = rating;
    feedback.feedback_text = feedback_text;
    feedback.updated_at = new Date();

    await candidate.save();

    res
      .status(200)
      .json({ code: 200, message: "Feedback updated successfully", feedback });
  } catch (error) {
    console.error(error.message);

    res.status(200).json({
      code: 500,
      message: "Error updating feedback",
      error: error.message,
    });
  }
};

exports.deleteFeedback = async (req, res) => {
  try {
    const { candidate_id, feedback_id } = req.body;
    const hr_id = req.hr_id;

    if (!hr_id) {
      return res.status(200).json({ code: 400, message: "HR ID not found" });
    }
    const candidate = await Candidate.findOne({ candidate_id });

    if (!candidate) {
      return res
        .status(200)
        .json({ code: 404, message: "Candidate not found" });
    }
    const feedbackIndex = candidate.feedback.findIndex(
      (f) => f.feedback_id === feedback_id
    );
    if (feedbackIndex === -1) {
      return res.status(200).json({ code: 404, message: "Feedback not found" });
    }
    if (candidate.feedback[feedbackIndex].created_by !== hr_id) {
      return res.status(200).json({
        code: 403,
        message: "You do not have permission to delete this feedback",
      });
    }
    candidate.feedback[feedbackIndex].feedback_deleteFlag = true;
    await candidate.save();

    res
      .status(200)
      .json({ code: 200, message: "Feedback marked as deleted successfully" });
  } catch (error) {
    console.error(error.message);

    res.status(200).json({
      code: 500,
      message: "Error deleting feedback",
      error: error.message,
    });
  }
};

exports.getJobDetailsForOtherRoles = async (req, res) => {
  const hash = req.hash;
  const role = req.role;

  try {
    if (role !== "candidate") {
      const enums = {};

      const getEnumValues = (path) => {
        const schemaPath = JobDetails.schema.path(path);
        return schemaPath && schemaPath.enumValues ? schemaPath.enumValues : [];
      };

      enums.jobOpeningStatus = getEnumValues("jobOpeningStatus");
      enums.jobType = getEnumValues("jobType");
      enums.workExp = getEnumValues("workExp");
      enums.industry = getEnumValues("industry");
      enums.departmentName = getEnumValues("departmentName");
      enums.title = getEnumValues("title");

      const hrList = await HR.find({ hash }, "name hr_id departmentName");
      const hiringManagers = hrList.map((hr) => ({
        hr_id: hr.hr_id,
        name: hr.name,
        department: hr.departmentName,
      }));

      enums.hiringManagers = hiringManagers;

      return res.status(200).json({
        success: true,
        data: enums,
      });
    } else {
      return res.status(200).json({
        success: false,
        message: "Access restricted for non-candidate roles.",
      });
    }
  } catch (error) {
    console.error(error.message, "jhgjhgjhg");
    return res.status(200).json({
      success: false,
      error: error.message,
    });
  }
};

exports.getJobDetailsForCandidate = async (req, res) => {
  try {
    const titlePath = JobDetails.schema.path("title");
    if (
      !titlePath ||
      !titlePath.enumValues ||
      titlePath.enumValues.length === 0
    ) {
      return res.status(200).json({
        code: 404,
        message: "No job titles found or enum is not defined",
      });
    }

    return res.status(200).json({
      code: 200,
      jobTitles: titlePath.enumValues,
    });
  } catch (error) {
    console.error("Error fetching job titles:", error.message);
    return res.status(200).json({
      code: 500,
      message: "An error occurred while fetching job titles",
    });
  }
};

exports.createOrg = async (req, res) => {
  console.log("Request Body:", req.body);

  try {
    if (!req.body) {
      return res
        .status(200)
        .json({ code: 400, message: "Request body is missing." });
    }

    const {
      phone_number,
      name,
      email,
      organization_name,
      organization_address,
      organization_contact,
      organization_website,
      organization_logo,
    } = req.body;

    if (!phone_number || !name || !email) {
      return res
        .status(200)
        .json({ code: 400, message: "Missing required fields." });
    }

    const [
      existingHR,
      existingCandidateEmail,
      existingHRPhone,
      existingCandidatePhone,
    ] = await Promise.all([
      HR.findOne({ email }),
      Candidate.findOne({ email }),
      HR.findOne({ phone_number }),
      Candidate.findOne({ phone_number }),
    ]);

    if (existingHR) {
      return res
        .status(200)
        .json({ code: 400, message: "Email already exists in HR." });
    }
    if (existingCandidateEmail) {
      return res
        .status(200)
        .json({ code: 400, message: "Email already exists in Candidate." });
    }
    if (existingHRPhone) {
      return res
        .status(200)
        .json({ code: 400, message: "Phone number already exists in HR." });
    }
    if (existingCandidatePhone) {
      return res.status(200).json({
        code: 400,
        message: "Phone number already exists in Candidate.",
      });
    }

    const hashedemail = crypto.createHash("sha256").update(email).digest("hex");
    const newHR = new HR({
      phone_number,
      hash: hashedemail,
      name,
      email,
      position: "HR Administrator",
      organization_name,
      organization_address,
      organization_contact,
      organization_website,
      organization_logo,
      hr_status: "inactive",
      org_status: "inactive",
    });

    await newHR.save();

    res.status(201).json({
      code: 201,
      message: "HR details created successfully.",
    });
  } catch (error) {
    console.error("Error in createOrg handler:", error.message);

    res.status(500).json({ code: 500, message: error.message });
  }
};
