import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  KeyboardAvoidingView, Platform, Dimensions 
} from 'react-native';
import { Mail, Lock, Zap, ArrowRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

export default function AuthScreen({ onLogin }) {
  const [isRegistering, setIsRegistering] = useState(false);

  const handlePress = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onLogin(); // Temporary toggle to enter the app
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <View style={styles.content}>
        {/* LOGO SECTION */}
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Zap color="#3b82f6" size={40} fill="#3b82f6" />
          </View>
          <Text style={styles.title}>WorkFlow</Text>
          <Text style={styles.subtitle}>
            {isRegistering ? 'Start tracking your time' : 'Welcome back, track your wins'}
          </Text>
        </View>

        {/* FORM SECTION */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Mail color="#64748b" size={20} style={styles.icon} />
            <TextInput 
              style={styles.input} 
              placeholder="Email address" 
              placeholderTextColor="#64748b"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Lock color="#64748b" size={20} style={styles.icon} />
            <TextInput 
              style={styles.input} 
              placeholder="Password" 
              placeholderTextColor="#64748b"
              secureTextEntry
            />
          </View>

          <TouchableOpacity style={styles.mainBtn} onPress={handlePress}>
            <Text style={styles.btnText}>{isRegistering ? 'Create Account' : 'Sign In'}</Text>
            <ArrowRight color="white" size={20} />
          </TouchableOpacity>
        </View>

        {/* TOGGLE SECTION */}
        <TouchableOpacity 
          style={styles.toggleBtn} 
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setIsRegistering(!isRegistering);
          }}
        >
          <Text style={styles.toggleText}>
            {isRegistering ? 'Already have an account? ' : "Don't have an account? "}
            <Text style={styles.toggleTextBold}>{isRegistering ? 'Log In' : 'Sign Up'}</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  content: { flex: 1, paddingHorizontal: 30, justifyContent: 'center' },
  logoContainer: { alignItems: 'center', marginBottom: 50 },
  logoCircle: { 
    width: 80, height: 80, borderRadius: 40, 
    backgroundColor: '#1e293b', justifyContent: 'center', 
    alignItems: 'center', marginBottom: 20,
    borderWidth: 1, borderColor: '#334155'
  },
  title: { color: 'white', fontSize: 32, fontWeight: 'bold', letterSpacing: -1 },
  subtitle: { color: '#64748b', fontSize: 16, marginTop: 8, textAlign: 'center' },
  form: { gap: 15 },
  inputGroup: { 
    flexDirection: 'row', alignItems: 'center', 
    backgroundColor: '#1e293b', borderRadius: 16, 
    paddingHorizontal: 15, borderWidth: 1, borderColor: '#334155' 
  },
  icon: { marginRight: 12 },
  input: { flex: 1, color: 'white', paddingVertical: 18, fontSize: 16 },
  mainBtn: { 
    backgroundColor: '#3b82f6', flexDirection: 'row', 
    paddingVertical: 18, borderRadius: 16, 
    alignItems: 'center', justifyContent: 'center', 
    gap: 10, marginTop: 10,
    shadowColor: '#3b82f6', shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 5
  },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  toggleBtn: { marginTop: 30, alignItems: 'center' },
  toggleText: { color: '#64748b', fontSize: 14 },
  toggleTextBold: { color: '#3b82f6', fontWeight: 'bold' }
});
