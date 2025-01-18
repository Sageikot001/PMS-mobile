export const pharmacies = [
  {
    id: '1',
    name: 'HealthPlus Pharmacy',
    isChain: true,
    // logo: require('../assets/pharmacy-logos/healthplus.png'), // Add your logo
    rating: 4.8,
    locations: [
      {
        id: '1a',
        name: 'HealthPlus Lekki',
        address: '2A Admiralty Way, Lekki Phase 1',
        openTime: '8:00 AM',
        closeTime: '9:00 PM',
        rating: 4.8,
        distance: '2.3 km',
      },
      {
        id: '1b',
        name: 'HealthPlus Ikeja',
        address: '45 Allen Avenue, Ikeja',
        openTime: '8:00 AM',
        closeTime: '9:00 PM',
        rating: 4.7,
        distance: '5.1 km',
      },
    ],
  },
  {
    id: '2',
    name: 'MedPlus Pharmacy',
    isChain: true,
    // logo: require('../assets/pharmacy-logos/medplus.png'), // Add your logo
    rating: 4.6,
    locations: [
      {
        id: '2a',
        name: 'MedPlus Victoria Island',
        address: 'Plot 1234, Adetokunbo Ademola',
        openTime: '8:00 AM',
        closeTime: '10:00 PM',
        rating: 4.6,
        distance: '3.5 km',
      },
    ],
  },
  {
    id: '3',
    name: 'Local Pharmacy',
    isChain: false,
    // logo: require('../assets/pharmacy-logos/local.png'), // Add your logo
    rating: 4.5,
    address: '12 Marina Street, Lagos Island',
    openTime: '9:00 AM',
    closeTime: '8:00 PM',
    distance: '1.2 km',
  },
]; 