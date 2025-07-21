export const providers = {
  pharmacists: [
    {
      id: '1',
      name: 'Dr. Sarah Johnson',
      specialty: 'Clinical Pharmacist',
      experience: 8,
      rating: 4.9,
      consultations: 1200,
      hourlyRate: 5000,
      about: 'Specialized in medication therapy management and chronic disease management. Passionate about helping patients understand their medications and achieve optimal health outcomes.',
      specializations: [
        'Medication Therapy Management',
        'Diabetes Care',
        'Cardiovascular Health',
        'Geriatric Care'
      ],
      education: [
        {
          institution: 'University of Michigan',
          degree: 'Doctor of Pharmacy (Pharm.D.)',
          year: '2015'
        }
      ],
      languages: ['English', 'Spanish'],
      currentInstitution: 'HealthPlus Pharmacy',
      institutionAddress: '123 Healthcare Avenue',
      availability: {
        monday: ['09:00', '10:00', '11:00', '14:00', '15:00'],
        tuesday: ['09:00', '10:00', '11:00', '14:00', '15:00'],
        wednesday: ['09:00', '10:00', '11:00', '14:00', '15:00'],
        thursday: ['09:00', '10:00', '11:00', '14:00', '15:00'],
        friday: ['09:00', '10:00', '11:00', '14:00', '15:00']
      }
    },
    {
      id: '2',
      name: 'Dr. James Wilson',
      specialty: 'Oncology Pharmacist',
      experience: 12,
      rating: 4.8,
      consultations: 1500,
      hourlyRate: 6000,
      about: 'Specialized in oncology pharmacy practice with extensive experience in chemotherapy management.',
      specializations: [
        'Oncology',
        'Pain Management',
        'Chemotherapy',
        'Supportive Care'
      ],
      education: [
        {
          institution: 'Johns Hopkins University',
          degree: 'Doctor of Pharmacy (Pharm.D.)',
          year: '2011'
        }
      ],
      languages: ['English'],
      currentInstitution: 'MedPlus Pharmacy',
      institutionAddress: '456 Oncology Center',
      availability: {
        monday: ['09:00', '10:00', '11:00', '14:00', '15:00'],
        wednesday: ['09:00', '10:00', '11:00', '14:00', '15:00'],
        friday: ['09:00', '10:00', '11:00', '14:00', '15:00']
      }
    },
    {
      id: '3',
      name: 'Pharm. Aisha Mohammed',
      specialty: 'Community Pharmacist',
      experience: 6,
      rating: 4.7,
      consultations: 800,
      hourlyRate: 4000,
      about: 'Dedicated community pharmacist with a focus on patient education and preventive care.',
      specializations: [
        'Patient Education',
        'Medication Reviews',
        'Vaccination Services',
        'Wellness Consulting'
      ],
      education: [
        {
          institution: 'University of Lagos',
          degree: 'Bachelor of Pharmacy (B.Pharm)',
          year: '2017'
        }
      ],
      languages: ['English', 'Yoruba', 'Hausa'],
      currentInstitution: 'Community Care Pharmacy',
      institutionAddress: '789 Local Street',
      availability: {
        monday: ['09:00', '10:00', '11:00', '14:00', '15:00'],
        tuesday: ['09:00', '10:00', '11:00', '14:00', '15:00'],
        thursday: ['09:00', '10:00', '11:00', '14:00', '15:00']
      }
    },
    {
      id: '4',
      name: 'Pharm. Emily Chen',
      specialty: 'Pediatric Pharmacist',
      experience: 9,
      rating: 4.9,
      consultations: 1100,
      hourlyRate: 5500,
      about: 'Specialized in pediatric pharmacy with expertise in managing medications for children with chronic conditions.',
      specializations: [
        'Pediatric Care',
        'Asthma Management',
        'Allergy Treatment',
        'Growth & Development'
      ],
      education: [
        {
          institution: 'University of California',
          degree: 'Bachelor of Pharmacy (B.Pharm)',
          year: '2014'
        }
      ],
      languages: ['English', 'Mandarin'],
      currentInstitution: 'KidsPlus Pharmacy',
      institutionAddress: '321 Childrens Way',
      availability: {
        tuesday: ['09:00', '10:00', '11:00', '14:00', '15:00'],
        wednesday: ['09:00', '10:00', '11:00', '14:00', '15:00'],
        friday: ['09:00', '10:00', '11:00', '14:00', '15:00']
      }
    },
    {
      id: '5',
      name: 'Pharm. David Okonkwo',
      specialty: 'Mental Health Pharmacist',
      experience: 10,
      rating: 4.8,
      consultations: 950,
      hourlyRate: 5500,
      about: 'Specialized in psychiatric pharmacy with focus on mental health medication management.',
      specializations: [
        'Mental Health',
        'Depression Treatment',
        'Anxiety Management',
        'Behavioral Health'
      ],
      education: [
        {
          institution: 'University of Ibadan',
          degree: 'Bachelor of Pharmacy (B.Pharm)',
          year: '2013'
        }
      ],
      languages: ['English', 'Igbo'],
      currentInstitution: 'Wellness Pharmacy',
      institutionAddress: '567 Mental Health Avenue',
      availability: {
        monday: ['09:00', '10:00', '11:00', '14:00', '15:00'],
        thursday: ['09:00', '10:00', '11:00', '14:00', '15:00'],
        friday: ['09:00', '10:00', '11:00', '14:00', '15:00']
      }
    },
    {
      id: '6',
      name: 'Pharm. Chioma Eze',
      specialty: 'Community Pharmacist',
      experience: 4,
      rating: 4.6,
      consultations: 500,
      hourlyRate: 3500,
      about: 'Community pharmacist focused on family healthcare and medication counseling.',
      specializations: [
        'Family Healthcare',
        'Medication Counseling',
        'Preventive Care',
        'Health Screening'
      ],
      education: [
        {
          institution: 'University of Nigeria',
          degree: 'Bachelor of Pharmacy (B.Pharm)',
          year: '2019'
        }
      ],
      languages: ['English', 'Igbo'],
      currentInstitution: 'FamilyCare Pharmacy',
      institutionAddress: '45 Community Road',
      availability: {
        monday: ['09:00', '10:00', '11:00', '14:00', '15:00'],
        wednesday: ['09:00', '10:00', '11:00', '14:00', '15:00'],
        friday: ['09:00', '10:00', '11:00', '14:00', '15:00']
      }
    },
    {
      id: '7',
      name: 'Dr. Rachel Thompson',
      specialty: 'Clinical Pharmacist',
      experience: 11,
      rating: 4.9,
      consultations: 1600,
      hourlyRate: 6500,
      about: 'Clinical pharmacist specializing in infectious diseases and antimicrobial stewardship.',
      specializations: [
        'Infectious Diseases',
        'Antimicrobial Stewardship',
        'HIV Management',
        'Travel Medicine'
      ],
      education: [
        {
          institution: 'University of Texas',
          degree: 'Doctor of Pharmacy (Pharm.D.)',
          year: '2012'
        }
      ],
      languages: ['English'],
      currentInstitution: 'Central Hospital Pharmacy',
      institutionAddress: '789 Hospital Boulevard',
      availability: {
        tuesday: ['09:00', '10:00', '11:00', '14:00', '15:00'],
        thursday: ['09:00', '10:00', '11:00', '14:00', '15:00'],
        friday: ['09:00', '10:00', '11:00', '14:00', '15:00']
      }
    },
    {
      id: '8',
      name: 'Pharm. Abdul Rahman',
      specialty: 'Retail Pharmacist',
      experience: 7,
      rating: 4.7,
      consultations: 900,
      hourlyRate: 4000,
      about: 'Experienced retail pharmacist with expertise in diabetes care and medication management.',
      specializations: [
        'Diabetes Care',
        'Medication Management',
        'Patient Counseling',
        'Chronic Disease Management'
      ],
      education: [
        {
          institution: 'Ahmadu Bello University',
          degree: 'Bachelor of Pharmacy (B.Pharm)',
          year: '2016'
        }
      ],
      languages: ['English', 'Hausa', 'Arabic'],
      currentInstitution: 'MediCare Pharmacy',
      institutionAddress: '123 Market Street',
      availability: {
        monday: ['09:00', '10:00', '11:00', '14:00', '15:00'],
        tuesday: ['09:00', '10:00', '11:00', '14:00', '15:00'],
        saturday: ['09:00', '10:00', '11:00', '14:00', '15:00']
      }
    }
  ],
  doctors: [
    {
      id: '1',
      name: 'Dr. John Smith',
      specialty: 'Cardiology',
      experience: 15,
      rating: 4.9,
      consultations: 2000,
      hourlyRate: 15000,
      about: 'Board-certified cardiologist with 15 years of experience specializing in preventive cardiology and heart disease management. Fellowship trained at Johns Hopkins with expertise in cardiovascular interventions.',
      specializations: [
        'Preventive Cardiology',
        'Heart Disease Management',
        'Hypertension Treatment', 
        'Cardiac Rehabilitation',
        'Cardiovascular Interventions'
      ],
      education: [
        {
          institution: 'University of Lagos',
          degree: 'Doctor of Medicine (MD)',
          year: '2008'
        },
        {
          institution: 'Johns Hopkins University',
          degree: 'Fellowship in Cardiology',
          year: '2013'
        }
      ],
      languages: ['English'],
      currentInstitution: 'Lagos University Teaching Hospital',
      institutionAddress: '1 Idi-Araba Road, Surulere, Lagos',
      availability: {
        monday: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
        tuesday: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
        wednesday: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
        thursday: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
        friday: ['09:00', '10:00', '11:00', '14:00', '15:00']
      }
    },
    {
      id: '2',
      name: 'Dr. Michael Chen',
      specialty: 'General Practitioner',
      experience: 12,
      rating: 4.8,
      consultations: 2500,
      hourlyRate: 8000,
      about: 'Board-certified general practitioner with expertise in preventive medicine and chronic disease management.',
      specializations: [
        'Preventive Medicine',
        'Family Medicine',
        'Chronic Disease Management',
        'Mental Health'
      ],
      education: [
        {
          institution: 'Stanford University',
          degree: 'Doctor of Medicine (MD)',
          year: '2011'
        },
        {
          institution: 'UCLA',
          degree: 'Residency in Family Medicine',
          year: '2014'
        }
      ],
      languages: ['English', 'Mandarin'],
      currentInstitution: 'City General Hospital',
      institutionAddress: '789 Medical Center Drive',
      availability: {
        monday: ['09:00', '10:00', '11:00', '14:00', '15:00'],
        tuesday: ['09:00', '10:00', '11:00', '14:00', '15:00'],
        thursday: ['09:00', '10:00', '11:00', '14:00', '15:00']
      }
    },
    {
      id: '3',
      name: 'Dr. Fatima Suleiman',
      specialty: 'Pediatrician',
      experience: 14,
      rating: 4.9,
      consultations: 2200,
      hourlyRate: 10000,
      about: 'Experienced pediatrician specializing in newborn care and childhood development.',
      specializations: [
        'Newborn Care',
        'Child Development',
        'Pediatric Nutrition',
        'Childhood Immunizations'
      ],
      education: [
        {
          institution: 'University of Ibadan',
          degree: 'MBBS',
          year: '2009'
        },
        {
          institution: 'Lagos University Teaching Hospital',
          degree: 'Fellowship in Pediatrics',
          year: '2015'
        }
      ],
      languages: ['English', 'Hausa'],
      currentInstitution: 'Childrens Specialist Hospital',
      institutionAddress: '456 Pediatric Way',
      availability: {
        monday: ['09:00', '10:00', '11:00', '14:00', '15:00'],
        wednesday: ['09:00', '10:00', '11:00', '14:00', '15:00'],
        thursday: ['09:00', '10:00', '11:00', '14:00', '15:00']
      }
    },
    {
      id: '4',
      name: 'Dr. Elizabeth Wright',
      specialty: 'Dermatologist',
      experience: 10,
      rating: 4.8,
      consultations: 1800,
      hourlyRate: 15000,
      about: 'Board-certified dermatologist specializing in both medical and cosmetic dermatology.',
      specializations: [
        'Medical Dermatology',
        'Skin Cancer Screening',
        'Acne Treatment',
        'Cosmetic Procedures'
      ],
      education: [
        {
          institution: 'Harvard Medical School',
          degree: 'MD',
          year: '2013'
        },
        {
          institution: 'Mayo Clinic',
          degree: 'Dermatology Residency',
          year: '2017'
        }
      ],
      languages: ['English'],
      currentInstitution: 'Skin & Aesthetic Center',
      institutionAddress: '789 Dermatology Plaza',
      availability: {
        tuesday: ['09:00', '10:00', '11:00', '14:00', '15:00'],
        thursday: ['09:00', '10:00', '11:00', '14:00', '15:00'],
        friday: ['09:00', '10:00', '11:00', '14:00', '15:00']
      }
    }
  ]
}; 