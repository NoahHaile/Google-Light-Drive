import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TextInput, View, Button, TouchableOpacity, ScrollView, Image, ImageBackground } from 'react-native';
import { useAuth } from '../../Contexts/AuthContext';
import Folder from './Folder';
import File from './File';
import AddFolderButton from './AddFolderButton';
import { useFolder } from '../../Hooks/useFolder';
import AddFileButton from './AddFileButton';
import FolderBreadcrumbs from './FolderBreadcrumbs';
import { database } from '../../Firebase';
import { onSnapshot, query, where } from 'firebase/firestore';
import FolderBreadcrumbsMove from './FolderBreadcrumbsMove';
import FolderMove from './FolderMove';

export default function MoveFile({ moveFile, setDestination, setDisplay}) {
    
    const {currentUser} = useAuth();
    
    const [currentId, setCurrentId] = useState(null)
    
    const { folder, childFolders, childFiles } = useFolder(currentId);
    const [userDocument, setUserDocument] = useState(null);
    const [refresh, setRefresh] = useState(false);

    const handleMoveHere = () => {
      console.log(folder.id);
      setDestination(folder.id);
      setDisplay(false);
      moveFile();
    };
    
    return (
      <View>
        <View style={styles.mainContainer}>
            
            
            <FolderBreadcrumbsMove currentFolder={folder} setFolder={setCurrentId} />
            <ScrollView style={styles.contentContainer}>
                <View style={styles.folderFileContainer}>
                {childFolders.length > 0 && (
                    <>
                    {childFolders.map((childFolder) => (
                        <View style={styles.folderFile}>
                        <FolderMove folder={childFolder} key={childFolder.id} setFolder={setCurrentId} />
                        </View>
                    ))}
                    </>
                    
                )}

        
                </View>
            </ScrollView>
            <TouchableOpacity onPress={handleMoveHere} style={styles.moveButton}>
              <Text style={styles.buttonText}>Move Here</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={()=> setDisplay(false)} style={styles.closeButton}>
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
        </View>
        
      </View>
      
    );
  }
  
  const styles = StyleSheet.create({
    mainContainer: {
      width: '100%',
      margin: 0,
      backgroundColor: '#666',
    },
    backgroundImage: {
      flex: 1,
      resizeMode: 'cover',
      justifyContent: 'center',
    },
    container: {
      flex: 1,
      
    },
    title2: {
      fontFamily: 'Roboto-BoldItalic',
      fontSize: 25,
      color: '#fff', // Subheader color (a shade of light blue)
      textAlign: 'center'
      
    },
    darkText: {
      fontFamily: 'Roboto-Bold',
      fontSize: 25,
      marginBottom: 20,
      color: '#000', // Hide text color
      backgroundColor: 'yellow',
      
    },
    buttonContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 10,
      backgroundColor: '#666',
    },
    nav: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 0,
      margin: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
    },
    nav2: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      padding: 10,
      margin: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
    },
    contentContainer: {
      paddingHorizontal: 20,
      backgroundColor: '#333',
      height: '70%',
    },
    folderFileContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-start',
      padding: 5,
      
      flexWrap: 'wrap',
    },
    folderFile: {
      margin: 10,
    },
    userPhoto: {
      width: 40,
      height: 40,
      borderRadius: 50,
    },
    trash: {
      backgroundColor: '#000', // Background color
      padding: 8,
      width: '15%', // Adjust the width as needed
      alignItems: 'center', // Center the button horizontally
      borderRightWidth: 1, // Border width
      borderColor: 'white', // Border color
      borderStyle: 'solid',
    },
    fav: {
      backgroundColor: '#fff', // Background color
      padding: 8, // Padding to make it bigger
      width: '25%', // Adjust the width as needed
      alignItems: 'center', // Center the button horizontally
      borderLeftWidth: 1,
      borderColor: 'white', // Border color
      borderStyle: 'solid',
    },
    trashText:
    {
      fontFamily: 'Roboto-Bold',
      color: 'white',
      fontSize: 13,
    },
    favText:
    {
      fontFamily: 'Roboto-Bold',
      color: 'black',
      fontSize: 13,
    },
    moveButton: {
      backgroundColor: '#00cc00', // DodgerBlue color
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 5,
      alignItems: 'center',
      marginVertical: 10,
      marginTop: 10,
      alignSelf: 'center',
    },
    closeButton: {
      backgroundColor: '#cc0000', // DodgerBlue color
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 5,
      alignItems: 'center',
      marginVertical: 10,
      marginTop: 5,
      alignSelf: 'center',
    },
    buttonText: {
      fontFamily: 'Roboto-Bold',
      color: '#fff',
      fontSize: 18,
    },
  });