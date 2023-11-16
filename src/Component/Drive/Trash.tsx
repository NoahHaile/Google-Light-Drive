import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet, Text, TextInput, View, TouchableOpacity,
  ScrollView, Image, Animated, Easing, ImageBackground
} from 'react-native';
import { useAuth } from '../../Contexts/AuthContext';
import Folder from './Folder';
import File from './File';
import AddFolderButton from './AddFolderButton';
import { useFolder } from '../../Hooks/useFolder';
import AddFileButton from './AddFileButton';
import FolderBreadcrumbs from './FolderBreadcrumbs';
import { database } from '../../Firebase';
import { onSnapshot, query, where } from 'firebase/firestore';

export default function Trash({ navigation }) {
  const { currentUser } = useAuth();
  const { folder, childFolders, childFiles } = useFolder('trash');
  const [userDocument, setUserDocument] = useState(null);
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
            Trash
          </Animated.Text>
        </View>

        <ScrollView style={styles.contentContainer}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Dashboard', { folderId: null })}>
            <Text style={styles.backButtonText}>Back to Root</Text>
          </TouchableOpacity>

          {childFolders.length > 0 && (
            <View style={styles.folderContainer}>
              {childFolders.map((childFolder) => (
                <Folder folder={childFolder} key={childFolder.id} navigation={navigation} />
              ))}
            </View>
          )}

          {childFiles.length > 0 ? (
            <View style={styles.fileContainer}>
              {childFiles.map((childFile) => (
                <File file={childFile} key={childFile.id} onDelete={() => { }} />
              ))}
            </View>
          ) : (
            <Text style={styles.noFilesText}>No Files</Text>
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
  folderContainer: {
    marginTop: 20,
  },
  fileContainer: {
    marginTop: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
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
