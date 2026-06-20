const Campaign = require('../models/Campaign');
const Report = require('../models/Report');
const asyncHandler = require('../middleware/asyncHandler');
const { validateReportData, parsePagination, isValidObjectId } = require('../utils/validators');
const { httpError } = require('../utils/httpError');

const ensureCampaignOwner = (req, campaign) => {
  if (req.user.role === 'admin') return;

  if (!req.user.ngoId || campaign.ngoId.toString() !== req.user.ngoId.toString()) {
    throw httpError(403, 'You can only upload reports for your own NGO campaigns');
  }
};

exports.uploadReport = asyncHandler(async (req, res) => {
  const validation = validateReportData(req.body);

  if (!validation.isValid) {
    throw httpError(400, 'Report validation failed', validation.errors);
  }

  const campaign = await Campaign.findById(validation.value.campaignId);
  if (!campaign) {
    throw httpError(404, 'Campaign not found');
  }

  ensureCampaignOwner(req, campaign);

  const report = await Report.create({
    ...validation.value,
    uploadedBy: req.user._id
  });

  res.status(201).json({
    success: true,
    message: 'Report uploaded successfully',
    report
  });
});

exports.downloadReport = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    throw httpError(400, 'Invalid report ID');
  }

  const report = await Report.findById(id).select('+fileData').populate('campaignId', 'ngoId');
  if (!report) {
    throw httpError(404, 'Report not found');
  }

  if (req.user) {
    const campaign = report.campaignId;
    if (req.user.role === 'ngo') {
      if (!req.user.ngoId || campaign.ngoId.toString() !== req.user.ngoId.toString()) {
        throw httpError(403, 'You can only download reports for your own NGO campaigns');
      }
    } else if (req.user.role !== 'admin') {
      throw httpError(403, 'You do not have permission to download this report');
    }
  }

  if (!report.fileData) {
    throw httpError(404, 'Report file is not available');
  }

  const base64 = report.fileData.includes(',')
    ? report.fileData.split(',')[1]
    : report.fileData;

  res.setHeader('Content-Type', report.fileType || 'application/octet-stream');
  res.setHeader('Content-Disposition', `attachment; filename="${report.fileName}"`);
  res.send(Buffer.from(base64, 'base64'));
});

exports.getReportsByCampaign = asyncHandler(async (req, res) => {
  const { campaignId } = req.params;

  if (!isValidObjectId(campaignId)) {
    throw httpError(400, 'Invalid campaign ID');
  }

  const { page, limit, skip } = parsePagination(req.query);
  const [reports, total] = await Promise.all([
    Report.find({ campaignId })
      .populate('uploadedBy', 'name role')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }),
    Report.countDocuments({ campaignId })
  ]);

  res.status(200).json({
    success: true,
    reports,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    }
  });
});
