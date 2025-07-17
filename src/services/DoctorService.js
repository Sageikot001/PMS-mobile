// DoctorService.js - Service to manage doctor information and authentication
import { mockProfessionals } from '../data/mockProfessionals';

class DoctorService {
  constructor() {
    this.currentDoctor = null;
    this.isInitialized = false;
  }

  // Initialize the service with current doctor data
  // In a real app, this would be called after authentication
  initialize(doctorData) {
    this.currentDoctor = doctorData;
    this.isInitialized = true;
  }

  // Get current doctor's information
  getCurrentDoctor() {
    if (!this.isInitialized || !this.currentDoctor) {
      // Fallback to mock data for development
      return mockProfessionals.find(prof => prof.type === 'doctor') || {
        id: '1',
        type: 'doctor',
        firstName: 'John',
        lastName: 'Smith',
        email: 'ikotnsikak@gmail.com',
        phone: '+1 (555) 123-4567',
        specialization: 'Internal Medicine',
        licenseNumber: 'MD123456'
      };
    }
    return this.currentDoctor;
  }

  // Get current doctor's email
  getCurrentDoctorEmail() {
    const doctor = this.getCurrentDoctor();
    return doctor.email;
  }

  // Get current doctor's full name
  getCurrentDoctorName() {
    const doctor = this.getCurrentDoctor();
    return `Dr. ${doctor.firstName} ${doctor.lastName}`;
  }

  // Get current doctor's contact information
  getCurrentDoctorContact() {
    const doctor = this.getCurrentDoctor();
    return {
      email: doctor.email,
      phone: doctor.phone,
      name: `Dr. ${doctor.firstName} ${doctor.lastName}`,
      specialization: doctor.specialization,
      licenseNumber: doctor.licenseNumber
    };
  }

  // Set current doctor (for login/authentication)
  setCurrentDoctor(doctorData) {
    this.currentDoctor = doctorData;
    this.isInitialized = true;
  }

  // Clear current doctor (for logout)
  clearCurrentDoctor() {
    this.currentDoctor = null;
    this.isInitialized = false;
  }

  // Check if doctor is logged in
  isLoggedIn() {
    return this.isInitialized && this.currentDoctor !== null;
  }
}

// Create and export a singleton instance
const doctorService = new DoctorService();
export default doctorService; 