import React, { useRef, useState, useEffect } from 'react';
import { StyleSheet, View, Text, Button, TouchableOpacity, ToastAndroid, ProgressBarAndroid, Image, TextInput } from 'react-native';
import { useAuth } from '../../Contexts/AuthContext';
import { signInWithEmailAndPassword } from 'firebase/auth';

import DocumentPicker from 'react-native-document-picker';
import { ref, uploadBytes, getDownloadURL, uploadBytesResumable } from "firebase/storage"
import { getDocs, query, where, addDoc, updateDoc, collection } from "firebase/firestore";

import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { Platform } from 'react-native';

import "react-native-get-random-values";
import { v4 as uuidV4 } from "uuid"
import { serverTimestamp } from "firebase/firestore";
import { storage, database } from "../../Firebase"

import { onSnapshot, orderBy, limit } from 'firebase/firestore';


export default function UpdateProfile({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const { currentUser, updateUserEmail, updateUserPassword, logout, login } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState([]);
  const [userDocument, setUserDocument] = useState(null);

  const uploadMenu = async () => {
    
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
        copyTo: "cachesDirectory"
      });
      if (result) {
        setUploadingFiles([result]);
        console.log(result)
        handleUpload(result);
        setUploadingFiles([]);
      }
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        // User cancelled the picker
      } else {
        throw err;
      }
    }
};

async function requestStoragePermission() {
  try {
    let result;
    if (Platform.OS === 'android' && Platform.Version < 33)
      result = await request(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);
    else{
      result = await request(PERMISSIONS.ANDROID.READ_MEDIA_IMAGES);
      result = await request(PERMISSIONS.ANDROID.READ_MEDIA_VIDEO);
    }
    if (result === RESULTS.GRANTED) {
      console.log('The permission is granted');
    } else {
      console.log('The permission is denied');
    }
  } catch (err) {
    console.warn(err);
  }
}

