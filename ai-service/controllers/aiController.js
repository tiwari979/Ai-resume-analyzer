const aiAnalysisService = require('../services/aiAnalysisService');

const analyzeResume = async (req, res, next) => {
  try {
    const { text, filename } = req.body;

    if (!text || text.trim().length < 50) {
      return res.status(400).json({ error: 'Resume text is too short or empty for analysis.' });
    }

    const analysis = await aiAnalysisService.analyzeResumeText(text, filename);

    // Increment counter
    req.app.locals.analysesCompleted.inc();

    res.json({
      message: 'Analysis complete',
      analysis,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { analyzeResume };
