import Appointment from '../models/Appointment.js';
import Hospital from '../models/Hospital.js';
import Doctor from '../models/Doctor.js';

export const createAppointment = async (req, res) => {
  try {
    // Validate required fields based on the appointment model
    const { patient, doctor, hospital, date, time, reason } = req.body;
    
    if (!patient || !patient.name || !patient.email || !patient.phone) {
      return res.status(400).json({
        status: 'fail',
        message: 'Patient information is incomplete. Name, email, and phone are required.'
      });
    }
    
    if (!doctor) {
      return res.status(400).json({ status: 'fail', message: 'Doctor is required' });
    }
    
    if (!hospital) {
      return res.status(400).json({ status: 'fail', message: 'Hospital is required' });
    }
    
    if (!date) {
      return res.status(400).json({ status: 'fail', message: 'Appointment date is required' });
    }
    
    if (!time) {
      return res.status(400).json({ status: 'fail', message: 'Appointment time is required' });
    }
    
    if (!reason) {
      return res.status(400).json({ status: 'fail', message: 'Reason for appointment is required' });
    }

    // Validate that doctor and hospital exist
    const doctorExists = await Doctor.findById(req.body.doctor);
    if (!doctorExists) {
      return res.status(404).json({ status: 'fail', message: 'Doctor not found' });
    }

    const hospitalExists = await Hospital.findById(req.body.hospital);
    if (!hospitalExists) {
      return res.status(404).json({ status: 'fail', message: 'Hospital not found' });
    }
    
    // Process the appointment data
    const appointmentData = {
      patient,
      doctor,
      hospital,
      date,
      time,
      reason,
      status: req.body.status || 'Pending',
      symptoms: req.body.symptoms || [],
      isRecurring: req.body.isRecurring || false,
      notifications: req.body.notifications || [{ type: 'email', status: 'pending' }]
    };

    const appointment = await Appointment.create(appointmentData);

    res.status(201).json({ status: 'success', data: { appointment } });
  } catch (err) {
    console.error('Error creating appointment:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
};

export const getMyAppointments = async (req, res) => {
  try {
    const userEmail = req.user.email;

    if (!userEmail) {
      return res.status(400).json({ status: 'fail', message: 'User email not found' });
    }

    const appointments = await Appointment.find({ 'patient.email': userEmail })
      .sort({ date: -1, time: 1 });

    res.status(200).json({ status: 'success', results: appointments.length, data: { appointments } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

export const updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status || !['Pending', 'Confirmed', 'Cancelled', 'Completed', 'In Progress'].includes(status)) {
      return res.status(400).json({ status: 'fail', message: 'Invalid status provided' });
    }

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ status: 'fail', message: 'Appointment not found' });
    }

    appointment.status = status;
    await appointment.save();

    res.status(200).json({ status: 'success', data: { appointment } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

export const getAvailableTimes = async (req, res) => {
  try {
    const { doctor, date, hospital } = req.query;

    if (!doctor || !date || !hospital) {
      return res.status(400).json({ status: 'fail', message: 'Doctor, date, and hospital are required' });
    }

    const bookedAppointments = await Appointment.find({
      doctor,
      hospital,
      date: {
        $gte: new Date(date),
        $lt: new Date(new Date(date).setDate(new Date(date).getDate() + 1))
      },
      status: { $nin: ['Cancelled'] }
    });

    const bookedTimes = bookedAppointments.map(app => app.time);
    const allTimeSlots = generateTimeSlots();
    const availableTimes = allTimeSlots.filter(time => !bookedTimes.includes(time));

    res.status(200).json({ status: 'success', data: { availableTimes } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

function generateTimeSlots() {
  const slots = [];
  const startHour = 9;
  const endHour = 17;

  for (let hour = startHour; hour < endHour; hour++) {
    const hourFormatted = hour <= 12 ? hour : hour - 12;
    const amPm = hour < 12 ? 'AM' : 'PM';
    slots.push(`${hourFormatted}:00 ${amPm}`);
    slots.push(`${hourFormatted}:30 ${amPm}`);
  }

  return slots;
}

export const getAllAppointments = async (req, res) => {
  try {
    if (!['hospital_admin', 'super_admin', 'doctor', 'staff'].includes(req.user.role)) {
      return res.status(403).json({ status: 'fail', message: 'You do not have permission to view appointments' });
    }

    let query = {};

    if (req.user.role === 'hospital_admin') {
      const hospital = await Hospital.findOne({ admin: req.user.id });
      if (!hospital) return res.status(404).json({ status: 'fail', message: 'Hospital not found for this admin' });
      query.hospital = hospital._id;
    }

    if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ email: req.user.email });
      if (!doctor) return res.status(404).json({ status: 'fail', message: 'Doctor record not found' });
      query.doctor = doctor._id;
    }

    if (req.query.hospital) query.hospital = req.query.hospital;
    if (req.query.doctor) query.doctor = req.query.doctor;
    if (req.query.status) query.status = req.query.status;

    const appointments = await Appointment.find(query).sort({ date: -1, time: 1 });

    res.status(200).json({ status: 'success', results: appointments.length, data: { appointments } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

export const getTodayAppointments = async (req, res) => {
  try {
    if (!['hospital_admin', 'super_admin', 'doctor', 'staff'].includes(req.user.role)) {
      return res.status(403).json({ status: 'fail', message: 'You do not have permission to view appointments' });
    }

    let hospitalId;

    if (req.user.role === 'hospital_admin') {
      const hospital = await Hospital.findOne({ admin: req.user.id });
      if (!hospital) return res.status(404).json({ status: 'fail', message: 'Hospital not found for this admin' });
      hospitalId = hospital._id;
    } else if (req.query.hospital) {
      hospitalId = req.query.hospital;
    }

    const todayAppointments = await Appointment.findToday(hospitalId);

    res.status(200).json({ status: 'success', results: todayAppointments.length, data: { appointments: todayAppointments } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

export const getAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ status: 'fail', message: 'Appointment not found' });

    res.status(200).json({ status: 'success', data: { appointment } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

export const updateAppointment = async (req, res) => {
  try {
    const updatedAppointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!updatedAppointment) return res.status(404).json({ status: 'fail', message: 'Appointment not found' });

    res.status(200).json({ status: 'success', data: { appointment: updatedAppointment } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

export const deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);
    if (!appointment) return res.status(404).json({ status: 'fail', message: 'Appointment not found' });

    res.status(204).json({ status: 'success', data: null });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};
