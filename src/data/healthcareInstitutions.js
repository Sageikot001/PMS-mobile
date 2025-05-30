// Import all institution logos
import medplusLogo from '../../assets/images/institutions/medplus.png';
import stnicholasLogo from '../../assets/images/institutions/stnicholas.png';
import healthplusLogo from '../../assets/images/institutions/healthplus.png';
import luthLogo from '../../assets/images/institutions/luth.png';
import reddingtonLogo from '../../assets/images/institutions/reddington.png';

export const healthcareInstitutions = [
  {
    id: '1',
    name: 'Medplus Pharmacy',
    logo: medplusLogo || null,
    location: 'Victoria Island, Lagos',
    packageCount: 5,
    packages: [
      {
        id: '1',
        name: 'Basic Health Package',
        description: 'Essential health check and basic medications for common conditions',
        price: 15000,
        icon: 'fitness',
        itemCount: 6,
        items: [
          { id: '1', name: 'Blood Pressure Check', type: 'service' },
          { id: '2', name: 'Blood Sugar Test', type: 'service' },
          { id: '3', name: 'Paracetamol 500mg', type: 'drug', quantity: 20 },
          { id: '4', name: 'Vitamin C', type: 'drug', quantity: 30 },
          { id: '5', name: 'First Aid Kit', type: 'product' },
          { id: '6', name: 'Digital Thermometer', type: 'product' }
        ]
      },
      {
        id: '2',
        name: 'Diabetes Care Package',
        description: 'Comprehensive care pack for diabetes management and monitoring',
        price: 25000,
        icon: 'medical',
        itemCount: 8,
        items: [
          { id: '1', name: 'Blood Sugar Monitor', type: 'product' },
          { id: '2', name: 'Test Strips (50)', type: 'product' },
          { id: '3', name: 'Lancets (100)', type: 'product' },
          { id: '4', name: 'Metformin 500mg', type: 'drug', quantity: 60 },
          { id: '5', name: 'Glucose Tablets', type: 'drug', quantity: 30 },
          { id: '6', name: 'Diabetes Log Book', type: 'product' },
          { id: '7', name: 'Dietary Consultation', type: 'service' },
          { id: '8', name: 'Foot Care Cream', type: 'product' }
        ]
      },
      {
        id: '3',
        name: 'Hypertension Management',
        description: 'Complete package for hypertension control and monitoring',
        price: 20000,
        icon: 'heart',
        itemCount: 5,
        items: [
          { id: '1', name: 'Digital Blood Pressure Monitor', type: 'product' },
          { id: '2', name: 'Amlodipine 5mg', type: 'drug', quantity: 30 },
          { id: '3', name: 'Lisinopril 10mg', type: 'drug', quantity: 30 },
          { id: '4', name: 'BP Tracking Journal', type: 'product' },
          { id: '5', name: 'Pharmacist Consultation', type: 'service' }
        ]
      },
      {
        id: '4',
        name: 'Women\'s Health Bundle',
        description: 'Essential health products and services for women',
        price: 30000,
        icon: 'woman',
        itemCount: 7,
        items: [
          { id: '1', name: 'Multivitamin for Women', type: 'drug', quantity: 60 },
          { id: '2', name: 'Calcium Supplements', type: 'drug', quantity: 60 },
          { id: '3', name: 'Iron Supplements', type: 'drug', quantity: 30 },
          { id: '4', name: 'Folic Acid', type: 'drug', quantity: 30 },
          { id: '5', name: 'Pregnancy Test Kit', type: 'product' },
          { id: '6', name: 'Women\'s Health Guide', type: 'product' },
          { id: '7', name: 'Wellness Consultation', type: 'service' }
        ]
      },
      {
        id: '5',
        name: 'Immunity Booster Pack',
        description: 'Products to strengthen your immune system',
        price: 18000,
        icon: 'shield',
        itemCount: 6,
        items: [
          { id: '1', name: 'Vitamin C 1000mg', type: 'drug', quantity: 30 },
          { id: '2', name: 'Zinc Supplements', type: 'drug', quantity: 30 },
          { id: '3', name: 'Vitamin D3', type: 'drug', quantity: 30 },
          { id: '4', name: 'Multivitamin', type: 'drug', quantity: 30 },
          { id: '5', name: 'Immune Support Tea', type: 'product' },
          { id: '6', name: 'Nutritional Consultation', type: 'service' }
        ]
      }
    ]
  },
  {
    id: '2',
    name: 'St. Nicholas Hospital',
    logo: stnicholasLogo || null,
    location: 'Lagos Island, Lagos',
    packageCount: 4,
    packages: [
      {
        id: '1',
        name: 'Comprehensive Health Check',
        description: 'Full body check-up with doctor consultation and lab tests',
        price: 50000,
        icon: 'fitness',
        itemCount: 10,
        items: [
          { id: '1', name: 'Doctor Consultation', type: 'service' },
          { id: '2', name: 'Complete Blood Count', type: 'service' },
          { id: '3', name: 'Lipid Profile', type: 'service' },
          { id: '4', name: 'Liver Function Test', type: 'service' },
          { id: '5', name: 'Kidney Function Test', type: 'service' },
          { id: '6', name: 'Blood Glucose Test', type: 'service' },
          { id: '7', name: 'Chest X-Ray', type: 'service' },
          { id: '8', name: 'ECG', type: 'service' },
          { id: '9', name: 'Urinalysis', type: 'service' },
          { id: '10', name: 'Health Report & Recommendations', type: 'service' }
        ]
      },
      {
        id: '2',
        name: 'Cardiac Health Package',
        description: 'Specialized tests and consultation for heart health',
        price: 75000,
        icon: 'heart',
        itemCount: 7,
        items: [
          { id: '1', name: 'Cardiologist Consultation', type: 'service' },
          { id: '2', name: 'ECG', type: 'service' },
          { id: '3', name: 'Echocardiogram', type: 'service' },
          { id: '4', name: 'Lipid Profile', type: 'service' },
          { id: '5', name: 'Blood Pressure Monitoring', type: 'service' },
          { id: '6', name: 'Cardiac Risk Assessment', type: 'service' },
          { id: '7', name: 'Follow-up Consultation', type: 'service' }
        ]
      },
      {
        id: '3',
        name: 'Prenatal Care Package',
        description: 'Complete care for expectant mothers',
        price: 120000,
        icon: 'woman',
        itemCount: 8,
        items: [
          { id: '1', name: 'OB-GYN Consultations (4 visits)', type: 'service' },
          { id: '2', name: 'Ultrasound Scans (3)', type: 'service' },
          { id: '3', name: 'Blood Tests', type: 'service' },
          { id: '4', name: 'Prenatal Vitamins', type: 'drug', quantity: 90 },
          { id: '5', name: 'Iron Supplements', type: 'drug', quantity: 90 },
          { id: '6', name: 'Childbirth Education Class', type: 'service' },
          { id: '7', name: 'Pregnancy Nutrition Guide', type: 'product' },
          { id: '8', name: 'Pregnancy Journal', type: 'product' }
        ]
      },
      {
        id: '4',
        name: 'Executive Health Screening',
        description: 'Premium health assessment for busy professionals',
        price: 200000,
        icon: 'briefcase',
        itemCount: 12,
        items: [
          { id: '1', name: 'Comprehensive Physical Examination', type: 'service' },
          { id: '2', name: 'Full Blood Work', type: 'service' },
          { id: '3', name: 'Cardiac Stress Test', type: 'service' },
          { id: '4', name: 'Abdominal Ultrasound', type: 'service' },
          { id: '5', name: 'Chest X-Ray', type: 'service' },
          { id: '6', name: 'Prostate/Pelvic Examination', type: 'service' },
          { id: '7', name: 'Vision & Hearing Tests', type: 'service' },
          { id: '8', name: 'Cancer Screening', type: 'service' },
          { id: '9', name: 'Nutritional Assessment', type: 'service' },
          { id: '10', name: 'Stress Assessment', type: 'service' },
          { id: '11', name: 'Executive Health Report', type: 'service' },
          { id: '12', name: 'Follow-up Consultation', type: 'service' }
        ]
      }
    ]
  },
  {
    id: '3',
    name: 'HealthPlus Pharmacy',
    logo: healthplusLogo || null,
    location: 'Lekki, Lagos',
    packageCount: 3,
    packages: [
      {
        id: '1',
        name: 'Family Health Essentials',
        description: 'Basic health products for the whole family',
        price: 25000,
        icon: 'people',
        itemCount: 8,
        items: [
          { id: '1', name: 'Family First Aid Kit', type: 'product' },
          { id: '2', name: 'Digital Thermometer', type: 'product' },
          { id: '3', name: 'Blood Pressure Monitor', type: 'product' },
          { id: '4', name: 'Paracetamol 500mg', type: 'drug', quantity: 40 },
          { id: '5', name: 'Family Multivitamins', type: 'drug', quantity: 60 },
          { id: '6', name: 'Hand Sanitizer (500ml)', type: 'product' },
          { id: '7', name: 'Antiseptic Solution', type: 'product' },
          { id: '8', name: 'Family Health Guide', type: 'product' }
        ]
      },
      {
        id: '2',
        name: 'Weight Management Package',
        description: 'Products and services to support healthy weight goals',
        price: 35000,
        icon: 'fitness',
        itemCount: 6,
        items: [
          { id: '1', name: 'Digital Weight Scale', type: 'product' },
          { id: '2', name: 'Body Measurement Tape', type: 'product' },
          { id: '3', name: 'Meal Replacement Shakes', type: 'product' },
          { id: '4', name: 'Appetite Control Supplements', type: 'drug', quantity: 30 },
          { id: '5', name: 'Nutrition Consultation', type: 'service' },
          { id: '6', name: 'Weight Management Guide', type: 'product' }
        ]
      },
      {
        id: '3',
        name: 'Men\'s Health Package',
        description: 'Essential health products for men',
        price: 28000,
        icon: 'man',
        itemCount: 5,
        items: [
          { id: '1', name: 'Men\'s Multivitamin', type: 'drug', quantity: 60 },
          { id: '2', name: 'Prostate Health Supplement', type: 'drug', quantity: 30 },
          { id: '3', name: 'Testosterone Support', type: 'drug', quantity: 30 },
          { id: '4', name: 'Men\'s Health Guide', type: 'product' },
          { id: '5', name: 'Health Consultation', type: 'service' }
        ]
      }
    ]
  },
  {
    id: '4',
    name: 'Lagos University Teaching Hospital',
    logo: luthLogo || null,
    location: 'Idi-Araba, Lagos',
    packageCount: 4,
    packages: [
      {
        id: '1',
        name: 'Basic Health Screening',
        description: 'Essential health screening with consultation',
        price: 15000,
        icon: 'fitness',
        itemCount: 5,
        items: [
          { id: '1', name: 'Doctor Consultation', type: 'service' },
          { id: '2', name: 'Blood Pressure Check', type: 'service' },
          { id: '3', name: 'Blood Sugar Test', type: 'service' },
          { id: '4', name: 'Body Mass Index', type: 'service' },
          { id: '5', name: 'Basic Health Report', type: 'service' }
        ]
      },
      {
        id: '2',
        name: 'Maternal Care Package',
        description: 'Affordable prenatal care for expectant mothers',
        price: 60000,
        icon: 'woman',
        itemCount: 7,
        items: [
          { id: '1', name: 'Prenatal Consultations (3)', type: 'service' },
          { id: '2', name: 'Ultrasound Scan (2)', type: 'service' },
          { id: '3', name: 'Blood Tests', type: 'service' },
          { id: '4', name: 'Urine Tests', type: 'service' },
          { id: '5', name: 'Prenatal Vitamins', type: 'drug', quantity: 90 },
          { id: '6', name: 'Iron Supplements', type: 'drug', quantity: 90 },
          { id: '7', name: 'Prenatal Education', type: 'service' }
        ]
      },
      {
        id: '3',
        name: 'Child Wellness Package',
        description: 'Complete health check for children under 12',
        price: 25000,
        icon: 'child',
        itemCount: 6,
        items: [
          { id: '1', name: 'Pediatrician Consultation', type: 'service' },
          { id: '2', name: 'Growth Assessment', type: 'service' },
          { id: '3', name: 'Vision Screening', type: 'service' },
          { id: '4', name: 'Hearing Screening', type: 'service' },
          { id: '5', name: 'Basic Blood Work', type: 'service' },
          { id: '6', name: 'Nutritional Assessment', type: 'service' }
        ]
      },
      {
        id: '4',
        name: 'Senior Care Package',
        description: 'Specialized care for elderly patients',
        price: 45000,
        icon: 'people',
        itemCount: 8,
        items: [
          { id: '1', name: 'Geriatric Consultation', type: 'service' },
          { id: '2', name: 'Comprehensive Blood Work', type: 'service' },
          { id: '3', name: 'Cardiac Assessment', type: 'service' },
          { id: '4', name: 'Bone Density Screening', type: 'service' },
          { id: '5', name: 'Memory Assessment', type: 'service' },
          { id: '6', name: 'Fall Risk Assessment', type: 'service' },
          { id: '7', name: 'Medication Review', type: 'service' },
          { id: '8', name: 'Nutrition Counseling', type: 'service' }
        ]
      }
    ]
  },
  {
    id: '5',
    name: 'Reddington Hospital',
    logo: reddingtonLogo || null,
    location: 'Victoria Island, Lagos',
    packageCount: 3,
    packages: [
      {
        id: '1',
        name: 'Premium Health Assessment',
        description: 'Comprehensive health evaluation with specialist consultations',
        price: 150000,
        icon: 'fitness',
        itemCount: 10,
        items: [
          { id: '1', name: 'Executive Medical Exam', type: 'service' },
          { id: '2', name: 'Advanced Blood Chemistry', type: 'service' },
          { id: '3', name: 'Cardiac Evaluation', type: 'service' },
          { id: '4', name: 'Full Body Imaging', type: 'service' },
          { id: '5', name: 'Respiratory Function Test', type: 'service' },
          { id: '6', name: 'Vision & Hearing Tests', type: 'service' },
          { id: '7', name: 'Nutritional Analysis', type: 'service' },
          { id: '8', name: 'Stress & Mental Health Screening', type: 'service' },
          { id: '9', name: 'Personalized Health Report', type: 'service' },
          { id: '10', name: 'Follow-up Consultations (2)', type: 'service' }
        ]
      },
      {
        id: '2',
        name: 'Diabetes Management Program',
        description: 'Comprehensive care for diabetic patients',
        price: 85000,
        icon: 'medical',
        itemCount: 7,
        items: [
          { id: '1', name: 'Endocrinologist Consultations (3)', type: 'service' },
          { id: '2', name: 'HbA1c Tests (2)', type: 'service' },
          { id: '3', name: 'Kidney Function Tests', type: 'service' },
          { id: '4', name: 'Eye Examination', type: 'service' },
          { id: '5', name: 'Foot Care Assessment', type: 'service' },
          { id: '6', name: 'Diabetes Education Program', type: 'service' },
          { id: '7', name: 'Glucose Monitoring Kit', type: 'product' }
        ]
      },
      {
        id: '3',
        name: 'Sports Injury Rehabilitation',
        description: 'Complete recovery program for sports-related injuries',
        price: 120000,
        icon: 'fitness',
        itemCount: 8,
        items: [
          { id: '1', name: 'Sports Medicine Consultation', type: 'service' },
          { id: '2', name: 'Diagnostic Imaging', type: 'service' },
          { id: '3', name: 'Physical Therapy Sessions (10)', type: 'service' },
          { id: '4', name: 'Therapeutic Massage (5)', type: 'service' },
          { id: '5', name: 'Exercise Rehabilitation Plan', type: 'service' },
          { id: '6', name: 'Support Braces/Equipment', type: 'product' },
          { id: '7', name: 'Pain Management', type: 'service' },
          { id: '8', name: 'Return-to-Activity Assessment', type: 'service' }
        ]
      }
    ]
  }
];

export const searchHealthcareInstitutions = (query) => {
  if (!query || query.trim() === '') {
    return healthcareInstitutions;
  }
  
  const lowerCaseQuery = query.toLowerCase();
  
  return healthcareInstitutions.filter(institution => 
    institution.name.toLowerCase().includes(lowerCaseQuery) ||
    institution.location.toLowerCase().includes(lowerCaseQuery)
  );
}; 