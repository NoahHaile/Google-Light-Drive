import React, { useState, useEffect } from 'react';

import { StyleSheet, Text, TextInput, View, Button, TouchableOpacity, Animated, ImageBackground, Easing, Modal } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../Firebase';

export default function Signup({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const fadeAnim = new Animated.Value(0);
  const translateXAnim = new Animated.Value(-100);

  const fadeInTitle = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 4000,
      useNativeDriver: true,
    }).start();
  };

  const slideInForm = () => {
    Animated.timing(translateXAnim, {
      toValue: 0, // Slide to the original position
      duration: 2000,
      easing: Easing.bounce,
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    fadeInTitle();
    slideInForm();
  }, []);

  const handleSubmit = async () => {
    if( password !== confirmPassword ){
        return setError('Passwords do not match')
    }
    try {
      setError('');
      setLoading(true);
      await createUserWithEmailAndPassword(auth, email, password);
      
      navigation.navigate('Dashboard', {
        folderId: null,
      });
    } catch (error) {
      console.error('Signup error: ', error);
      setError(`Signup error: ${error}`)
      setVisible(true)
    }
    setLoading(false);
  }

  return (
    <ImageBackground
      source={require('../../../assets/cityScape.png')}
      style={styles.backgroundImage}
    >
      <View style={styles.container}>

      <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
    
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalText}>{error}</Text>
          <TouchableOpacity style={styles.button} onPress={()=>setVisible(false)}>
            <Text style={styles.buttonText2} >OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
        <Animated.Text style={styles.title1}>
          SIGN UP
        </Animated.Text>

        <Animated.Text style={[styles.title2, { opacity: fadeAnim }]}>
          Google <Text style={styles.darkText}>Dark</Text> Drive
        </Animated.Text>

        <Animated.View style={[styles.inputContainer, { transform: [{ translateX: translateXAnim }] }]}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            onChangeText={(newEmail) => setEmail(newEmail)}
            value={email}
          />
        </Animated.View>

        <Animated.View style={[styles.inputContainer, { transform: [{ translateX: translateXAnim }] }]}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            onChangeText={(newPassword) => setPassword(newPassword)}
            value={password}
            secureTextEntry={true}
          />
        </Animated.View>

        <Animated.View style={[styles.inputContainer, { transform: [{ translateX: translateXAnim }] }]}>
          <Text style={styles.label}>Confirm Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Confirm your password"
            onChangeText={(newPassword) => setConfirmPassword(newPassword)}
            value={confirmPassword}
            secureTextEntry={true}
          />
        </Animated.View>

        <TouchableOpacity
          style={styles.customButton}
          onPress={handleSubmit}
        >
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.customButton2} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.login}>Log in</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // Dimmed background
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
    fontSize: 16, // Adjusted font size for better readability
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    backgroundColor: "#2196F3",
  },
  buttonText2: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center"
  },
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
    transform: [{ scaleX: -1 }],
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    transform: [{ scaleX: -1 }],
  },
  title1: {
    fontFamily: 'Roboto-Bold',
    fontSize: 35,
    marginBottom: 10, // Slightly reduce the bottom margin
    color: '#E63946', // Header color (a shade of red)
    textShadowColor: 'rgba(0, 0, 0, 1)', // Text shadow color (black with 50% opacity)
    textShadowOffset: { width: 1, height: 2 }, // Text shadow offset
    textShadowRadius: 3, // Text shadow radius
  },
  title2: {
    fontFamily: 'Roboto-Italic',
    fontSize: 25,
    marginBottom: 20,
    color: '#F1FAEE', // Subheader color (a shade of light blue)
  },
  darkText: {
    fontFamily: 'Roboto-Bold',
    fontSize: 25,
    marginBottom: 20,
    color: '#000', // Hide text color
    backgroundColor: 'yellow',
    
  },
  inputContainer: {
    width: '80%',
    marginBottom: 15,
  },
  label: {
    fontFamily: 'Roboto-Italic',
    fontSize: 16,
    marginBottom: 5,
    color: 'white',
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: 'gray',
    paddingLeft: 10,
    borderRadius: 5,
    color: 'black',
    backgroundColor: 'white',
  },
  login: {
    fontFamily: 'Roboto-Bold',
    fontSize: 20,
    color: 'black',
  },
  customButton: {
    backgroundColor: '#000', // Background color
    borderRadius: 10, // Rounded corners
    padding: 10, // Padding to make it bigger
    width: '40%', // Adjust the width as needed
    alignItems: 'center', // Center the button horizontally
    borderWidth: 0.5, // Border width
    borderColor: 'white', // Border color
    borderStyle: 'solid',
  },
  customButton2: {
    backgroundColor: '#ffffff',
    marginTop: 15,
    borderRadius: 10, // Rounded corners
    padding: 5, // Padding to make it bigger
    width: '25%', // Adjust the width as needed
    alignItems: 'center', // Center the button horizontally
    borderWidth: 1.3, // Border width
    borderColor: '#00F', // Border color
    borderStyle: 'solid',
  },
  buttonText: {
    fontFamily: 'Roboto-Bold',
    color: 'white', // Font color
    fontSize: 20, // Font size
  },
});