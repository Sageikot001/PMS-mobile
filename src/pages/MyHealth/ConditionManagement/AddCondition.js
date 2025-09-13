import { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { HealthDataService } from '../../../lib/api';

const conditions = [
  { 
    id: '1', 
    name: 'Diabetes', 
    type: 'Chronic',
    description: 'A chronic condition that affects how your body turns food into energy.',
    questions: [
      {
        text: 'What type of diabetes do you have?',
        type: 'select',
        options: ['Type 1', 'Type 2', 'Gestational', 'Other']
      },
      {
        text: 'When were you diagnosed?',
        type: 'date'
      },
      {
        text: 'Are you currently on medication?',
        type: 'boolean'
      },
      {
        text: 'What is your typical blood sugar level?',
        type: 'number',
        unit: 'mg/dL'
      },
      {
        text: 'List any complications you have experienced:',
        type: 'text'
      }
    ]
  },
  { 
    id: '2', 
    name: 'Hypertension', 
    type: 'Chronic',
    description: 'Also known as high blood pressure, a condition where the force of blood against artery walls is too high.',
    questions: [
      {
        text: 'When were you diagnosed with hypertension?',
        type: 'date'
      },
      {
        text: 'What is your typical blood pressure reading?',
        type: 'text',
        placeholder: 'e.g., 120/80'
      },
      {
        text: 'Are you on blood pressure medication?',
        type: 'boolean'
      },
      {
        text: 'How often do you monitor your blood pressure?',
        type: 'select',
        options: ['Daily', 'Weekly', 'Monthly', 'Rarely', 'Never']
      },
      {
        text: 'List any cardiac events you have experienced:',
        type: 'text'
      }
    ]
  },
  {
    id: '3',
    name: 'Asthma',
    type: 'Respiratory',
    description: 'A condition that affects your airways, causing wheezing, breathlessness, and coughing.',
    questions: [
      {
        text: 'When were you first diagnosed with asthma?',
        type: 'date'
      },
      {
        text: 'Do you use an inhaler?',
        type: 'boolean'
      },
      {
        text: 'What triggers your asthma attacks?',
        type: 'text',
        placeholder: 'List your triggers'
      },
      {
        text: 'How often do you experience symptoms?',
        type: 'select',
        options: ['Daily', 'Weekly', 'Monthly', 'Rarely']
      },
      {
        text: 'What is your peak flow meter reading?',
        type: 'number',
        unit: 'L/min'
      }
    ]
  },
  {
    id: '4',
    name: 'Arthritis',
    type: 'Musculoskeletal',
    description: 'Inflammation of joints causing pain and stiffness that can worsen with age.',
    questions: [
      {
        text: 'What type of arthritis do you have?',
        type: 'select',
        options: ['Osteoarthritis', 'Rheumatoid', 'Psoriatic', 'Gout', 'Other']
      },
      {
        text: 'When were you diagnosed?',
        type: 'date'
      },
      {
        text: 'Which joints are affected?',
        type: 'text',
        placeholder: 'List affected joints'
      },
      {
        text: 'Rate your typical pain level:',
        type: 'select',
        options: ['1 (Mild)', '2', '3', '4', '5 (Severe)']
      },
      {
        text: 'Are you taking any pain medication?',
        type: 'boolean'
      }
    ]
  },
  {
    id: '5',
    name: 'Depression',
    type: 'Mental Health',
    description: 'A mental health condition characterized by persistent feelings of sadness and loss of interest.',
    questions: [
      {
        text: 'When were you diagnosed with depression?',
        type: 'date'
      },
      {
        text: 'Are you currently on antidepressants?',
        type: 'boolean'
      },
      {
        text: 'How often do you attend therapy?',
        type: 'select',
        options: ['Weekly', 'Bi-weekly', 'Monthly', 'Occasionally', 'Not attending']
      },
      {
        text: 'Rate your typical mood (1-5):',
        type: 'number',
        min: 1,
        max: 5,
        placeholder: 'Enter 1-5'
      },
      {
        text: 'What are your main symptoms?',
        type: 'text',
        placeholder: 'Describe your symptoms'
      }
    ]
  },
  {
    id: '6',
    name: 'Anxiety',
    type: 'Mental Health',
    description: 'A mental health condition characterized by excessive worry and fear about everyday situations.',
    questions: [
      {
        text: 'When did you start experiencing anxiety?',
        type: 'date'
      },
      {
        text: 'Do you take medication for anxiety?',
        type: 'boolean'
      },
      {
        text: 'What triggers your anxiety?',
        type: 'text',
        placeholder: 'List your triggers'
      },
      {
        text: 'How often do you experience anxiety attacks?',
        type: 'select',
        options: ['Daily', 'Weekly', 'Monthly', 'Rarely', 'Never']
      },
      {
        text: 'What coping mechanisms do you use?',
        type: 'text',
        placeholder: 'List your coping strategies'
      }
    ]
  },
  {
    id: '7',
    name: 'Heart Disease',
    type: 'Cardiovascular',
    description: `Conditions that affect your heart's ability to function normally.`,
    questions: [
      {
        text: 'What type of heart condition do you have?',
        type: 'select',
        options: ['Coronary Artery Disease', 'Arrhythmia', 'Heart Failure', 'Valve Disease', 'Other']
      },
      {
        text: 'When were you diagnosed?',
        type: 'date'
      },
      {
        text: 'List any surgical procedures you have had:',
        type: 'text',
        placeholder: 'Enter procedures and dates'
      },
      {
        text: 'Are you on blood thinners?',
        type: 'boolean'
      },
      {
        text: 'What is your typical heart rate?',
        type: 'number',
        unit: 'bpm'
      }
    ]
  },
  {
    id: '8',
    name: 'Migraine',
    type: 'Neurological',
    description: 'Severe headaches often accompanied by nausea, vomiting, and extreme sensitivity to light and sound.',
    questions: [
      {
        text: 'How frequently do you get migraines?',
        type: 'select',
        options: ['Daily', '2-3 times/week', 'Weekly', 'Monthly', 'Rarely']
      },
      {
        text: 'What triggers your migraines?',
        type: 'text',
        placeholder: 'List your triggers'
      },
      {
        text: 'Do you take preventive medication?',
        type: 'boolean'
      },
      {
        text: 'Average duration of your migraines:',
        type: 'select',
        options: ['< 4 hours', '4-12 hours', '12-24 hours', '24-72 hours', '> 72 hours']
      },
      {
        text: 'Describe your aura symptoms (if any):',
        type: 'text',
        placeholder: 'Leave blank if none'
      }
    ]
  },
  {
    id: '9',
    name: 'COPD',
    type: 'Respiratory',
    description: 'Chronic Obstructive Pulmonary Disease affects airflow from the lungs.',
    questions: [
      {
        text: 'When were you diagnosed with COPD?',
        type: 'date'
      },
      {
        text: 'Do you use oxygen therapy?',
        type: 'boolean'
      },
      {
        text: 'What is your smoking history?',
        type: 'select',
        options: ['Current smoker', 'Former smoker', 'Never smoked']
      },
      {
        text: 'Latest spirometry reading (FEV1):',
        type: 'number',
        unit: '%'
      },
      {
        text: 'List your current symptoms:',
        type: 'text',
        placeholder: 'Describe your symptoms'
      }
    ]
  },
  {
    id: '10',
    name: 'Thyroid Disorder',
    type: 'Endocrine',
    description: 'Conditions affecting the thyroid gland and hormone production.',
    questions: [
      {
        text: 'What type of thyroid condition do you have?',
        type: 'select',
        options: ['Hypothyroidism', 'Hyperthyroidism', 'Goiter', 'Thyroid nodules', 'Other']
      },
      {
        text: 'When were you diagnosed?',
        type: 'date'
      },
      {
        text: 'Current TSH level:',
        type: 'number',
        unit: 'mIU/L'
      },
      {
        text: 'Are you taking thyroid medication?',
        type: 'boolean'
      },
      {
        text: 'List any symptoms you experience:',
        type: 'text',
        placeholder: 'Describe your symptoms'
      }
    ]
  }
];

const AddCondition = () => {
  const navigation = useNavigation();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedCondition, setSelectedCondition] = useState(null);
  const [answers, setAnswers] = useState({});

  const handleConditionSelect = (condition) => {
    setSelectedCondition(condition);
    setCurrentStep(1);
  };

  const handleAnswer = (question, answer) => {
    setAnswers(prev => ({
      ...prev,
      [question]: answer
    }));
  };

  const handleNext = async () => {
    console.log('Current step:', currentStep);
    console.log('Questions length:', selectedCondition?.questions.length);
    
    if (currentStep < selectedCondition?.questions.length) {
      setCurrentStep(currentStep + 1);
    } else {
      // Save condition data to health service
      try {
        const conditionData = {
          name: selectedCondition.name,
          type: selectedCondition.type,
          description: selectedCondition.description,
          diagnosedDate: new Date().toISOString(), // Can be made configurable
          severity: 'moderate', // Can be determined from answers
          symptoms: [],
          triggers: [],
          medications: [],
          doctorName: '',
          treatment: '',
          notes: `Condition added through app questionnaire on ${new Date().toLocaleDateString()}`,
          answers: answers,
        };

        // Extract relevant information from answers
        if (answers) {
          Object.entries(answers).forEach(([question, answer]) => {
            if (question.toLowerCase().includes('trigger')) {
              conditionData.triggers.push(answer);
            }
            if (question.toLowerCase().includes('symptom')) {
              conditionData.symptoms.push(answer);
            }
            if (question.toLowerCase().includes('medication') || question.toLowerCase().includes('medicine')) {
              conditionData.medications.push(answer);
            }
            if (question.toLowerCase().includes('doctor') || question.toLowerCase().includes('physician')) {
              conditionData.doctorName = answer;
            }
          });
        }

        await HealthDataService.addCondition(conditionData);
        
        Alert.alert(
          'Success',
          `${selectedCondition.name} has been added to your condition management successfully!`,
          [
            {
              text: 'Add Another Condition',
              onPress: () => {
                setSelectedCondition(null);
                setAnswers({});
                setCurrentStep(0);
              }
            },
            {
              text: 'View Conditions',
              onPress: () => {
                navigation.navigate('ConditionManagement');
              }
            },
            {
              text: 'Explore Medications',
              onPress: () => {
                navigation.navigate('ConditionDrugs', {
                  condition: selectedCondition,
                  answers: answers
                });
              }
            }
          ]
        );
        
      } catch (error) {
        console.error('Error saving condition:', error);
        Alert.alert('Error', 'Failed to save condition. Please try again.');
      }
    }
  };

  const renderConditionList = () => (
    <ScrollView style={styles.container}>
      <Text style={styles.sectionTitle}>Select your condition</Text>
      {conditions.map((condition) => (
        <TouchableOpacity 
          key={condition.id}
          style={styles.conditionCard}
          onPress={() => handleConditionSelect(condition)}
        >
          <Text style={styles.conditionName}>{condition.name}</Text>
          <Text style={styles.conditionType}>{condition.type}</Text>
          <Text style={styles.conditionDescription}>{condition.description}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderQuestion = () => {
    if (!selectedCondition) return null;
    const questionIndex = currentStep - 1;
    
    // Debug logs
    console.log('Current step:', currentStep);
    console.log('Selected condition:', selectedCondition);
    console.log('Question index:', questionIndex);
    console.log('Current question:', selectedCondition.questions[questionIndex]);

    // Check if we've gone past all questions
    if (questionIndex >= selectedCondition.questions.length) {
      return null;
    }

    const question = selectedCondition.questions[questionIndex];

    // Ensure we have a question object
    if (!question) {
      console.log('No question found for index:', questionIndex);
      return null;
    }

    switch (question.type) {
      case 'boolean':
        return (
          <View style={styles.questionContainer}>
            <Text style={styles.questionText}>{question.text}</Text>
            <View style={styles.answerContainer}>
              <TouchableOpacity 
                style={[styles.answerButton, answers[question.text] === 'Yes' && styles.selectedAnswer]}
                onPress={() => handleAnswer(question.text, 'Yes')}
              >
                <Text style={[
                  styles.answerButtonText,
                  answers[question.text] === 'Yes' && styles.selectedAnswerText
                ]}>Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.answerButton, answers[question.text] === 'No' && styles.selectedAnswer]}
                onPress={() => handleAnswer(question.text, 'No')}
              >
                <Text style={[
                  styles.answerButtonText,
                  answers[question.text] === 'No' && styles.selectedAnswerText
                ]}>No</Text>
              </TouchableOpacity>
            </View>
          </View>
        );

      case 'select':
        return (
          <View style={styles.questionContainer}>
            <Text style={styles.questionText}>{question.text}</Text>
            <View style={styles.optionsContainer}>
              {question.options.map((option) => (
                <TouchableOpacity 
                  key={option}
                  style={[
                    styles.optionButton,
                    answers[question.text] === option && styles.selectedAnswer
                  ]}
                  onPress={() => handleAnswer(question.text, option)}
                >
                  <Text style={[
                    styles.optionButtonText,
                    answers[question.text] === option && styles.selectedAnswerText
                  ]}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 'date':
        return (
          <View style={styles.questionContainer}>
            <Text style={styles.questionText}>{question.text}</Text>
            <TouchableOpacity 
              style={styles.dateInput}
              onPress={() => {
                // Add date picker logic here
              }}
            >
              <Text style={styles.dateText}>
                {answers[question.text] || 'Select date'}
              </Text>
            </TouchableOpacity>
          </View>
        );

      case 'number':
        return (
          <View style={styles.questionContainer}>
            <Text style={styles.questionText}>{question.text}</Text>
            <View style={styles.numberInputContainer}>
              <TextInput
                style={styles.numberInput}
                keyboardType="numeric"
                value={answers[question.text]}
                onChangeText={(value) => handleAnswer(question.text, value)}
                placeholder="Enter value"
              />
              {question.unit && <Text style={styles.unitText}>{question.unit}</Text>}
            </View>
          </View>
        );

      case 'text':
        return (
          <View style={styles.questionContainer}>
            <Text style={styles.questionText}>{question.text}</Text>
            <TextInput
              style={styles.textInput}
              multiline
              numberOfLines={4}
              value={answers[question.text]}
              onChangeText={(value) => handleAnswer(question.text, value)}
              placeholder="Type your answer here"
            />
          </View>
        );

      default:
        // If the question is just a string (old format)
        return (
          <View style={styles.questionContainer}>
            <Text style={styles.questionText}>{question}</Text>
            <View style={styles.answerContainer}>
              <TouchableOpacity 
                style={[styles.answerButton, answers[question] === 'Yes' && styles.selectedAnswer]}
                onPress={() => handleAnswer(question, 'Yes')}
              >
                <Text style={[
                  styles.answerButtonText,
                  answers[question] === 'Yes' && styles.selectedAnswerText
                ]}>Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.answerButton, answers[question] === 'No' && styles.selectedAnswer]}
                onPress={() => handleAnswer(question, 'No')}
              >
                <Text style={[
                  styles.answerButtonText,
                  answers[question] === 'No' && styles.selectedAnswerText
                ]}>No</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => {
            if (currentStep === 0) {
              navigation.goBack();
            } else {
              setCurrentStep(currentStep - 1);
            }
          }}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Add Condition</Text>

        {currentStep === 0 ? (
          renderConditionList()
        ) : (
          <View style={styles.setupContainer}>
            <Text style={styles.selectedConditionName}>{selectedCondition?.name}</Text>
            {renderQuestion()}
            <TouchableOpacity 
              style={styles.nextButton}
              onPress={handleNext}
            >
              <Text style={styles.nextButtonText}>
                {currentStep === selectedCondition?.questions.length ? 'Finish' : 'Next'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  backButton: {
    marginBottom: 16,
  },
  backButtonText: {
    fontSize: 24,
    color: '#333',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 16,
  },
  conditionCard: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  conditionName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  conditionType: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  conditionDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  setupContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  selectedConditionName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  questionContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  questionText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  answerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  answerButton: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  selectedAnswer: {
    backgroundColor: '#6200ee',
  },
  selectedAnswerText: {
    color: '#fff',
  },
  answerButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  nextButton: {
    backgroundColor: '#6200ee',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 16,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  optionsContainer: {
    alignItems: 'center',
    gap: 12,
  },
  optionButton: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: '80%',
  },
  optionButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  dateInput: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  dateText: {
    fontSize: 16,
    color: '#666',
  },
  numberInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  numberInput: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    width: 120,
    textAlign: 'center',
    fontSize: 16,
  },
  unitText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#666',
  },
  textInput: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    fontSize: 16,
    textAlignVertical: 'top',
  },
});

export default AddCondition; 