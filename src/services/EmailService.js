// EmailService.js - Enhanced email service with react-native-email-link integration
import { Linking } from 'react-native';
import { openComposer } from 'react-native-email-link';

class EmailService {
  constructor() {
    this.sentEmails = new Map(); // Track sent emails to prevent duplicates
    this.emailQueue = []; // Queue for email sending
    this.isInitialized = true; // Always ready with native email
    
    // Email configuration
    this.emailConfig = {
      supportEmail: 'carepoint@gmail.com',
      noreplyEmail: 'carepoint@gmail.com',
      fromName: 'Carepoint Medical Center'
    };
  }

  // Initialize email service
  async initialize() {
    try {
      this.isInitialized = true;
      console.log('📧 Email Service initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize email service:', error);
      this.isInitialized = false;
      return false;
    }
  }

  // Send Google Meet invitation emails using native email
  async sendMeetingInvitation(doctorInfo, patientInfo, appointmentDetails, meetingUrl) {
    try {
      const emailId = `meeting-${appointmentDetails.id}-${Date.now()}`;
      
      // Check if email already sent for this appointment
      if (this.sentEmails.has(appointmentDetails.id)) {
        console.log('📧 Email already sent for appointment:', appointmentDetails.id);
        return this.sentEmails.get(appointmentDetails.id);
      }

      console.log('📧 Preparing meeting invitation emails...');

      // Send email to patient via native email client
      const patientEmailResult = await this.sendEmailToPatient(
        doctorInfo, 
        patientInfo, 
        appointmentDetails, 
        meetingUrl
      );

      // Send confirmation email to doctor via native email client
      const doctorEmailResult = await this.sendEmailToDoctor(
        doctorInfo, 
        patientInfo, 
        appointmentDetails, 
        meetingUrl
      );

      // Store email record to prevent duplicates
      const emailRecord = {
        id: emailId,
        appointmentId: appointmentDetails.id,
        sentAt: new Date().toISOString(),
        recipients: [patientInfo.email, doctorInfo.email],
        meetingUrl: meetingUrl,
        status: 'prepared',
        method: 'native_email',
        emailResults: {
          patient: patientEmailResult,
          doctor: doctorEmailResult
        }
      };

      this.sentEmails.set(appointmentDetails.id, emailRecord);
      console.log('✅ Meeting invitation emails prepared successfully');

      return emailRecord;

    } catch (error) {
      console.error('❌ Error preparing meeting emails:', error);
      
      // Fallback to simulation
      return await this.simulateEmailSending(doctorInfo, patientInfo, appointmentDetails, meetingUrl);
    }
  }

  // Send email to patient using native email client
  async sendEmailToPatient(doctorInfo, patientInfo, appointmentDetails, meetingUrl) {
    try {
      const subject = `Google Meet Invitation - Medical Consultation with ${doctorInfo.name}`;
      const body = this.createPatientEmailBody(doctorInfo, patientInfo, appointmentDetails, meetingUrl);

      // Use react-native-email-link to open email client
      await openComposer({
        to: patientInfo.email,
        subject: subject,
        body: body
      });

      console.log('✅ Patient email composer opened');
      return { status: 'opened', method: 'native_email' };

    } catch (error) {
      console.error('❌ Error opening patient email composer:', error);
      
      // Fallback to URL scheme
      const mailtoUrl = this.createMailtoUrl(
        patientInfo.email,
        `Google Meet Invitation - Medical Consultation with ${doctorInfo.name}`,
        this.createPatientEmailBody(doctorInfo, patientInfo, appointmentDetails, meetingUrl)
      );
      
      try {
        await Linking.openURL(mailtoUrl);
        return { status: 'opened', method: 'mailto' };
      } catch (linkError) {
        console.error('❌ Error opening mailto URL:', linkError);
        return { status: 'failed', method: 'none' };
      }
    }
  }

  // Send confirmation email to doctor using native email client
  async sendEmailToDoctor(doctorInfo, patientInfo, appointmentDetails, meetingUrl) {
    try {
      const subject = `Meeting Confirmation - Google Meet with ${patientInfo.name}`;
      const body = this.createDoctorEmailBody(doctorInfo, patientInfo, appointmentDetails, meetingUrl);

      // Note: In a real app, you might want to send this automatically
      // For now, we'll prepare the email data
      console.log('✅ Doctor confirmation email prepared');
      return { 
        status: 'prepared', 
        method: 'prepared',
        emailData: {
          to: doctorInfo.email,
          subject: subject,
          body: body
        }
      };

    } catch (error) {
      console.error('❌ Error preparing doctor email:', error);
      return { status: 'failed', method: 'none' };
    }
  }

