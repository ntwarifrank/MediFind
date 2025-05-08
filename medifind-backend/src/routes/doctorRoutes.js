// doctorRoutes.js
import Doctor from '../models/Doctor.js';
import Hospital from '../models/Hospital.js';


// Get all doctors
export const getAllDoctors =  async (req, res) => {
  try {
    let query = {};

    // Filter by hospital if provided
    if (req.query.hospital) {
      query.hospital = req.query.hospital;
    }

    // Filter by specialty if provided
    if (req.query.specialty) {
      query.specialty = { $regex: req.query.specialty, $options: 'i' };
    }

    // Filter by status if provided
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Search by name if provided
    if (req.query.name) {
      query.name = { $regex: req.query.name, $options: 'i' };
    }

    const doctors = await Doctor.find(query);

    res.status(200).json({
      status: 'success',
      results: doctors.length,
      data: { doctors }
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

// Get single doctor
export const getDoctorById =  async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({
        status: 'fail',
        message: 'Doctor not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { doctor }
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

// Create new doctor (hospital admin only)
export const createDoctor =  async (req, res) => {
  try {
    const isHospitalAdmin = req.user.role === 'hospital_admin';
    const isSuperAdmin = req.user.role === 'super_admin';

    if (!isHospitalAdmin && !isSuperAdmin) {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to add a doctor'
      });
    }

    if (isHospitalAdmin) {
      const hospital = await Hospital.findById(req.body.hospital);

      if (!hospital) {
        return res.status(404).json({
          status: 'fail',
          message: 'Hospital not found'
        });
      }

      if (hospital.admin.toString() !== req.user.id) {
        return res.status(403).json({
          status: 'fail',
          message: 'You do not have permission to add a doctor to this hospital'
        });
      }
    }

    const doctor = await Doctor.create(req.body);

    res.status(201).json({
      status: 'success',
      data: { doctor }
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

// Update doctor
export const updateDoctor =  async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({
        status: 'fail',
        message: 'Doctor not found'
      });
    }

    const isHospitalAdmin = req.user.role === 'hospital_admin';
    const isSuperAdmin = req.user.role === 'super_admin';

    if (isHospitalAdmin) {
      const hospital = await Hospital.findById(doctor.hospital);

      if (!hospital || hospital.admin.toString() !== req.user.id) {
        return res.status(403).json({
          status: 'fail',
          message: 'You do not have permission to update this doctor'
        });
      }
    } else if (!isSuperAdmin) {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to update doctor information'
      });
    }

    const updatedDoctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      status: 'success',
      data: { doctor: updatedDoctor }
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

// Delete doctor
export const deleteDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({
        status: 'fail',
        message: 'Doctor not found'
      });
    }

    const isHospitalAdmin = req.user.role === 'hospital_admin';
    const isSuperAdmin = req.user.role === 'super_admin';

    if (isHospitalAdmin) {
      const hospital = await Hospital.findById(doctor.hospital);

      if (!hospital || hospital.admin.toString() !== req.user.id) {
        return res.status(403).json({
          status: 'fail',
          message: 'You do not have permission to delete this doctor'
        });
      }
    } else if (!isSuperAdmin) {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to delete doctors'
      });
    }

    await Doctor.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

// Get doctor's schedule and availability
export const getDoctorSchedule = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({
        status: 'fail',
        message: 'Doctor not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        availableDays: doctor.availableDays
      }
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

