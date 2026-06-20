const NGO = require('../models/NGO');
const asyncHandler = require('../middleware/asyncHandler');
const {
  validateNGOData,
  parsePagination,
  isValidObjectId,
  cleanString,
  NGO_STATUSES
} = require('../utils/validators');
const { httpError } = require('../utils/httpError');

const ensureNGOAccess = (req, ngoId) => {
  if (!req.user || req.user.role === 'admin') return;

  if (!req.user.ngoId || req.user.ngoId.toString() !== ngoId.toString()) {
    throw httpError(403, 'You can only manage your own NGO profile');
  }
};

exports.registerNGO = asyncHandler(async (req, res) => {
  const validation = validateNGOData(req.body);

  if (!validation.isValid) {
    throw httpError(400, 'NGO validation failed', validation.errors);
  }

  const existingNGO = await NGO.findOne({
    $or: [
      { email: validation.value.email },
      { registrationNumber: validation.value.registrationNumber }
    ]
  });

  if (existingNGO) {
    throw httpError(409, 'NGO with this email or registration number already exists');
  }

  const ngo = await NGO.create({
    ...validation.value,
    status: 'Pending'
  });

  res.status(201).json({
    success: true,
    message: 'NGO registered successfully. Awaiting admin approval.',
    ngo
  });
});

exports.getAllNGOs = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const filter = {};

  if (req.query.status) {
    const status = cleanString(req.query.status, 30);
    if (!NGO_STATUSES.includes(status)) {
      throw httpError(400, `Invalid status. Allowed values: ${NGO_STATUSES.join(', ')}`);
    }
    filter.status = status;
  }

  const [ngos, total] = await Promise.all([
    NGO.find(filter)
      .populate('approvedBy', 'name email')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }),
    NGO.countDocuments(filter)
  ]);

  res.status(200).json({
    success: true,
    ngos,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    }
  });
});

exports.getNGOById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    throw httpError(400, 'Invalid NGO ID');
  }

  const ngo = await NGO.findById(id).populate('approvedBy', 'name email');

  if (!ngo) {
    throw httpError(404, 'NGO not found');
  }

  res.status(200).json({
    success: true,
    ngo
  });
});

exports.approveNGO = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    throw httpError(400, 'Invalid NGO ID');
  }

  const ngo = await NGO.findByIdAndUpdate(
    id,
    {
      status: 'Approved',
      approvedBy: req.user._id,
      approvalDate: new Date(),
      rejectionReason: null
    },
    { new: true, runValidators: true }
  ).populate('approvedBy', 'name email');

  if (!ngo) {
    throw httpError(404, 'NGO not found');
  }

  res.status(200).json({
    success: true,
    message: 'NGO approved successfully',
    ngo
  });
});

exports.rejectNGO = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const rejectionReason = cleanString(req.body.rejectionReason, 1000);

  if (!isValidObjectId(id)) {
    throw httpError(400, 'Invalid NGO ID');
  }

  if (!rejectionReason) {
    throw httpError(400, 'Rejection reason is required');
  }

  const ngo = await NGO.findByIdAndUpdate(
    id,
    {
      status: 'Rejected',
      approvedBy: req.user._id,
      rejectionReason,
      approvalDate: new Date()
    },
    { new: true, runValidators: true }
  ).populate('approvedBy', 'name email');

  if (!ngo) {
    throw httpError(404, 'NGO not found');
  }

  res.status(200).json({
    success: true,
    message: 'NGO rejected successfully',
    ngo
  });
});

exports.getPendingNGOs = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);

  const [ngos, total] = await Promise.all([
    NGO.find({ status: 'Pending' })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: 1 }),
    NGO.countDocuments({ status: 'Pending' })
  ]);

  res.status(200).json({
    success: true,
    ngos,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    }
  });
});

exports.updateNGO = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    throw httpError(400, 'Invalid NGO ID');
  }

  ensureNGOAccess(req, id);

  const allowedFields = ['name', 'email', 'phone', 'registrationNumber', 'description', 'website', 'documents'];
  const updates = {};

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  const validation = validateNGOData(updates, { partial: true });

  if (!validation.isValid) {
    throw httpError(400, 'NGO validation failed', validation.errors);
  }

  const ngo = await NGO.findByIdAndUpdate(
    id,
    validation.value,
    { new: true, runValidators: true }
  );

  if (!ngo) {
    throw httpError(404, 'NGO not found');
  }

  res.status(200).json({
    success: true,
    message: 'NGO updated successfully',
    ngo
  });
});

exports.getNGOStatistics = asyncHandler(async (req, res) => {
  const [total, approved, pending, rejected] = await Promise.all([
    NGO.countDocuments(),
    NGO.countDocuments({ status: 'Approved' }),
    NGO.countDocuments({ status: 'Pending' }),
    NGO.countDocuments({ status: 'Rejected' })
  ]);

  res.status(200).json({
    success: true,
    statistics: {
      total,
      approved,
      pending,
      rejected
    }
  });
});
