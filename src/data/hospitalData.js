// Import all hospital images
import hospital1 from '../../assets/images/hospitals/hospital1.png';
import hospital2 from '../../assets/images/hospitals/hospital2.png';
import hospital3 from '../../assets/images/hospitals/hospital3.png';
import hospital4 from '../../assets/images/hospitals/hospital4.png';
import hospital5 from '../../assets/images/hospitals/hospital5.png';

export const hospitals = [
  {
    id: '1',
    name: 'City General Hospital',
    image: hospital1,
    ambulanceCount: 8,
    eta: 12,
    phoneNumber: '+2347012345678',
    location: {
      latitude: 6.5244,
      longitude: 3.3792,
    },
  },
  {
    id: '2',
    name: 'Mercy Medical Center',
    image: hospital2,
    ambulanceCount: 5,
    eta: 15,
    phoneNumber: '+2347023456789',
    location: {
      latitude: 6.5143,
      longitude: 3.3842,
    },
  },
  {
    id: '3',
    name: 'St. Luke\'s Hospital',
    image: hospital3,
    ambulanceCount: 12,
    eta: 8,
    phoneNumber: '+2347034567890',
    location: {
      latitude: 6.5302,
      longitude: 3.3684,
    },
  },
  {
    id: '4',
    name: 'University Teaching Hospital',
    image: hospital4,
    ambulanceCount: 10,
    eta: 18,
    phoneNumber: '+2347045678901',
    location: {
      latitude: 6.5158,
      longitude: 3.3654,
    },
  },
  {
    id: '5',
    name: 'Premier Medical Center',
    image: hospital5,
    ambulanceCount: 4,
    eta: 20,
    phoneNumber: '+2347056789012',
    location: {
      latitude: 6.5367,
      longitude: 3.3514,
    },
  }
];

export const searchHospitals = (query) => {
  if (!query || query.trim() === '') {
    return hospitals;
  }
  
  const lowerCaseQuery = query.toLowerCase();
  
  return hospitals.filter(hospital => 
    hospital.name.toLowerCase().includes(lowerCaseQuery)
  );
}; 