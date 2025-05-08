import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
  patient: {
    name: {
      type: String,
      required: [true, 'Patient name is required']
    },
    email: {
      type: String,
      required: [true, 'Patient email is required']
    },
    phone: {
      type: String,
      required: [true, 'Patient phone is required']
    },
    age: Number,
    gender: String
  },
  doctor: {
    type: mongoose.Schema.ObjectId,
    ref: 'Doctor',
    required: [true, 'Appointment must have a doctor']
  },
  hospital: {
    type: mongoose.Schema.ObjectId,
    ref: 'Hospital',
    required: [true, 'Appointment must be associated with a hospital']
  },
  date: {
    type: Date,
    required: [true, 'Appointment date is required']
  },
  time: {
    type: String,
    required: [true, 'Appointment time is required']
  },
  reason: {
    type: String,
    required: [true, 'Reason for appointment is required']
  },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Cancelled', 'Completed', 'In Progress'],
    default: 'Pending'
  },
  symptoms: [String],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  // For recurring appointments
  isRecurring: {
    type: Boolean,
    default: false
  },
  // For tracking notifications
  notifications: [{
    type: {
      type: String,
      enum: ['email', 'sms'],
      required: true,
      default:"email",
    },
    status: {
      type: String,
      enum: ['pending', 'sent', 'failed'],
      default: 'pending'
    },
    sentAt: Date
  }]
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Pre-save middleware to update the updatedAt field
appointmentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Appointment = mongoose.model('Appointment', appointmentSchema); 
export default  Appointment;
