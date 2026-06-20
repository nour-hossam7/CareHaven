const crypto = require('crypto');
const mongoose = require('mongoose');

const TOKEN_TTL_HOURS = Number(process.env.AUTH_TOKEN_TTL_HOURS) || 24;
const PASSWORD_ITERATIONS = 120000;
const PASSWORD_KEY_LENGTH = 64;
const PASSWORD_DIGEST = 'sha512';

const tokenSchema = new mongoose.Schema(
  {
    tokenHash: {
      type: String,
      required: true
    },
    expiresAt: {
      type: Date,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: 120
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254
    },
    role: {
      type: String,
      enum: ['donor', 'ngo', 'admin'],
      default: 'donor',
      index: true
    },
    passwordHash: {
      type: String,
      required: true,
      select: false
    },
    passwordSalt: {
      type: String,
      required: true,
      select: false
    },
    ngoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'NGO',
      default: null
    },
    tokens: {
      type: [tokenSchema],
      default: [],
      select: false
    }
  },
  {
    timestamps: true
  }
);

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

userSchema.methods.setPassword = function setPassword(password) {
  this.passwordSalt = crypto.randomBytes(16).toString('hex');
  this.passwordHash = crypto
    .pbkdf2Sync(password, this.passwordSalt, PASSWORD_ITERATIONS, PASSWORD_KEY_LENGTH, PASSWORD_DIGEST)
    .toString('hex');
};

userSchema.methods.verifyPassword = function verifyPassword(password) {
  const candidate = crypto
    .pbkdf2Sync(password, this.passwordSalt, PASSWORD_ITERATIONS, PASSWORD_KEY_LENGTH, PASSWORD_DIGEST)
    .toString('hex');

  return crypto.timingSafeEqual(Buffer.from(candidate, 'hex'), Buffer.from(this.passwordHash, 'hex'));
};

userSchema.methods.createAuthToken = function createAuthToken() {
  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + TOKEN_TTL_HOURS * 60 * 60 * 1000);

  this.tokens = (this.tokens || []).filter((session) => session.expiresAt > new Date());
  this.tokens.push({ tokenHash, expiresAt });

  return {
    token,
    expiresAt
  };
};

userSchema.statics.hashToken = hashToken;

module.exports = mongoose.model('User', userSchema);
