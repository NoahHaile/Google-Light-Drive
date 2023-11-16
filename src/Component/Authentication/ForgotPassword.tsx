import React, { useRef, useState } from 'react';
import { useAuth } from '../../Contexts/AuthContext';
import { View, Text, TextInput, Button, Alert } from 'react-native';


export default function ForgotPassword({navigation}) {
  const [email, setEmail] = useState('');

  const { resetPassword, currentUser } = useAuth();
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
        setMessage('');
        setError('');
        setLoading(true);
      await resetPassword(email);
      setMessage('Check your Inbox for further instructions.')
      // Redirect to the dashboard or perform other actions after successful signup.
    } catch (error) {
      // Handle signup error, e.g., display an error message.
      console.error('Failed to Reset Password');
    }
    setLoading(false);
  };

  return (
    <View>
      <Text style={{ textAlign: 'center', fontSize: 24, margin: 20 }}>
        Password Reset
      </Text>

      

      <TextInput
        style={{ borderWidth: 1, margin: 10, padding: 10 }}
        placeholder="Email"
        value={email}
        onChangeText={(text) => setEmail(text)}
        autoCapitalize="none"
        autoCorrect={false}
      />

      <Button
        title="Reset"
        onPress={handleSubmit}
        disabled={loading}
      />

      <Text style={{ textAlign: 'center', margin: 20 }}>
        <Text>Need an account? </Text>
        <Text
          style={{ color: 'blue' }}
          onPress={() => {
            navigation.navigate('Signup')
          }}
        >
          Sign Up
        </Text>
      </Text>

      <Text style={{ textAlign: 'center', margin: 20 }}>
        <Text>Already have an account? </Text>
        <Text
          style={{ color: 'blue' }}
          onPress={() => {
            navigation.navigate('Login')
          }}
        >
          Login
        </Text>
      </Text>
    </View>
  );
}
