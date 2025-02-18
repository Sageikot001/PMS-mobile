// Import categories from Categories.js
import { CATEGORIES } from '../pages/Categories/Categories';
import { pharmacyData } from './pharmacyData';

// Function to extract and organize drugs from pharmacyData
const organizeDrugsByCategory = (pharmacyData) => {
  const categorizedDrugs = {};
  
  // Initialize categories
  CATEGORIES.forEach(category => {
    categorizedDrugs[category.id] = {
      id: category.id,
      title: category.title,
      icon: category.icon,
      backgroundColor: category.backgroundColor,
      drugs: []
    };
  });

  // Process each pharmacy's inventory
  pharmacyData.pharmacies.forEach(pharmacy => {
    if (pharmacy.isChain) {
      // Process chain pharmacy locations
      pharmacy.locations.forEach(location => {
        processInventory(location.inventory.categories, pharmacy, location);
      });
    } else {
      // Process local pharmacy inventory
      processInventory(pharmacy.inventory.categories, pharmacy);
    }
  });

  function processInventory(inventory, pharmacy, location = null) {
    Object.entries(inventory).forEach(([category, drugs]) => {
      drugs.forEach(drug => {
        const categoryMapping = mapDrugToCategory(category, drug);
        if (categoryMapping) {
          // Add pharmacy information to drug
          const drugWithPharmacy = {
            ...drug,
            pharmacy: {
              id: pharmacy.id,
              name: pharmacy.name,
              isChain: pharmacy.isChain,
              ...(location ? {
                location: {
                  id: location.id,
                  name: location.name,
                  address: location.address
                }
              } : {
                address: pharmacy.address
              })
            }
          };

          // Check if drug already exists in category
          const existingDrugIndex = categorizedDrugs[categoryMapping].drugs
            .findIndex(d => d.id === drug.id);

          if (existingDrugIndex === -1) {
            categorizedDrugs[categoryMapping].drugs.push(drugWithPharmacy);
          }
        }
      });
    });
  }

  return categorizedDrugs;
};

// Helper function to map pharmacy inventory categories to app categories
function mapDrugToCategory(pharmacyCategory, drug) {
  // Map based on pharmacy category and drug properties
  const categoryMappings = {
    'Diabetes': '1',
    'Blood Pressure': '2',
    'Sexual Health': '3',
    'Pregnancy': '4',
    'Pain Relief': '5',
    'Eye Care': '6',
    'Ear Care': '6',
    'Nasal Care': '6',
    'Skincare': '7',
    'First Aid': '8',
    'Weight Management': '9',
    'Vitamins': '10',
    'Supplements': '10',
    'Fitness': '11',
    'Mental Health': '12'
  };

  // Check drug name and description for keywords
  const keywords = {
    '1': ['diabetes', 'insulin', 'glucose', 'metformin'],
    '2': ['hypertension', 'blood pressure', 'heart'],
    '3': ['sexual', 'reproductive'],
    '4': ['pregnancy', 'conception', 'prenatal'],
    '5': ['pain', 'fever', 'headache', 'relief'],
    '6': ['eye', 'ear', 'nose', 'vision', 'hearing'],
    '7': ['skin', 'acne', 'derma'],
    '8': ['first aid', 'wound', 'bandage'],
    '9': ['weight', 'diet', 'slim'],
    '10': ['vitamin', 'supplement', 'mineral'],
    '11': ['fitness', 'muscle', 'exercise'],
    '12': ['mental', 'anxiety', 'depression', 'stress']
  };

  // First try to map based on pharmacy category
  if (categoryMappings[pharmacyCategory]) {
    return categoryMappings[pharmacyCategory];
  }

  // Then check drug properties for keywords
  const drugText = `${drug.name} ${drug.description}`.toLowerCase();
  for (const [categoryId, keywordList] of Object.entries(keywords)) {
    if (keywordList.some(keyword => drugText.includes(keyword))) {
      return categoryId;
    }
  }

  return null; // Return null if no mapping found
}

export const drugCategories = organizeDrugsByCategory(pharmacyData);

// Export individual category arrays for easy access
export const diabetesDrugs = drugCategories['1'].drugs;
export const hypertensionDrugs = drugCategories['2'].drugs;
export const sexualHealthDrugs = drugCategories['3'].drugs;
export const pregnancyDrugs = drugCategories['4'].drugs;
export const painReliefDrugs = drugCategories['5'].drugs;
export const eyeEarNoseDrugs = drugCategories['6'].drugs;
export const skincareDrugs = drugCategories['7'].drugs;
export const firstAidDrugs = drugCategories['8'].drugs;
export const weightManagementDrugs = drugCategories['9'].drugs;
export const supplementsDrugs = drugCategories['10'].drugs;
export const fitnessDrugs = drugCategories['11'].drugs;
export const mentalHealthDrugs = drugCategories['12'].drugs; 