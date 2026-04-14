import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { getMonthlyReportData, getQuarterlyReportData } from '../services/reports.js';
import { generateReportPDF } from '../utils/pdfGenerator.js';

const router = express.Router();

/**
 * GET /api/reports/monthly/:year/:month
 * Get monthly report data as JSON
 */
router.get('/monthly/:year/:month', authMiddleware, async (req, res, next) => {
  try {
    const { year, month } = req.params;
    const yearInt = parseInt(year);
    const monthInt = parseInt(month);
    
    if (isNaN(yearInt) || isNaN(monthInt) || monthInt < 1 || monthInt > 12) {
      return res.status(400).json({ error: 'Invalid year or month' });
    }
    
    const reportData = await getMonthlyReportData(req.userId, yearInt, monthInt);
    res.json(reportData);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/reports/quarterly/:year/:quarter
 * Get quarterly report data as JSON
 */
router.get('/quarterly/:year/:quarter', authMiddleware, async (req, res, next) => {
  try {
    const { year, quarter } = req.params;
    const yearInt = parseInt(year);
    const quarterInt = parseInt(quarter);
    
    if (isNaN(yearInt) || isNaN(quarterInt) || quarterInt < 1 || quarterInt > 4) {
      return res.status(400).json({ error: 'Invalid year or quarter' });
    }
    
    const reportData = await getQuarterlyReportData(req.userId, yearInt, quarterInt);
    res.json(reportData);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/reports/monthly/:year/:month/pdf
 * Download monthly report as PDF
 */
router.get('/monthly/:year/:month/pdf', authMiddleware, async (req, res, next) => {
  try {
    const { year, month } = req.params;
    const yearInt = parseInt(year);
    const monthInt = parseInt(month);
    
    if (isNaN(yearInt) || isNaN(monthInt) || monthInt < 1 || monthInt > 12) {
      return res.status(400).json({ error: 'Invalid year or month' });
    }
    
    const reportData = await getMonthlyReportData(req.userId, yearInt, monthInt);
    const doc = generateReportPDF(reportData);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="Swasthya-Kosh-Report-${yearInt}-${String(monthInt).padStart(2, '0')}.pdf"`
    );
    
    doc.pipe(res);
    doc.end();
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/reports/quarterly/:year/:quarter/pdf
 * Download quarterly report as PDF
 */
router.get('/quarterly/:year/:quarter/pdf', authMiddleware, async (req, res, next) => {
  try {
    const { year, quarter } = req.params;
    const yearInt = parseInt(year);
    const quarterInt = parseInt(quarter);
    
    if (isNaN(yearInt) || isNaN(quarterInt) || quarterInt < 1 || quarterInt > 4) {
      return res.status(400).json({ error: 'Invalid year or quarter' });
    }
    
    const reportData = await getQuarterlyReportData(req.userId, yearInt, quarterInt);
    const doc = generateReportPDF(reportData);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="Swasthya-Kosh-Report-Q${quarterInt}-${yearInt}.pdf"`
    );
    
    doc.pipe(res);
    doc.end();
  } catch (err) {
    next(err);
  }
});

export default router;
