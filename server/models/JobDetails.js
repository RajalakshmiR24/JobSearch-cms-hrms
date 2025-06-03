const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const numberRegex = /^[0-9]+$/;

const departments = [
    'HR', 'Engineering', 'Sales', 'Marketing', 'Finance', 'Customer Support',
    'Operations', 'Product', 'Legal', 'IT', 'R&D', 'Business Development',
    'Supply Chain', 'Quality Assurance', 'Admin', 'Healthcare', 'Design',
    'Logistics', 'Training and Development', 'Compliance', 'Public Relations',
    'Technology', 'Others'
];

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

const jobDetailsSchema = new mongoose.Schema({
    job_id: {
        type: String,
        default: uuidv4,
        unique: true,
        match: [/^[^<]*$/, 'Description cannot contain HTML tags'],
    },
    postingTitle: {
        type: String,
        required: [true, 'Posting title is required'],
        match: [/^[a-zA-Z0-9\s,.'-]{3,100}$/, 'Invalid posting title format'],
        match: [/^[^<]*$/, 'Description cannot contain HTML tags'],
        minlength: 2,
        maxlength: 100,
    },
    title: {
        type: String,
        required: [true, 'Job title is required'],
        enum: JobTitleEnum,

        match: [/^[A-Za-z\s]+$/, 'Job title must only contain letters and spaces'],
    },
    departmentName: {
        type: String,
        enum: departments,
        required: [true, 'Department name is required'],
        match: [/^[^<]*$/, 'Description cannot contain HTML tags'],
    },
    hiringManager: {
        name: {
            type: String,
            required: [true, 'Hiring manager name is required'],
        },
        hr_id: {
            type: String,
            ref: 'HR',
            required: [true, 'Hiring manager ID is required'],
        }
    },
    numOfPositions: {
        type: Number,
        required: [true, 'Number of positions is required'],
        min: [1, 'At least one position is required'],
        max: [1000, 'Maximum number of positions is 1000'],
        validate: {
            validator: function (value) {

                return /^[1-9][0-9]*$/.test(value.toString());
            },
            message: 'Number of positions must be a positive integer greater than zero'
        }
    },

    numOfOpenings: {
        type: Number,
        required: [true, 'Number of openings is required'],
        min: [1, 'At least one position is required'],
        max: [1000, 'Maximum number of openings is 1000'],
    },
    targetDate: {
        type: Date,
        required: [true, 'Target date is required'],
        validate: {
            validator: function (value) {
                return value > this.dateOpened;
            },
            message: 'Target date must be a future date compared to the date opened.',
        }
    },
    dateOpened: {
        type: Date,
        required: [true, 'Date opened is required'],
    },
    jobOpeningStatus: {
        type: String,
        enum: ['Open', 'Closed', 'Pending','Completed'],
        default: 'Open',
    },
    jobType: {
        type: String,
        enum: ['Full-time', 'Part-time', 'Contract', 'Temporary'],
        default: 'Full-time',
    },
    industry: {
        type: String,
        enum: ['Technology', 'Finance', 'Healthcare', 'Education', 'Retail', 'Manufacturing', 'Construction', 'Government', 'Others'],
        required: [true, 'Industry is required'],
    },
    workExp: {
        workExpInYear: { 
            type: Number,
            match: [numberRegex, 'Work experience in years must be a valid number'],
            min: [0, 'Work experience in years cannot be negative'],
            required: [true, 'Work experience in years is required'],
        },
        workExpInMonth: { 
            type: Number,
            match: [numberRegex, 'Work experience in months must be a valid number'],
            min: [0, 'Work experience in months cannot be negative'],
            required: [true, 'Work experience in months is required'],
        },
    },
    minSalary: {
        lakh: { 
            type: Number,
            match: [numberRegex, 'Lakh must be a valid number'],
            min: [0, 'Lakh cannot be negative'],
            max: [50, 'Lakh cannot exceed 100'],
            // required: [true, 'Lakh amount is required'],
        },
        thousand: { 
            type: Number,
            match: [numberRegex, 'Thousand must be a valid number'],
            min: [0, 'Thousand cannot be negative'],
            max: [99, 'Thousand cannot exceed 999'],
            required: [true, 'Thousand amount is required'],
        },
    },
    maxSalary: {
        lakh: { 
            type: Number,
            match: [numberRegex, 'Lakh must be a valid number'],
            min: [0, 'Lakh cannot be negative'],
            max: [50, 'Lakh cannot exceed 100'],
            required: [true, 'Lakh amount is required'],
        },
        thousand: { 
            type: Number,
            match: [numberRegex, 'Thousand must be a valid number'],
            min: [0, 'Thousand cannot be negative'],
            max: [99, 'Thousand cannot exceed 999'],
            required: [true, 'Thousand amount is required'],
        },
    },
    
    requiredSkills: {
        type: [String],
        required: [true, 'Required skills are required'],
        match: [/^[^<]*$/, 'Description cannot contain HTML tags'],
        minlength: 1,
        maxlength: 40,
    },
    address: {
        city: {
            type: String,
            required: [true, 'City is required'],
            match: [/^[a-zA-Z\s]{2,50}$/, 'Invalid city name format'],
            match: [/^[^<]*$/, 'Description cannot contain HTML tags'],
            minlength: 2,
            maxlength: 50,
        },
        state: {
            type: String,
            required: [true, 'State is required'],
            match: [/^[a-zA-Z\s]{2,50}$/, 'Invalid state name format'],
            match: [/^[^<]*$/, 'Description cannot contain HTML tags'],
            minlength: 2,
            maxlength: 50,
        },
        country: {
            type: String,
            required: [true, 'Country is required'],
            match: [/^[a-zA-Z\s]{2,50}$/, 'Invalid country name format'],
            match: [/^[^<]*$/, 'Description cannot contain HTML tags'],
            minlength: 2,
            maxlength: 50,
        },
        pin: {
            type: String,
            required: [true, 'Pin code is required'],
            match: [/^\d{6}$/, 'Pin code must be a 6-digit number'],
            maxlength: 6,
            minlength: 6,
        },
    },
    notes: {
        jobDescription: {
            type: String,
            required: [true, 'Job description is required'],
            minlength: 5,
            maxlength: 1000,
            match: [/^[^<]*$/, 'Description cannot contain HTML tags'],
        },
        requirements: {
            type: String,
            maxlength: 1000,
            match: [/^[^<]*$/, 'Description cannot contain HTML tags'],
        },
        benefits: {
            type: String,
            maxlength: 1000,
            match: [/^[^<]*$/, 'Description cannot contain HTML tags'],
        },
    },
    isPhoneNumberVisible: {
        type: Boolean,
        default: false,
    },
    hr_id: {
        type: String
    },
    org_id: {
        type: String
    },
    job_status: {
        type: String,
        enum: ['active', 'inactive','report', 'suspended','deleted', 'pending'],
        default: 'active',
    },
    deleteFlag: {
        type: Boolean,
        default: false,
      },
}, { timestamps: true });

const JobDetails = mongoose.model('JobDetails', jobDetailsSchema);

module.exports = JobDetails;
