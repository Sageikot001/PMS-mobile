const pharmacyData = {
  pharmacies: [
    {
      id: '1',
      name: 'HealthPlus Pharmacy',
      isChain: true,
    //   logo: require('../assets/pharmacy-logos/healthplus.png'), // Add your logo
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
          inventory: {
            categories: {
              'Pain Relief': [
                {
                  id: 'drug_1a',
                  name: 'Paracetamol',
                  brand: 'Tylenol',
                  price: 5.99,
                  description: 'For fever and mild to moderate pain',
                  dosage: '500mg',
                  quantity: 100,
                  inStock: true,
                  expiryDate: '2025-06-15',
                  batchNumber: 'TYL2024001',
                  manufacturer: 'Johnson & Johnson',
                  storageInstructions: 'Store below 25°C in a dry place'
                },
                {
                  id: 'drug_1b',
                  name: 'Ibuprofen',
                  brand: 'Advil',
                  price: 7.99,
                  description: 'Anti-inflammatory pain reliever',
                  dosage: '200mg',
                  quantity: 85,
                  inStock: true,
                  expiryDate: '2024-12-20',
                  batchNumber: 'ADV2024002',
                  manufacturer: 'Pfizer',
                  storageInstructions: 'Store at room temperature'
                },
                {
                  id: 'drug_1c',
                  name: 'Aspirin',
                  brand: 'Bayer',
                  price: 6.99,
                  description: 'Pain relief and blood thinner',
                  dosage: '325mg',
                  quantity: 120,
                  inStock: true,
                  expiryDate: '2024-09-30',
                  batchNumber: 'BAY2024003',
                  manufacturer: 'Bayer AG',
                  storageInstructions: 'Keep in a cool, dry place'
                }
              ],
              'Diabetes': [
                {
                  id: 'drug_2a',
                  name: 'Metformin',
                  brand: 'Glucophage',
                  price: 12.99,
                  description: 'For type 2 diabetes management',
                  dosage: '850mg',
                  quantity: 50,
                  inStock: true,
                  expiryDate: '2025-03-15',
                  batchNumber: 'GLU2024001',
                  manufacturer: 'Merck',
                  storageInstructions: 'Store below 30°C'
                },
                {
                  id: 'drug_2b',
                  name: 'Glimepiride',
                  brand: 'Amaryl',
                  price: 15.99,
                  description: 'Diabetes medication',
                  dosage: '2mg',
                  quantity: 60,
                  inStock: true,
                  expiryDate: '2024-11-25',
                  batchNumber: 'AMA2024002',
                  manufacturer: 'Sanofi',
                  storageInstructions: 'Store in original container'
                }
              ],
              'Antibiotics': [
                {
                  id: 'drug_3a',
                  name: 'Amoxicillin',
                  brand: 'Amoxil',
                  price: 9.99,
                  description: 'Broad-spectrum antibiotic',
                  dosage: '500mg',
                  quantity: 40,
                  inStock: true,
                  expiryDate: '2024-08-10',
                  batchNumber: 'AMX2024001',
                  manufacturer: 'GSK',
                  storageInstructions: 'Store below 25°C'
                }
              ]
            }
          }
        },
        {
          id: '1b',
          name: 'HealthPlus Ikeja',
          address: '45 Allen Avenue, Ikeja',
          openTime: '8:00 AM',
          closeTime: '9:00 PM',
          rating: 4.7,
          distance: '5.1 km',
          inventory: {
            categories: {
              'Pain Relief': [
                {
                  id: 'drug_1a_2',
                  name: 'Paracetamol',
                  brand: 'Tylenol',
                  price: 5.99,
                  description: 'For fever and mild to moderate pain',
                  dosage: '500mg',
                  quantity: 80,
                  inStock: true,
                  expiryDate: '2025-04-20',
                  batchNumber: 'TYL2024004',
                  manufacturer: 'Johnson & Johnson',
                  storageInstructions: 'Store below 25°C in a dry place'
                }
              ],
              'Hypertension': [
                {
                  id: 'drug_4a',
                  name: 'Lisinopril',
                  brand: 'Zestril',
                  price: 18.99,
                  description: 'ACE inhibitor for blood pressure',
                  dosage: '10mg',
                  quantity: 45,
                  inStock: true,
                  expiryDate: '2025-01-15',
                  batchNumber: 'ZES2024001',
                  manufacturer: 'AstraZeneca',
                  storageInstructions: 'Store at room temperature'
                }
              ]
            }
          }
        }
      ]
    },
    {
      id: '2',
      name: 'MedPlus Pharmacy',
      isChain: true,
    //   logo: require('../assets/pharmacy-logos/medplus.png'),
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
          inventory: {
            categories: {
              'Pain Relief': [
                {
                  id: 'drug_1a_3',
                  name: 'Paracetamol',
                  brand: 'Emzor',
                  price: 4.99,
                  description: 'For fever and mild to moderate pain',
                  dosage: '500mg',
                  quantity: 150,
                  inStock: true,
                  expiryDate: '2025-05-10',
                  batchNumber: 'EMZ2024001',
                  manufacturer: 'Emzor',
                  storageInstructions: 'Store below 25°C'
                }
              ],
              'Mental Health': [
                {
                  id: 'drug_5a',
                  name: 'Sertraline',
                  brand: 'Zoloft',
                  price: 25.99,
                  description: 'Antidepressant medication',
                  dosage: '50mg',
                  quantity: 30,
                  inStock: true,
                  expiryDate: '2024-10-05',
                  batchNumber: 'ZOL2024001',
                  manufacturer: 'Pfizer',
                  storageInstructions: 'Store at room temperature'
                }
              ]
            }
          }
        }
      ]
    },
    {
      id: '3',
      name: 'Local Pharmacy',
      isChain: false,
    //   logo: require('../assets/pharmacy-logos/local.png'),
      rating: 4.5,
      address: '12 Marina Street, Lagos Island',
      openTime: '9:00 AM',
      closeTime: '8:00 PM',
      distance: '1.2 km',
      inventory: {
        categories: {
          'Pain Relief': [
            {
              id: 'drug_1b',
              name: 'Paracetamol',
              brand: 'Emzor',
              price: 4.99,
              description: 'For fever and mild to moderate pain',
              dosage: '500mg',
              quantity: 75,
              inStock: true,
              expiryDate: '2025-04-15',
              batchNumber: 'EMZ2024002',
              manufacturer: 'Emzor',
              storageInstructions: 'Store below 25°C'
            }
          ],
          'First Aid': [
            {
              id: 'drug_6a',
              name: 'Antiseptic Solution',
              brand: 'Dettol',
              price: 3.99,
              description: 'For wound cleaning',
              quantity: 50,
              inStock: true,
              expiryDate: '2025-03-30',
              batchNumber: 'DET2024001',
              manufacturer: 'Dettol',
              storageInstructions: 'Store below 25°C'
            }
          ]
        }
      }
    }
  ]
};

