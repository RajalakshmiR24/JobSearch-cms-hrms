const { Schema, model } = require('mongoose');
const { v4: uuidv4 } = require('uuid');


const questionSchema = new Schema({
    question_text: { type: String },
    question_id: {
        type: String,
        default: uuidv4,
        unique: true,
    },
    question_type: { 
        type: String, 
        required: true, 
        enum: [
            'Short Answer',       
            'Paragraph',          
            'Multiple Choice',    
            'Checkboxes',         
            'Dropdown',           
            'Linear Scale',       
            'Multiple Choice Grid', 
            'Checkbox Grid',      
            'Date',               
            'Time',               
            'File',                
            'URL',                
            'Image',              
            'Ranking',            
            'DateTime',           
            'Section',            
            'Scale',              
            'Multiple Response'   
        ],
    },
    
    options: [
        {
            option_id: {
                type: String,
                default: uuidv4,
            },
            option_text: { type: String },
            is_correct: { type: Boolean, default: false },
        }
    ],
    rows: [
        {
            row_id: {
                type: String,
                default: uuidv4,
            },
            row_text: { type: String },
        }
    ],
    columns: [
        {
            column_id: {
                type: String,
                default: uuidv4,
            },
            column_text: { type: String },
        }
    ],
    required: { type: Boolean, default: true },
    description: { type: String },
    max_length: { type: Number },
    scale: {
        min: { type: Number },
        max: { type: Number },
    },
    date_format: { 
        type: String, 
        enum: ['MM/DD/YYYY'], 
    },
    time_format: { 
        type: String, 
        enum: ['HH:mm', 'hh:mm A'], 
    },
    
    deletedFlag: { type: Boolean, default: false },  
}, { timestamps: true });


const assessmentSchema = new Schema({
    hr_id: { type: String },
    job_id: { type: String },
    org_id: { type: String },
    assessment_id: {
        type: String,
        default: uuidv4,
        unique: true,
    },
    assessment_title: { type: String },
    description: { type: String },
    assessment_type: { 
        type: String, 
        required: true, 
        enum: [
            'Technical', 
            'Aptitude', 
            'General', 
            'Personality', 
            'Behavioral', 
            'Knowledge', 
            'Skill-Based', 
            'Survey', 
            'Leadership', 
            'Soft Skills', 
        ], 
    },
    questions: [questionSchema],
    deadline: { type: Date },
    status: { type: String, enum: ['Active', 'Completed', 'Draft'], default: 'Draft' },
    deletedFlag: { type: Boolean, default: false },  
}, { timestamps: true });

const Assessment = model('Assessment', assessmentSchema);

module.exports = Assessment;
