import mongoose from 'mongoose';

const hospitalSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Hospital name is required'],
    trim: true,
    maxlength: [100, 'Hospital name cannot exceed 100 characters'],
  },
  district: {
    type: String,
    required: [true, 'District is required'],
    trim: true,
    maxlength: [50, 'District cannot exceed 50 characters'],
  },
  sector: {
    type: String,
    required: [true, 'Sector is required'],
    trim: true,
    maxlength: [50, 'Sector cannot exceed 50 characters'],
  },
  cell: {
    type: String,
    required: [true, 'Cell is required'],
    trim: true,
    maxlength: [50, 'Cell cannot exceed 50 characters'],
  },
  type: {
    type: String,
    required: [true, 'Hospital type is required'],
    enum: [
      'Referral Hospital',
      'District Hospital',
      'Private Hospital',
      'Specialized Hospital',
      'Health Center',
    ],
    default: 'Referral Hospital',
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters'],
  },
  specialties: {
    type: [String],
    required: [true, 'At least one specialty is required'],
    validate: {
      validator: (arr) => arr.length > 0,
      message: 'At least one specialty is required',
    },
  },
  rating: {
    type: Number,
    min: [0, 'Rating cannot be less than 0'],
    max: [5, 'Rating cannot exceed 5'],
    default: 0,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    default: 'default@hospital.com', // Prevent null values
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    match: [/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number'],
  },
  services: {
    type: [String],
    required: [true, 'At least one service is required'],
    validate: {
      validator: (arr) => arr.length > 0,
      message: 'At least one service is required',
    },
  },
  facilities: {
    type: [String],
    default: [],
  },
  workingDays: {
    monday: { type: Boolean, default: false },
    tuesday: { type: Boolean, default: false },
    wednesday: { type: Boolean, default: false },
    thursday: { type: Boolean, default: false },
    friday: { type: Boolean, default: false },
    saturday: { type: Boolean, default: false },
    sunday: { type: Boolean, default: false },
  },
  beds: {
    type: Number,
    min: [0, 'Number of beds cannot be negative'],
    default: 0,
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending'],
    default: 'pending',
  },
  logo: {
    type: String,
    trim: true,
    match: [/^https?:\/\/\S+$/, 'Please enter a valid URL for the logo'],
  },
  website: {
    type: String,
    trim: true,
    match: [/^https?:\/\/\S+$/, 'Please enter a valid URL for the website'],
  },
  founded: {
    type: Number,
    min: [1800, 'Founded year cannot be before 1800'],
    max: [new Date().getFullYear(), 'Founded year cannot be in the future'],
  },
  images: {
    type: [String],
    default: [],
    validate: {
      validator: (arr) => arr.every((url) => /^https?:\/\/\S+$/.test(url)),
      message: 'All image URLs must be valid',
    },
  },
  hospitalAdmin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: [true, 'Hospital admin is required']
  },
  reviews: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      rating: {
        type: Number,
        min: [0, 'Rating cannot be less than 0'],
        max: [5, 'Rating cannot exceed 5'],
        required: true,
      },
      comment: {
        type: String,
        trim: true,
        maxlength: [500, 'Review comment cannot exceed 500 characters'],
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});


const Hospital = mongoose.model('Hospital', hospitalSchema);
export default Hospital;