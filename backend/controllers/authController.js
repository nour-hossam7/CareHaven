const User = require('../models/User');
const NGO = require('../models/NGO');
const asyncHandler = require('../middleware/asyncHandler');
const { validateAuthRegistration, validateEmail, cleanString } = require('../utils/validators');
const { httpError } = require('../utils/httpError');

const serializeUser = async (user) => {
  const profile = {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    userType: user.role,
    ngoId: user.ngoId || null
  };

  if (user.ngoId) {
    const ngo = await NGO.findById(user.ngoId).select('name status rejectionReason');
    if (ngo) {
      profile.organizationName = ngo.name;
      profile.ngoStatus = ngo.status;
      if (ngo.status === 'Rejected' && ngo.rejectionReason) {
        profile.rejectionReason = ngo.rejectionReason;
      }
    }
  }

  return profile;
};

exports.register = asyncHandler(async (req, res) => {
  const validation = validateAuthRegistration(req.body);

  if (!validation.isValid) {
    throw httpError(400, 'Registration validation failed', validation.errors);
  }

  const { name, email, role, password, ngo } = validation.value;

  if (role === 'admin' && cleanString(req.body.adminRegistrationKey) !== process.env.ADMIN_REGISTRATION_KEY) {
    throw httpError(403, 'Admin registration key is invalid');
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw httpError(409, 'Email is already registered');
  }

  if (role === 'ngo') {
    const existingNGO = await NGO.findOne({
      $or: [{ email }, { registrationNumber: ngo.registrationNumber }]
    });

    if (existingNGO) {
      throw httpError(409, 'NGO email or registration number is already registered');
    }
  }

  const user = new User({ name, email, role });
  user.setPassword(password);
  const session = user.createAuthToken();
  await user.save();

  if (role === 'ngo') {
    const organization = await NGO.create({
      ...ngo,
      ownerUserId: user._id,
      status: 'Pending'
    });

    user.ngoId = organization._id;
    await user.save();
  }

  res.status(201).json({
    success: true,
    message: role === 'ngo'
      ? 'Account created. NGO profile is pending admin approval.'
      : 'Account created successfully.',
    token: session.token,
    expiresAt: session.expiresAt,
    user: await serializeUser(user)
  });
});

exports.login = asyncHandler(async (req, res) => {
  const email = cleanString(req.body.email, 254).toLowerCase();
  const password = req.body.password;

  if (!validateEmail(email) || typeof password !== 'string') {
    throw httpError(400, 'Valid email and password are required');
  }

  const user = await User.findOne({ email }).select('+passwordHash +passwordSalt +tokens');

  if (!user || !user.verifyPassword(password)) {
    throw httpError(401, 'Invalid email or password');
  }

  const session = user.createAuthToken();
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Login successful',
    token: session.token,
    expiresAt: session.expiresAt,
    user: await serializeUser(user)
  });
});

exports.logout = asyncHandler(async (req, res) => {
  await User.updateOne(
    { _id: req.user._id },
    { $pull: { tokens: { tokenHash: req.tokenHash } } }
  );

  res.status(200).json({
    success: true,
    message: 'Logout successful'
  });
});

exports.getMe = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    user: await serializeUser(req.user)
  });
});
