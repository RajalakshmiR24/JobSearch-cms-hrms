const Candidate = require('../Models/candidate');

async function updateFilesBasedOnJobTitle(candidateId) {
    
  const candidate = await Candidate.findById(candidateId);

  if (candidate && candidate.resume && Array.isArray(candidate.resume)) {
    candidate.job_role.forEach(job => {
      
      const matchingResume = candidate.resume.find(resume => resume.job_title === job.job_title);

      if (matchingResume) {
        
        job.files = matchingResume.files || [];
      }
    });

    
    await candidate.save();
  }
}

module.exports = updateFilesBasedOnJobTitle;
