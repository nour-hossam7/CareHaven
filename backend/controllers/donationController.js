const Campaign = require('../models/Campaign');
const Donation = require('../models/Donation');
const asyncHandler = require('../middleware/asyncHandler');
const { validateDonationData, parsePagination, isValidObjectId } = require('../utils/validators');
const { httpError } = require('../utils/httpError');

exports.createDonation = asyncHandler(async (req, res) => {
  const validation = validateDonationData(req.body);

  if (!validation.isValid) {
    throw httpError(400, 'Donation validation failed', validation.errors);
  }

  const campaign = await Campaign.findById(validation.value.campaignId);
  if (!campaign) {
    throw httpError(404, 'Campaign not found');
  }

  if (campaign.status !== 'Active') {
    throw httpError(400, 'Donations can only be made to active campaigns');
  }

  const donation = await Donation.create({
    ...validation.value,
    donorId: req.user._id,
    donorName: req.user.name
  });

  campaign.collectedAmount += validation.value.amount;
  if (campaign.collectedAmount >= campaign.targetAmount) {
    campaign.status = 'Completed';
  }
  await campaign.save();

  res.status(201).json({
    success: true,
    message: 'Donation recorded successfully',
    donation,
    campaign
  });
});

exports.getMyDonations = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);

  const [donations, total] = await Promise.all([
    Donation.find({ donorId: req.user._id })
      .populate('campaignId', 'title category status')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }),
    Donation.countDocuments({ donorId: req.user._id })
  ]);

  res.status(200).json({
    success: true,
    donations,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    }
  });
});

exports.getCampaignDonations = asyncHandler(async (req, res) => {
  const { campaignId } = req.params;

  if (!isValidObjectId(campaignId)) {
    throw httpError(400, 'Invalid campaign ID');
  }

  const campaign = await Campaign.findById(campaignId);
  if (!campaign) {
    throw httpError(404, 'Campaign not found');
  }

  if (
    req.user.role === 'ngo'
    && (!req.user.ngoId || campaign.ngoId.toString() !== req.user.ngoId.toString())
  ) {
    throw httpError(403, 'You can only view donations for your own campaigns');
  }

  const { page, limit, skip } = parsePagination(req.query);
  const [donations, total] = await Promise.all([
    Donation.find({ campaignId })
      .select('-donorName')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }),
    Donation.countDocuments({ campaignId })
  ]);

  res.status(200).json({
    success: true,
    donations,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    }
  });
});
