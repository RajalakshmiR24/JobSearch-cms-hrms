const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const moment = require('moment');
const GeoLocationSchema = require('./GeoLocation');

const allowedFileTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

const JobTitleEnum = [
  'Software Engineer', 'Web Developer', 'System Administrator', 'Network Engineer',
  'Database Administrator', 'DevOps Engineer', 'Data Scientist', 'Cloud Engineer',
  'Cybersecurity Analyst', 'IT Support Specialist', 'Full Stack Developer',
  'Mobile App Developer',
  'Marketing Manager',
  'HR Specialist',
  'Sales Executive',
  'Product Manager',
  'Business Analyst',
  'Graphic Designer',
  'Operations Manager',
  'Customer Service Representative',
  'Finance Analyst',
  'Project Manager',
  'Content Writer',
  'Accountant',
  'Others'
];


const resumeSchema = new mongoose.Schema({
  job_title: {
    type: String,
    required: true,
    enum: [...JobTitleEnum],
    validate: {
      validator: function(value) {
        if (value === 'Others' && !this.other_job_title) {
          return false; 
        }
        return true;
      },
      message: 'Please provide a custom job title when "Others" is selected.'
    }
  },
  other_job_title: {
    type: String,
    maxlength: [255, 'Custom job title cannot be longer than 255 characters'],
    required: function() {
      return this.job_title === 'Others'; 
    }
  },
  resume_name: {
    type: String,
    required: true,
    maxlength: [255, 'Resume name cannot be longer than 255 characters'],
  },
  resume_Type: {
    type: String,
    required: true,
    validate: {
      validator: function (value) {
        return allowedFileTypes.includes(value);
      },
      message: 'Invalid file type. Only PDF, DOCX, JPG, and JPEG are allowed.',
    }
  },
  data: {
    type: String,
    required: true,
  },
  resume_id: {
    type: String,
    default: uuidv4,
  },
});
const fileSchema = new mongoose.Schema({
  file_id: { 
      type: String, 
      default: uuidv4, 
  },
  file_name: { 
      type: String, 
      required: true 
  },
  
  file_type: { 
      type: String, 
      required: true 
  },
  file_size: { 
      type: Number, 
      required: true 
  },
  file_data: {
      type: String,
      required: true,
    },
  uploaded_at: { 
      type: Date, 
      default: Date.now 
  }
});
const candidateSchema = new mongoose.Schema({
  candidate_id: {
    type: String,
    default: uuidv4,
  },
  phone_number: {
    type: String,
    minlength: [10, 'Phone number must be at least 10 digits'],
    maxlength: [10, 'Phone number cannot exceed 10 digits'],
    match: [/^[6-9][0-9]{9}$/, 'Phone number must start with 6, 7, 8, or 9 and contain only digits'],
  },
  googleId: { type: String, required: true, unique: true },
  name: String,
  email: { type: String, unique: true },
  hash: String,
  photo: String,
  provider: String,
  verified: Boolean,
  role: {
    type: String,
    default: "candidate",
    enum: ["candidate"],
  },
  address: {
    type: String,
  },
  dob: {
    type: Date,
  },
  skills: {
    type: String,
  },
  linkedin: {
    type: String,
    match: [/^https:\/\/www\.linkedin\.com\/in\//, 'Please provide a valid LinkedIn URL'],
  },
  github: {
    type: String,
    match: [/^https:\/\/github\.com\//, 'Please provide a valid GitHub URL'],
  },
  education: [
    {
      qualification: { type: String },
      institution: { type: String },
      passingYear: { type: Number },
      marks: { type: String },
    },
  ],
  experiences: [
    {
      company: {
        type: String,
      },
      role: {
        type: String,
      },
      fromDate: {
        type: Date,
        validate: {
          validator: function (value) {
            return value <= Date.now(); // Ensure `fromDate` is not in the future
          },
          message: 'From date cannot be in the future.',
        },
      },
      toDate: {
        type: Date,
        default: Date.now,
        validate: {
          validator: function (value) {
            return value <= Date.now();
          },
          message: 'To date cannot be in the future.',
        },
      },
      skillsUsed: {
        type: String,
        default: 'Not Provided',
      },
    },
  ],
  role: {
    type: String,
    enum: ['candidate', 'hr'],
    default: 'candidate',
    required: [true, 'Role is required'],
  },
  hr_id: {
    type: String,
  },
  org_id: {
    type: String,
  },
  invited: {
    type: Boolean,
    required: [true, 'Invited by field is required'],
    default: false,
  },
  profile: {
    type: Boolean,
    default: false,
  },
  job_role: [{
    job_id: {
      type: String,
    },
    postingTitle: {
      type: String,
    },
    job_title: {
      type: String,
    },

    hr_ids: [String],
    org_id: {
      type: String,
    },
    walkin_date: {
      type: Date,
      validate: {
        validator: function (value) {
          const today = moment().startOf('day');
          return value && moment(value).isAfter(today, 'day');
        },
        message: 'Walk-in date must be in the future and cannot be today or a previous date.',
      }
    },
    timeline: {
      type: String,
      enum: ['UPCOMING', 'TODAY', 'PREVIOUS'],
    },
    applicationStatus: {
      type: String,
      enum: ['Applied', 'Not_Applied'],
      default: 'Not_Applied',
    },
    appliedAt: {
      type: Date,
    },
    candidate_Status: {
      type: String,
      enum: ['PRESENT', 'ABSENT', 'WAITING'],
      default: 'WAITING',
    },
    job_Status: {
      type: String,
      enum: ['NOT_ATTENDED', 'COMPLETED', 'SHORTLISTED', 'REJECTED', 'IN_PROGRESS', 'HIRED_TRAINEE', 'HIRED_EMPLOYEE'],
      default: 'IN_PROGRESS',
    },
    description: {
      type: String,
      default: 'Status updated.',
      maxlength: [500, 'Description cannot be longer than 500 characters'],
      minlength: [10, 'Description should be at least 10 characters'],
      match: [/^[^<]*$/, 'Description cannot contain HTML tags'],
    },

    deleteFlag: {
      type: Boolean,
      default: false,
    },

  }],

  resume: [resumeSchema],

  invited_by_org: [{
    invite_id: {
      type: String,
      default: uuidv4,
    },
    job_id: {
      type: String,
    },
    job_title: {
      type: String,
    },
    postingTitle: {
      type: String,
    },
    hr_id: {
      type: String,
    },
    org_id: {
      type: String,
    },
    walkin_date: {
      type: Date,
      validate: {
        validator: function (value) {
          const today = moment().startOf('day');
          return value && moment(value).isAfter(today, 'day');
        },
        message: 'Walk-in date must be in the future and cannot be today or a previous date.',
      }
    },
    candidate_Status: {
      type: String,
      enum: ['PRESENT', 'ABSENT', 'WAITING', 'REJECTED'],
      default: 'WAITING',
    },
    job_Status: {
      type: String,
      enum: ['NOT_ATTENDED', 'COMPLETED', 'SHORTLISTED', 'REJECTED', 'IN_PROGRESS', 'HIRED_TRAINEE', 'HIRED_EMPLOYEE'],
      default: 'IN_PROGRESS',
    },
    accepted: {
      type: Boolean,
      default: false,

    },
    rejection_message: {
      type: String,
    }
  }],

  feedback: [{
    feedback_id: {
      type: String,
      default: uuidv4,
    },
    rating: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot be more than 5'],
    },
    feedback_text: {
      type: String,
      maxlength: [500, 'Feedback cannot be longer than 1000 characters'],
      minlength: [2, 'Feedback should be at least 2 characters'],
      match: [/^[^<]*$/, 'Feedback cannot contain HTML tags'],
    },
    feedback_deleteFlag: {
      type: Boolean,
      default: false,
    },
    created_by: {
      type: String,
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
    org_id: {
      type: String,
    },
    kycVerification: {
      kyc_id: { type: String },
      kyc_status: { type: String },
    },
  }],
  geoLocation: GeoLocationSchema,
  candidateAssessment: {
    assessment_id: { type: String,   },  
    status: { type: String, default: 'Not Started', enum: ['Not Started', 'In Progress', 'Completed'] },  
    start_time: { type: Date },
    end_time: { type: Date },
    score: { type: Number, default: 0 },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
    candidate_answers: [
      {
        question_id: { type: String,  }, 
        answer_text: { type: String }, 
        selected_option_id: { type: String, },  
        is_correct: { type: Boolean, default: false },
        file_metadata: {
          type: fileSchema, 
        }
      }
    ]
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
},{ timestamps: true });


candidateSchema.pre('save', function (next) {

  if (this.job_role && Array.isArray(this.job_role)) {
    this.job_role.forEach(job => {
      if (job.applicationStatus === 'Applied' && !job.appliedAt) {
        job.appliedAt = new Date();
      }
    });
  }


  this.experiences.forEach(experience => {
    if (experience.fromDate > experience.toDate) {
      return next(new Error('From date cannot be later than to date.'));
    }
  });

  next();
});

candidateSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate();

  if (update && update.job_role && Array.isArray(update.job_role)) {
    update.job_role.forEach(job => {
      if (job.applicationStatus === 'Applied' && !job.appliedAt) {
        job.appliedAt = new Date();
      }
    });
  }

  next();
});

candidateSchema.methods.toJSON = function () {
  const candidate = this.toObject();
  return candidate;
};

const Candidate = mongoose.models.Candidate || mongoose.model('Candidate', candidateSchema);

module.exports = Candidate;
