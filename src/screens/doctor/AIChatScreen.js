import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const AIChatScreen = () => {
  const navigation = useNavigation();
  const [messages, setMessages] = useState([
    {
      id: '1',
      text: 'Hello! I\'m your Medical AI Assistant. I can help you with:\n\n• Medical condition information\n• Treatment options\n• Drug interactions\n• Symptom analysis\n• Clinical guidelines\n\nWhat would you like to know?',
      isAI: true,
      timestamp: new Date().toISOString(),
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const flatListRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const quickQuestions = [
    'What are the side effects of metformin?',
    'Symptoms of hypertension',
    'Drug interactions with warfarin',
    'Treatment options for diabetes',
    'Signs of heart attack',
    'Common antibiotics dosage'
  ];

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isAI: false,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [userMessage, ...prev]);
    setInputText('');
    setIsTyping(true);

    // Simulate AI response (replace with actual RAG chatbot integration)
    setTimeout(() => {
      const aiResponse = generateAIResponse(userMessage.text);
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        isAI: true,
        timestamp: new Date().toISOString(),
      };
      
      setMessages(prev => [aiMessage, ...prev]);
      setIsTyping(false);
    }, 1500 + Math.random() * 1000);
  };

  const handleQuickQuestion = (question) => {
    setInputText(question);
  };

  // Mock AI response generator (replace with actual RAG chatbot)
  const generateAIResponse = (userInput) => {
    const responses = {
      'metformin': '**Metformin Side Effects:**\n\n**Common:**\n• Gastrointestinal upset (nausea, diarrhea)\n• Metallic taste\n• Vitamin B12 deficiency (long-term use)\n\n**Rare but serious:**\n• Lactic acidosis (especially in kidney/liver disease)\n\n**Monitoring:** Regular kidney function tests recommended.\n\n*Always consult current prescribing information and consider patient-specific factors.*',
      
      'hypertension': '**Hypertension Symptoms:**\n\n**Often asymptomatic** - "silent killer"\n\n**When symptoms occur:**\n• Headaches (especially morning)\n• Dizziness\n• Blurred vision\n• Chest pain\n• Shortness of breath\n• Nosebleeds (severe cases)\n\n**Complications:**\n• Heart attack, stroke\n• Kidney damage\n• Eye problems\n\n*Regular BP monitoring essential for diagnosis.*',
      
      'warfarin': '**Warfarin Drug Interactions:**\n\n**Increases bleeding risk:**\n• NSAIDs (ibuprofen, aspirin)\n• Antibiotics (metronidazole, ciprofloxacin)\n• Antifungals (fluconazole)\n\n**Decreases effectiveness:**\n• Vitamin K-rich foods\n• St. John\'s Wort\n• Phenytoin\n\n**Requires monitoring:**\n• Regular INR checks\n• Dose adjustments\n\n*Always check current drug interaction databases.*',
      
      'diabetes': '**Diabetes Treatment Options:**\n\n**Type 1:**\n• Insulin therapy (multiple daily injections or pump)\n• Continuous glucose monitoring\n\n**Type 2:**\n• Lifestyle modifications (diet, exercise)\n• Metformin (first-line)\n• Additional agents: SGLT-2 inhibitors, GLP-1 agonists\n• Insulin (if needed)\n\n**Monitoring:**\n• HbA1c every 3-6 months\n• Blood pressure, lipids\n\n*Individualized approach based on patient factors.*',
      
      'heart attack': '**Heart Attack Warning Signs:**\n\n**Classic symptoms:**\n• Chest pain/pressure (crushing, squeezing)\n• Pain radiating to arm, neck, jaw\n• Shortness of breath\n• Nausea, vomiting\n• Sweating\n\n**Atypical (especially women, elderly, diabetics):**\n• Fatigue\n• Indigestion\n• Upper back pain\n\n**Action:** Call emergency services immediately\n**Treatment:** Time = muscle\n\n*STEMI vs NSTEMI diagnosis requires ECG and cardiac enzymes.*',
      
      'antibiotics': '**Common Antibiotic Dosing:**\n\n**Amoxicillin:**\n• Adults: 500mg TID or 875mg BID\n• Children: 20-40mg/kg/day divided\n\n**Azithromycin:**\n• Adults: 500mg day 1, then 250mg daily × 4 days\n• Z-pack regimen\n\n**Ciprofloxacin:**\n• Adults: 250-750mg BID\n• Adjust for renal function\n\n**Important:**\n• Complete full course\n• Consider resistance patterns\n• Renal/hepatic adjustments\n\n*Always verify current dosing guidelines.*'
    };

    // Find matching response
    const lowerInput = userInput.toLowerCase();
    for (const [key, response] of Object.entries(responses)) {
      if (lowerInput.includes(key)) {
        return response;
      }
    }

    // Default response
    return `I understand you're asking about "${userInput}". While I can provide general medical information, I'd recommend:\n\n• Consulting current medical literature\n• Checking clinical guidelines (NICE, AHA, etc.)\n• Verifying with drug databases (Lexicomp, UpToDate)\n• Considering patient-specific factors\n\n**Note:** This is for informational purposes only. Always use clinical judgment and current evidence-based guidelines for patient care.\n\nCould you provide more specific details about what you'd like to know?`;
  };

  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessage = ({ item: message }) => {
    const isAI = message.isAI;
    
    return (
      <View style={[
        styles.messageContainer,
        isAI ? styles.aiMessageContainer : styles.userMessageContainer
      ]}>
        <View style={[
          styles.messageBubble,
          isAI ? styles.aiMessage : styles.userMessage
        ]}>
          {isAI && (
            <View style={styles.aiHeader}>
              <Ionicons name="medical" size={16} color="#4A90E2" />
              <Text style={styles.aiLabel}>Medical AI</Text>
            </View>
          )}
          
          <Text style={[
            styles.messageText,
            isAI ? styles.aiMessageText : styles.userMessageText
          ]}>
            {message.text}
          </Text>
          
          <Text style={[
            styles.messageTime,
            isAI ? styles.aiMessageTime : styles.userMessageTime
          ]}>
            {formatMessageTime(message.timestamp)}
          </Text>
        </View>
      </View>
    );
  };

  const renderTypingIndicator = () => {
    if (!isTyping) return null;
    
    return (
      <View style={styles.typingContainer}>
        <View style={styles.typingBubble}>
          <Ionicons name="medical" size={16} color="#4A90E2" style={styles.typingIcon} />
          <View style={styles.typingDots}>
            <View style={[styles.dot, styles.dot1]} />
            <View style={[styles.dot, styles.dot2]} />
            <View style={[styles.dot, styles.dot3]} />
          </View>
        </View>
      </View>
    );
  };

  const renderQuickQuestions = () => (
    <View style={styles.quickQuestionsContainer}>
      <Text style={styles.quickQuestionsTitle}>Quick Questions:</Text>
      <View style={styles.quickQuestionsGrid}>
        {quickQuestions.map((question, index) => (
          <TouchableOpacity
            key={index}
            style={styles.quickQuestionButton}
            onPress={() => handleQuickQuestion(question)}
          >
            <Text style={styles.quickQuestionText}>{question}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#2C3E50" />
          </TouchableOpacity>
          
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>Medical AI Assistant</Text>
            <Text style={styles.headerSubtitle}>RAG-powered medical reference</Text>
          </View>
          
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.infoButton}>
              <Ionicons name="information-circle-outline" size={24} color="#4A90E2" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Messages List */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContent}
          inverted
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={isTyping ? renderTypingIndicator : null}
          ListFooterComponent={messages.length === 1 ? renderQuickQuestions : null}
        />

        {/* Input Area */}
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.inputContainer}
        >
          <View style={styles.inputRow}>
            <TextInput
              style={styles.textInput}
              placeholder="Ask about medical conditions, treatments, drug interactions..."
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={1000}
              placeholderTextColor="#7F8C8D"
            />
            
            <TouchableOpacity 
              style={[
                styles.sendButton,
                inputText.trim() ? styles.sendButtonActive : styles.sendButtonInactive
              ]}
              onPress={handleSendMessage}
              disabled={!inputText.trim()}
            >
              <Ionicons 
                name="send" 
                size={20} 
                color={inputText.trim() ? "#ffffff" : "#7F8C8D"} 
              />
            </TouchableOpacity>
          </View>
          
          <View style={styles.disclaimerContainer}>
            <Ionicons name="warning-outline" size={12} color="#fd7e14" />
            <Text style={styles.disclaimerText}>
              For informational purposes only. Always verify with current clinical guidelines.
            </Text>
          </View>
        </KeyboardAvoidingView>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoButton: {
    padding: 8,
  },
  messagesList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  messagesContent: {
    paddingVertical: 16,
  },
  messageContainer: {
    marginVertical: 4,
    maxWidth: '85%',
  },
  userMessageContainer: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  aiMessageContainer: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  messageBubble: {
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxWidth: '100%',
  },
  userMessage: {
    backgroundColor: '#4A90E2',
    borderBottomRightRadius: 4,
  },
  aiMessage: {
    backgroundColor: '#ffffff',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  aiLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4A90E2',
    marginLeft: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: '#ffffff',
  },
  aiMessageText: {
    color: '#2C3E50',
  },
  messageTime: {
    fontSize: 12,
    marginTop: 6,
  },
  userMessageTime: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  aiMessageTime: {
    color: '#7F8C8D',
  },
  typingContainer: {
    alignSelf: 'flex-start',
    marginVertical: 8,
  },
  typingBubble: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingIcon: {
    marginRight: 8,
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#7F8C8D',
    marginHorizontal: 2,
  },
  quickQuestionsContainer: {
    paddingVertical: 20,
    paddingHorizontal: 4,
  },
  quickQuestionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
    textAlign: 'center',
  },
  quickQuestionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickQuestionButton: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  quickQuestionText: {
    fontSize: 14,
    color: '#4A90E2',
    textAlign: 'center',
    fontWeight: '500',
  },
  inputContainer: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100,
    color: '#2C3E50',
    backgroundColor: '#F8F9FA',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  sendButtonActive: {
    backgroundColor: '#4A90E2',
  },
  sendButtonInactive: {
    backgroundColor: '#E9ECEF',
  },
  disclaimerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFF8E1',
  },
  disclaimerText: {
    fontSize: 11,
    color: '#fd7e14',
    marginLeft: 4,
    flex: 1,
  },
});

export default AIChatScreen; 