// Helper function to search across all pharmacies and their drugs
const searchPharmaciesAndDrugs = (query) => {
  console.log('Searching with query:', query); // Debug log
  console.log('Available pharmacies:', pharmacyData.pharmacies.length); // Debug log

  const results = {
    pharmacies: [],
    drugs: []
  };

  const searchTerm = query.toLowerCase();

  pharmacyData.pharmacies.forEach(pharmacy => {
    // Search for matching pharmacies
    if (pharmacy.name.toLowerCase().includes(searchTerm)) {
      console.log('Found matching pharmacy:', pharmacy.name); // Debug log
      results.pharmacies.push(pharmacy);
    }

    // Function to search inventory
    const searchInventory = (inventory, pharmacyInfo) => {
      Object.entries(inventory.categories).forEach(([category, drugs]) => {
        drugs.forEach(drug => {
          if (
            drug.name.toLowerCase().includes(searchTerm) ||
            drug.brand.toLowerCase().includes(searchTerm) ||
            category.toLowerCase().includes(searchTerm)
          ) {
            console.log('Found matching drug:', drug.name, 'in', pharmacyInfo.name); // Debug log
            results.drugs.push({
              ...drug,
              category,
              expiryDate: drug.expiryDate,
              batchNumber: drug.batchNumber,
              manufacturer: drug.manufacturer,
              storageInstructions: drug.storageInstructions,
              pharmacy: {
                id: pharmacyInfo.id,
                name: pharmacyInfo.name,
                isChain: pharmacyInfo.isChain,
                location: pharmacyInfo.address || pharmacyInfo.name
              }
            });
          }
        });
      });
    };

    // Search in chain store locations
    if (pharmacy.isChain) {
      pharmacy.locations.forEach(location => {
        if (location.name.toLowerCase().includes(searchTerm)) {
          results.pharmacies.push({ ...pharmacy, selectedLocation: location });
        }
        searchInventory(location.inventory, {
          id: pharmacy.id,
          name: pharmacy.name,
          isChain: true,
          location: location.name
        });
      });
    } else {
      // Search in single store inventory
      searchInventory(pharmacy.inventory, {
        id: pharmacy.id,
        name: pharmacy.name,
        isChain: false
      });
    }
  });

  console.log('Search results:', results); // Debug log
  return results;
};

// Make sure we're exporting both the data and the search function
export { pharmacyData, searchPharmaciesAndDrugs }; 