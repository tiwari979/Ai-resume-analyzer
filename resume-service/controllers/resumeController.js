const resumeService = require('../services/resumeService');

const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded. Please provide a PDF resume.' });
    }

    const { originalname, buffer, mimetype } = req.file;

    if (mimetype !== 'application/pdf') {
      return res.status(400).json({ error: 'Only PDF files are accepted.' });
    }

    // Increment Prometheus counter
    req.app.locals.resumesProcessed.inc();

    const result = await resumeService.processResume({ filename: originalname, buffer });

    res.status(201).json({
      message: 'Resume uploaded and analyzed successfully',
      resume: result,
    });
  } catch (err) {
    next(err);
  }
};

const getResume = async (req, res, next) => {
  try {
    const resume = await resumeService.getResumeById(req.params.id);
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }
    res.json({ resume });
  } catch (err) {
    next(err);
  }
};

const listResumes = async (req, res, next) => {
  try {
    const resumes = await resumeService.getAllResumes();
    res.json({ resumes, count: resumes.length });
  } catch (err) {
    next(err);
  }
};

module.exports = { uploadResume, getResume, listResumes };
