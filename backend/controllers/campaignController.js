const Campaign = require('../models/Campaign');
const NGO = require('../models/NGO');
const asyncHandler = require('../middleware/asyncHandler');
const {
  validateCampaignData,
  parsePagination,
  isValidObjectId,
  cleanString,
  normalizeCategory,
  CAMPAIGN_STATUSES,
  CAMPAIGN_CATEGORIES
} = require('../utils/validators');
const { httpError } = require('../utils/httpError');

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const ensureCampaignAccess = (req, campaign) => {
  if (!req.user || req.user.role === 'admin') return;

  const userOwnsCampaign = campaign.createdBy && campaign.createdBy.toString() === req.user._id.toString();
  const userOwnsNgo = req.user.ngoId && campaign.ngoId.toString() === req.user.ngoId.toString();

  if (!userOwnsCampaign && !userOwnsNgo) {
    throw httpError(403, 'You can only manage campaigns owned by your NGO');
  }
};

exports.createCampaign = asyncHandler(async (req, res) => {
  const payload = {
    ...req.body,
    ngoId: req.body.ngoId || req.user.ngoId
  };
  const validation = validateCampaignData(payload);

  if (!validation.isValid) {
    throw httpError(400, 'Campaign validation failed', validation.errors);
  }

  const ngo = await NGO.findById(validation.value.ngoId);
  if (!ngo) {
    throw httpError(404, 'NGO not found');
  }

  if (req.user.role === 'ngo' && (!req.user.ngoId || req.user.ngoId.toString() !== ngo._id.toString())) {
    throw httpError(403, 'You can only create campaigns for your own NGO');
  }

  if (ngo.status !== 'Approved') {
    throw httpError(403, 'NGO must be approved before creating campaigns');
  }

  const campaign = await Campaign.create({
    ...validation.value,
    createdBy: req.user._id
  });

  res.status(201).json({
    success: true,
    message: 'Campaign created successfully',
    campaign
  });
});

exports.getAllCampaigns = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const filter = {};

  if (req.query.status) {
    const status = cleanString(req.query.status, 30);
    if (!CAMPAIGN_STATUSES.includes(status)) {
      throw httpError(400, `Invalid status. Allowed values: ${CAMPAIGN_STATUSES.join(', ')}`);
    }
    filter.status = status;
  }

  if (req.query.category) {
    const category = normalizeCategory(req.query.category);
    if (!CAMPAIGN_CATEGORIES.includes(category)) {
      throw httpError(400, `Invalid category. Allowed values: ${CAMPAIGN_CATEGORIES.join(', ')}`);
    }
    filter.category = category;
  }

  if (req.query.search) {
    const search = escapeRegex(cleanString(req.query.search, 100));
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  const [campaigns, total] = await Promise.all([
    Campaign.find(filter)
      .populate('ngoId', 'name email status')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }),
    Campaign.countDocuments(filter)
  ]);

  res.status(200).json({
    success: true,
    campaigns,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    }
  });
});

exports.getCampaignById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    throw httpError(400, 'Invalid campaign ID');
  }

  const campaign = await Campaign.findById(id).populate('ngoId', 'name email description website status');

  if (!campaign) {
    throw httpError(404, 'Campaign not found');
  }

  res.status(200).json({
    success: true,
    campaign
  });
});

exports.updateCampaign = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    throw httpError(400, 'Invalid campaign ID');
  }

  const campaign = await Campaign.findById(id);
  if (!campaign) {
    throw httpError(404, 'Campaign not found');
  }

  ensureCampaignAccess(req, campaign);

  const allowedFields = [
    'title',
    'description',
    'targetAmount',
    'collectedAmount',
    'category',
    'status',
    'startDate',
    'endDate',
    'image'
  ];
  const updates = {};

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  const validation = validateCampaignData(
    {
      title: updates.title ?? campaign.title,
      description: updates.description ?? campaign.description,
      ngoId: campaign.ngoId.toString(),
      targetAmount: updates.targetAmount ?? campaign.targetAmount,
      collectedAmount: updates.collectedAmount ?? campaign.collectedAmount,
      category: updates.category ?? campaign.category,
      status: updates.status ?? campaign.status,
      startDate: updates.startDate ?? campaign.startDate,
      endDate: updates.endDate ?? campaign.endDate,
      image: updates.image ?? campaign.image
    },
    { partial: false }
  );

  if (!validation.isValid) {
    throw httpError(400, 'Campaign validation failed', validation.errors);
  }

  Object.assign(campaign, updates);
  await campaign.save();

  res.status(200).json({
    success: true,
    message: 'Campaign updated successfully',
    campaign
  });
});

exports.deleteCampaign = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    throw httpError(400, 'Invalid campaign ID');
  }

  const campaign = await Campaign.findById(id);
  if (!campaign) {
    throw httpError(404, 'Campaign not found');
  }

  ensureCampaignAccess(req, campaign);
  await campaign.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Campaign deleted successfully'
  });
});

exports.getCampaignsByNGO = asyncHandler(async (req, res) => {
  const { ngoId } = req.params;

  if (!isValidObjectId(ngoId)) {
    throw httpError(400, 'Invalid NGO ID');
  }

  const { page, limit, skip } = parsePagination(req.query);

  const [campaigns, total] = await Promise.all([
    Campaign.find({ ngoId })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }),
    Campaign.countDocuments({ ngoId })
  ]);

  res.status(200).json({
    success: true,
    campaigns,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    }
  });
});
