import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TextInput, View, Button, TouchableOpacity, Animated, ImageBackground, Easing, Modal } from 'react-native';
import { useAuth } from '../../Contexts/AuthContext';



export default function Login({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [visible, setVisible] = useState(false);
  const { login }: any = useAuth();
  const fadeAnim = new Animated.Value(0);
  const translateXAnim = new Animated.Value(-100); // Initial position to the left

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
    try {
      setError('');
      setLoading(true);
      
      await login(email, password);
      
      navigation.navigate('Dashboard', {
        folderId: null,
      });
    } catch (error) {
      console.error('Failed to sign in');
      setError(`Login error: ${error}`)
      setVisible(true)
    }
    setLoading(false);
  };

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
            <Text style={styles.buttonText2}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
        <Animated.Text style={[styles.title, { opacity: fadeAnim }]}>
          Login
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
          <TouchableOpacity onPress={() => navigation.navigate('Forgot-Password')}>
          <Text style={styles.forgotPassword}>Forgot Password?</Text>
        </TouchableOpacity>
        </Animated.View>


        <TouchableOpacity
          style={styles.customButton}
          onPress={handleSubmit}
        >
          <Text style={styles.buttonText}>Log In</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.customButton2} onPress={() => navigation.navigate('Signup')}>
          <Text style={styles.signUp}>Sign Up</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 1)', // Dimmed background
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
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(192, 192, 192, 0.9)',
    
  },
  title: {
    fontFamily: 'Roboto-Bold',
    fontSize: 40,
    marginBottom: 20,
    color: '#ffffff',
    textShadowColor: 'rgba(255, 127, 127, 1)', // Text shadow color (black with 50% opacity)
    textShadowOffset: { width: 1, height: 2 }, // Text shadow offset
    textShadowRadius: 3,
    
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
  forgotPassword: {
    fontFamily: 'Roboto-Italic',
    fontSize: 18,
    marginTop: 10,
    color: '#dd7777',
  },
  signUp: {
    fontFamily: 'Roboto-Bold',
    color: 'white', // Font color
    fontSize: 16, // Font size
  },
  customButton: {
    backgroundColor: 'black',
    borderRadius: 10, // Rounded corners
    padding: 10, // Padding to make it bigger
    width: '30%', // Adjust the width as needed
    alignItems: 'center', // Center the button horizontally
    borderWidth: 0.5, // Border width
    borderColor: 'white', // Border color
    borderStyle: 'solid',
  },
  customButton2: {
    backgroundColor: '#f58142',
    marginTop: 15,
    borderRadius: 10, // Rounded corners
    padding: 5, // Padding to make it bigger
    width: '25%', // Adjust the width as needed
    alignItems: 'center', // Center the button horizontally
    borderWidth: 0.5, // Border width
    borderColor: 'white', // Border color
    borderStyle: 'solid',
  },
  buttonText: {
    fontFamily: 'Roboto-Bold',
    color: 'white', // Font color
    fontSize: 20, // Font size
  },
});