const handleUpload = async (file) => {
  const id = uuidV4();
  

  // Update the state with the new file
  setUploadingFiles(prevUploadingFiles => [
    ...prevUploadingFiles,
    { id: id, name: file[0].name, progress: 0, error: false },
  ]);

  const filePath = `images/${file[0].name}`;

  // Create a reference to the storage location
  const storageRef = ref(storage, `/images/${currentUser.uid}/${filePath}`);

  const hasPermission = await check(PERMISSIONS.ANDROID.READ_MEDIA_IMAGES);
    
    if (hasPermission === RESULTS.GRANTED ) {
      console.log('We already have permission.');
    }
    else{
      const hasPermission = await check(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);
      if (hasPermission === RESULTS.GRANTED ) {
        console.log('We already have permission.');
      }
      else{
        await requestStoragePermission();
      }
    }
    console.log("klsjadfhaksjldfhajkdfhkajhfakjsdhfjk")
  // Fetch the file from the local file system
  const response = await fetch(file[0].fileCopyUri);
  const blob = await response.blob();
  
  // Start the file upload
  const uploadTask = uploadBytesResumable(storageRef, blob);

  // Listen for state changes, errors, and completion of the upload.
  uploadTask.on(
    "state_changed",
    (snapshot) => {
      // Observe state change events such as progress, pause, and resume
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      // Update the progress
      setUploadingFiles((prevUploadingFiles) => {
        return prevUploadingFiles.map((uploadFile) => {
          if (uploadFile.id === id) {
            return { ...uploadFile, progress: progress };
          }
          return uploadFile;
        });
      });
    },
    (error) => {
      // Handle unsuccessful uploads
      setUploadingFiles((prevUploadingFiles) => {
        return prevUploadingFiles.map((uploadFile) => {
          if (uploadFile.id === id) {
            return { ...uploadFile, error: true };
          }
          return uploadFile;
        });
      });
    },
    () => {
      // Handle successful uploads on complete
      // Remove the file from the uploading files state
      setUploadingFiles((prevUploadingFiles) => {
        return prevUploadingFiles.filter((uploadFile) => uploadFile.id !== id);
      });

      // Get the download URL for the uploaded file
      let urlGlobal;
      getDownloadURL(uploadTask.snapshot.ref)
        .then((url) => {
          urlGlobal = url;
          // Check if a file with the same name, userId, and folderId exists
          return getDocs(
            query(
              database.users,
              where("name", "==", file[0].name),
              where("userId", "==", currentUser.uid)
            )
          );
        })
        .then((existingFiles) => {
          if (!existingFiles.empty) {
            const existingFile = existingFiles.docs[0];
            updateDoc(existingFile.ref, { url: urlGlobal });
          } else {
            return addDoc(database.users, {
              url: urlGlobal,
              name: file[0].name,
              createdAt: serverTimestamp(),
              userId: currentUser.uid,
            });
          }
        })
        .catch((error) => {
          console.error("Error during Firestore operation:", error);
        });
    }
  );
};

  async function handleLogout() {
    setError('');
    try {
        navigation.navigate('Login');
      await logout();
      
    } catch {
      setError('Failed to log out');
    }
  }

  const handleSubmit = async () => {
    if (password !== passwordConfirm) {
      return setError('Passwords do not match');
    }

    
    setError('');
    setLoading(true);

    try {
        navigation.navigate('Login');
        
        if (password !== currentUser.password){
            await updateUserPassword(password);
        }
            
    } catch {
      setError('Failed to Change Password');
    }
  };
  useEffect(() => {
    
    const childUserImageQuery = query(
      database.users,
      where("userId", "==", currentUser.uid),
      orderBy("createdAt", 'desc'), // Sort by createdAt in descending order to get the latest image
      limit(1)
    );
  
  const unsubscribe = onSnapshot(childUserImageQuery, (snapshot) => {
    // Assuming you want to retrieve the first document that matches the query
    if (snapshot.docs.length > 0) {
      const userDocument = snapshot.docs[0].data();
      setUserDocument(userDocument);
      
      // Now, you have the user document that matches the query
      // You can update your state or perform any other operations here
      console.log("User document:", userDocument);
    }
  });

  // Return a cleanup function to unsubscribe from the snapshot
  return () => unsubscribe();
}, [currentUser.uid]);
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Update Profile</Text>

      {error && <Text style={styles.errorText}>{error}</Text>}


      <TextInput
        style={styles.input}
        value={password}
        onChangeText={(text) => setPassword(text)}
        secureTextEntry={true}
        placeholder="Type New Password"
      />

      <TextInput
        style={styles.input}
        onChangeText={(text) => setPasswordConfirm(text)}
        value={passwordConfirm}
        secureTextEntry={true}
        placeholder="Confirm Password"
      />
        <TouchableOpacity onPress={uploadMenu} style={{alignItems: 'center'}}>
        {userDocument ? (
                <Image
                  source={{ uri: userDocument.url }}
                  style={{width: 50, height: 50}}
                />
              ) : (
                <Image
                source={require('../../../assets/AnonPhoto.png')}
                style={{width: 50, height: 50}}
                />
              )}
            <Text style={{fontSize: 16,
                fontFamily: 'Roboto-Bold',
                color: 'white',}}>
                Add/Change Profile Picture 
            </Text>
        </TouchableOpacity>
      <TouchableOpacity
        style={styles.customButton}
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text style={styles.customButtonText}>Update</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.customButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.customButtonText}>Cancel</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.customButton, {backgroundColor: '#8f0704'}]} onPress={handleLogout}>
        <Text style={styles.customButtonText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: 'black',
  },
  title: {
    textAlign: 'center',
    fontSize: 24,
    marginBottom: 16,
    color: 'white',
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    margin: 10,
    padding: 10,
    backgroundColor: 'white',
  },
  customButton: {
    backgroundColor: '#333',
    borderRadius: 10,
    padding: 10,
    margin: 10,
    alignItems: 'center',
  },
  customButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
});
