import React, { useRef, useState } from 'react';
import { View, Text, TextInput, Button } from 'react-native';
import { useAuth } from '../../Contexts/AuthContext';


export default function UpdateProfile({navigation}: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const { currentUser, updateUserEmail, updateUserPassword, logout } = useAuth();
  const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    async function handleLogout(){
        setError('');
        try{
            await logout();
            navigation.navigate('Login');
        } catch{
           setError('Failed to log out'); 
        }
    }
   const handleSubmit = async () => {

    if (password !== passwordConfirm) {
      // Handle password mismatch error, e.g., display an error message.
      return setError('Passwords do not match');
    }
    const promises = [];
    setError('');
    setLoading(true);

    if ( email !== currentUser.email ){
        promises.push(updateUserEmail(email))
    }
    if ( password !== currentUser.password ){
        promises.push(updateUserPassword(password))
    }

    Promise.all(promises).then(() => {
        navigation.navigate('Dashboard');
    }).catch(() => {
        setError('Failed to update account')
    }).finally(() => setLoading(false))
    
   };

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ textAlign: 'center', fontSize: 24, marginBottom: 16 }}>
        Update Profile
      </Text>

      {error && <Text style={{ color: 'red' }}>{error}</Text>}

      <TextInput
        style={{ borderWidth: 1, margin: 10, padding: 10 }}
        placeholder="Email"
        value={email}
        onChangeText={(text) => setEmail(text)}
        autoCapitalize="none"
        autoCorrect={false}
        defaultValue={currentUser.email}
      />

      <TextInput
        style={{ borderWidth: 1, margin: 10, padding: 10 }}
        value={password}
        onChangeText={(text) => setPassword(text)}
        secureTextEntry={true}
        placeholder="Leave blank to keep the same"
      />

      <TextInput
        style={{ borderWidth: 1, margin: 10, padding: 10 }}
        onChangeText={(text) => setPasswordConfirm(text)}
        value={passwordConfirm}
        secureTextEntry={true}
        placeholder="Leave blank to keep the same"
      />

      <Button
        title="Update"
        onPress={handleSubmit}
        disabled={loading}
      />

      <View style={{ alignItems: 'center', marginTop: 16 }}>
        <Button
          title="Cancel"
          onPress={() => {
            // Navigate back to the user profile screen using navigation.goBack
            navigation.goBack();
          }}
          color="blue"
          accessibilityLabel="Cancel"
        />
      </View>
      <View style={{ alignItems: 'center', marginTop: 16 }}>
        <Button
          title="Log Out"
          onPress={handleLogout}
          color="blue"
          accessibilityLabel="Log Out"
        />
      </View>
    </View>
  );
    
}
