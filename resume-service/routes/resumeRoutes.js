const express = require('express');
const router = express.Router();
const resumeController = require('../controllers/resumeController');
const upload = require('../utils/multerConfig');

router.post('/upload', upload.single('resume'), resumeController.uploadResume);
router.get('/:id', resumeController.getResume);
router.get('/', resumeController.listResumes);

module.exports = router;
