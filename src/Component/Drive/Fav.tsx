import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Image, Animated, Easing, ImageBackground } from 'react-native';
import { useAuth } from '../../Contexts/AuthContext';
import File from './File';
import { database } from '../../Firebase';
import { query, where, onSnapshot } from 'firebase/firestore';

export default function Fav({ navigation }) {
  const { currentUser } = useAuth();
  const [childFiles, setChildFiles] = useState([]);
  const [userDocument, setUserDocument] = useState(null);
  const [refresh, setRefresh] = useState(false);
  const translateXAnim = useRef(new Animated.Value(-100)).current; // Initial position to the left

  const slideIn = () => {
    Animated.timing(translateXAnim, {
      toValue: 0,
      duration: 1000,
      easing: Easing.bounce,
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    slideIn();

    const childFilesQuery = query(
      database.files,
      where("fav", "==", true),
      where("userId", "==", currentUser.uid),
      where("deleted", "==", false)
    );

    const unsubscribeFiles = onSnapshot(childFilesQuery, (snapshot) => {
      const filesData = [];
      snapshot.forEach(doc => {
        const file = doc.data();
        file.id = doc.id;
        filesData.push(file);
      });
      setChildFiles(filesData);
    });

    const childUserImageQuery = query(
      database.users,
      where("userId", "==", currentUser.uid),
      where("deleted", "==", false)
    );

    const unsubscribeUser = onSnapshot(childUserImageQuery, (snapshot) => {
      if (snapshot.docs.length > 0) {
        const userDoc = snapshot.docs[0].data();
        setUserDocument(userDoc);
      }
    });

    return () => {
      unsubscribeFiles();
      unsubscribeUser();
    }
  }, [currentUser.uid]);

  return (
    <ImageBackground
      source={require('../../../assets/nightSky2.jpg')}
      style={styles.backgroundImage}
    >
      <View style={styles.container}>
        <View style={styles.buttonContainer}>
          <Animated.Text style={[styles.title, { transform: [{ translateX: translateXAnim }] }]}>
            Favorites
          </Animated.Text>
        </View>
        <ScrollView style={styles.contentContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Dashboard', { folderId: null })}>
            <Text style={styles.backButtonText}>Back to Root</Text>
          </TouchableOpacity>
          {childFiles.length > 0 ? (
            <View style={styles.fileContainer}>
              {childFiles.map((childFile) => (
                <File file={childFile} key={childFile.id} onDelete={setRefresh} />
              ))}
            </View>
          ) : (
            <Text style={styles.noFilesText}>No Favorites</Text>
          )}
        </ScrollView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  contentContainer: {
    paddingHorizontal: 20,
  },
  fileContainer: {
    marginTop: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)', // Slightly lighter background for a softer look
    padding: 15,
    borderRadius: 10, // Rounded corners
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)', // Soft white border
    shadowColor: '#000', // Shadow for a subtle depth effect
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5, // Elevation for Android devices
  },
  
  userPhoto: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  title: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#000',
  },
  profileButton: {
    backgroundColor: '#fff',
    padding: 5,
    borderRadius: 20,
  },
  backButton: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
  },
  backButtonText: {
    color: '#1a1a1a',
    fontSize: 16,
    fontWeight: 'bold',
  },
  noFilesText: {
    color: '#fff',
    textAlign: 'center',
    marginTop: 20,
  },
});