  // Create patient email body
  createPatientEmailBody(doctorInfo, patientInfo, appointmentDetails, meetingUrl) {
    return `Dear ${patientInfo.name},

You are invited to a medical consultation appointment via Google Meet.

👨‍⚕️ DOCTOR INFORMATION:
• Name: ${doctorInfo.name}
• Specialization: ${doctorInfo.specialization || 'General Medicine'}
• Email: ${doctorInfo.email}

📅 APPOINTMENT DETAILS:
• Date: ${appointmentDetails.date}
• Time: ${appointmentDetails.time}
• Duration: ${appointmentDetails.duration}
• Type: ${appointmentDetails.type}

🔗 JOIN GOOGLE MEET:
${meetingUrl}

📋 INSTRUCTIONS:
1. Click the Google Meet link above at your appointment time
2. Allow camera and microphone access when prompted
3. Wait for the doctor to join if you arrive first
4. Ensure you have a stable internet connection

📞 SUPPORT:
If you have any technical issues, please contact us at ${this.emailConfig.supportEmail}

⚕️ IMPORTANT NOTES:
• Please join 2-3 minutes before the scheduled time
• This consultation is confidential and will not be recorded
• If you need to reschedule, please contact us 24 hours in advance

Best regards,
${doctorInfo.name}
${this.emailConfig.fromName}`;
  }

  // Create doctor email body
  createDoctorEmailBody(doctorInfo, patientInfo, appointmentDetails, meetingUrl) {
    return `Dear ${doctorInfo.name},

This is a confirmation of the Google Meet consultation you've scheduled.

👤 PATIENT INFORMATION:
• Name: ${patientInfo.name}
• Email: ${patientInfo.email}

📅 APPOINTMENT DETAILS:
• Date: ${appointmentDetails.date}
• Time: ${appointmentDetails.time}
• Duration: ${appointmentDetails.duration}
• Type: ${appointmentDetails.type}

🔗 GOOGLE MEET LINK:
${meetingUrl}

📋 MEETING STATUS:
• The patient has been notified via email
• Meeting link has been added to in-app chat
• Notifications are set up for both parties

This is an automated confirmation email from the ${this.emailConfig.fromName}.

Best regards,
${this.emailConfig.fromName} Team`;
  }

  // Create mailto URL for fallback
  createMailtoUrl(to, subject, body) {
    const encodedSubject = encodeURIComponent(subject);
    const encodedBody = encodeURIComponent(body);
    return `mailto:${to}?subject=${encodedSubject}&body=${encodedBody}`;
  }

  // Enhanced simulation for development/testing
  async simulateEmailSending(doctorInfo, patientInfo, appointmentDetails, meetingUrl) {
    try {
      console.log('📧 Simulating email sending (Development mode)...');
      
      const patientBody = this.createPatientEmailBody(doctorInfo, patientInfo, appointmentDetails, meetingUrl);
      const doctorBody = this.createDoctorEmailBody(doctorInfo, patientInfo, appointmentDetails, meetingUrl);

      console.log('📧 [SIMULATED] Patient email:', {
        to: patientInfo.email,
        subject: `Google Meet Invitation - Medical Consultation with ${doctorInfo.name}`,
        body: patientBody.substring(0, 200) + '...'
      });

      console.log('📧 [SIMULATED] Doctor email:', {
        to: doctorInfo.email,
        subject: `Meeting Confirmation - Google Meet with ${patientInfo.name}`,
        body: doctorBody.substring(0, 200) + '...'
      });

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const emailRecord = {
        id: `meeting-${appointmentDetails.id}-${Date.now()}`,
        appointmentId: appointmentDetails.id,
        sentAt: new Date().toISOString(),
        recipients: [patientInfo.email, doctorInfo.email],
        meetingUrl: meetingUrl,
        status: 'simulated',
        method: 'simulation'
      };

      this.sentEmails.set(appointmentDetails.id, emailRecord);
      
      console.log('✅ Email sending simulated successfully');
      return emailRecord;

    } catch (error) {
      console.error('❌ Email simulation failed:', error);
      throw error;
    }
  }

  // Send email using native email client (general purpose)
  async sendEmail(to, subject, body) {
    try {
      await openComposer({
        to: to,
        subject: subject,
        body: body
      });
      
      console.log('✅ Email composer opened for:', to);
      return { success: true, method: 'native_email' };
    } catch (error) {
      console.error('❌ Error opening email composer:', error);
      
      // Fallback to mailto
      try {
        const mailtoUrl = this.createMailtoUrl(to, subject, body);
        await Linking.openURL(mailtoUrl);
        return { success: true, method: 'mailto' };
      } catch (linkError) {
        console.error('❌ Error opening mailto URL:', linkError);
        return { success: false, error: linkError.message };
      }
    }
  }

  // Get email status for an appointment
  getEmailStatus(appointmentId) {
    return this.sentEmails.get(appointmentId);
  }

  // Check if email was already sent for an appointment
  wasEmailSent(appointmentId) {
    return this.sentEmails.has(appointmentId);
  }

  // Get all sent emails
  getAllSentEmails() {
    return Array.from(this.sentEmails.values());
  }

  // Clear email records (for testing)
  clearEmailRecords() {
    this.sentEmails.clear();
    console.log('🗑️ Email records cleared');
  }

  // Test email service
  async testEmailService() {
    try {
      const testResult = await this.sendEmail(
        'test@example.com',
        'Email Service Test',
        'This is a test email to verify the email service integration.'
      );

      console.log('✅ Email service test result:', testResult);
      return testResult;

    } catch (error) {
      console.error('❌ Email service test failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Check if email client is available
  async isEmailAvailable() {
    try {
      const canOpen = await Linking.canOpenURL('mailto:');
      return canOpen;
    } catch (error) {
      console.error('Error checking email availability:', error);
      return false;
    }
  }
}

// Create and export singleton instance
const emailService = new EmailService();
export default emailService; 