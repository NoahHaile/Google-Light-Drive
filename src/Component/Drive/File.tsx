import React, {useState} from "react";
import { View, Text, TouchableOpacity, Image, Modal, StyleSheet, Dimensions, TouchableHighlight } from 'react-native';
import { storage, database } from "../../Firebase";
import Ionicons from 'react-native-vector-icons/Ionicons';

//import Animated, { Easing } from 'react-native-reanimated';
import { ref, deleteObject, getDownloadURL } from "firebase/storage";
import { deleteDoc, doc, getDoc, query, updateDoc, where } from "firebase/firestore";
//import * as FileSystem from 'expo-file-system';
//import firebase from 'firebase/app';
import 'firebase/storage';
//import * as Permissions from 'expo-permissions';
//import * as MediaLibrary from 'expo-media-library';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { Platform } from 'react-native';
import MoveFile from "./MoveFile";
import RNFS from 'react-native-fs';


export default function File({ file, onDelete }) {

  const [open, setOpen] = useState(false)
  const [openAlert, setOpenAlert] = useState(false)
  const [move, setMove] = useState(false)
  let newFolder: string = null;


  function setNewFolder(newId){
    newFolder = newId;
  }
  function openModal() {
    setOpen(true)
  }

  function closeModal() {
    setOpen(false)
  }

  async function requestStoragePermission() {
    try {
      
      const result = await request(PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE);
      console.log(result)
      if (result === RESULTS.GRANTED) {
        console.log('The permission is granted');
      } else {
        console.log('The permission is denied');
      }
    } catch (err) {
      console.warn(err);
    }
  }

  const handleDownload = async () => {

    try {
      const fileRef = doc(database.files, file.id);
      getDoc(fileRef)
        .then(async (docSnapshot) => {
          if (docSnapshot.exists()) {
            const fileData = docSnapshot.data();
            
              try {
                let hasPermission = await check(PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE);
                if (hasPermission === RESULTS.GRANTED ) {
                  console.log('We already have permission.');
                }
                else{
                  console.log(hasPermission)
                  await requestStoragePermission();
                }
                hasPermission = await check(PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE);
                const downloadFile = async (url, localFilePath) => {
                  if (hasPermission === RESULTS.GRANTED )
                    RNFS.downloadFile({
                      fromUrl: url,          // URL to download file from
                      toFile: `${RNFS.DocumentDirectoryPath}/${fileData.name}`,          // Local filesystem path to save the file to
      
                    });
                  else{
                    console.log(`${localFilePath}jkd`)
                    setOpenAlert(true)
                    RNFS.downloadFile({
                      fromUrl: url,          // URL to download file from
                      toFile: `${localFilePath}/${fileData.name}`,          // Local filesystem path to save the file to
      
                    })
                  }
                  
              }
              downloadFile(fileData.url, RNFS.ExternalDirectoryPath)
            } catch (error) {
                console.error('Error downloading the file:', error);
              }
            };

        })
        .catch((error) => {
          console.error('Error querying Firestore:', error);
        });
    } catch (error) {
      console.error("Error getting download URL:", error);
    }

  };

  const handleDelete = async () => {
    try {
      const fileRef = doc(database.files, file.id);
      getDoc(fileRef)
        .then(async (docSnapshot) => {
          if (docSnapshot.exists()) {
            const fileData = docSnapshot.data();
  
            // Delete the file from Firebase Storage
            const fileStorageRef = ref(storage, fileData.url);
            //await deleteDoc(fileRef);
            await updateDoc(fileRef, {
              deleted: true,
            });
            await deleteObject(fileStorageRef);
            
            console.log('File deleted from Firebase Storage.');
            onDelete(true);
          } else {
            console.log('File not found in Firestore.');
          }
        })
        .catch((error) => {
          console.error('Error querying Firestore:', error);
        });
    } catch (error) {
      console.error('Error deleting the file:', error);
    }
  };

  const handleTrash = async () => {
    try {
      const fileRef = doc(database.files, file.id);
      getDoc(fileRef)
        .then(async (docSnapshot) => {
          if (docSnapshot.exists()) {
            const fileData = docSnapshot.data();
  
            await updateDoc(fileRef, {
              folderId: 'trash'
            });
            onDelete(true);
          } else {
            console.log('File not found in Firestore.');
          }
        })
        .catch((error) => {
          console.error('Error querying Firestore:', error);
        });
    } catch (error) {
      console.error('Error deleting the file:', error);
    }
  };

  const handleFav = async () => {
    try {
      const fileRef = doc(database.files, file.id);
      getDoc(fileRef)
        .then(async (docSnapshot) => {
          if (docSnapshot.exists()) {
            const fileData = docSnapshot.data();
  
            await updateDoc(fileRef, {
              fav: true
            });
            onDelete(true);
          } else {
            console.log('File not found in Firestore.');
          }
        })
        .catch((error) => {
          console.error('Error querying Firestore:', error);
        });
    } catch (error) {
      console.error('Error deleting the file:', error);
    }
  };
  
  const moveFile = () => {
    console.log(newFolder)
    try {
      const fileRef = doc(database.files, file.id);
      getDoc(fileRef)
        .then(async (docSnapshot) => {
          if (docSnapshot.exists()) {
            const fileData = docSnapshot.data();
            
            await updateDoc(fileRef, {
              folderId: newFolder,
            });
            setNewFolder('')
            
            console.log('File deleted from Firebase Storage.');
          } else {
            console.log('File not found in Firestore.');
          }
        })
        .catch((error) => {
          console.error('Error querying Firestore:', error);
        });
    } catch (error) {
      console.error('Error deleting the file:', error);
    }
  }

  const dynamicColors = ['#FF5733', '#FFC300', '#33FF57', '#0099CC']; // Define an array of dynamic colors
  const getRandomColor = () => {
    // Generate a random color from the array
    const randomIndex = Math.floor(Math.random() * dynamicColors.length);
    return dynamicColors[randomIndex];
  };
  return (
    <>
      <TouchableOpacity onPress={() => setOpen(true)}>
        <Image
          source={require('../../../assets/file2.png')}
          style={{ width: 80, height: 80 }}
        />
        <Text style={styles.fileName}>
          {file.name.length > 8 ? `${file.name.substring(0, 8)}...` : file.name}
        </Text>
      </TouchableOpacity>
      <Modal visible={openAlert} transparent={true} animationType="slide">
  <View style={styles.centeredView}>
    <View style={styles.modalView}>
      <Text style={styles.modalText}>
        You are using an Android version greater than 11. New policy only allows scoped storage so your files are stored at:
      </Text>
      <Text style={styles.filePath}>
        /Android/data/com.google.dark.drive/files
      </Text>
      <TouchableHighlight
        style={{ ...styles.openButton, backgroundColor: "#2196F3" }}
        onPress={() => {
          setOpenAlert(!openAlert);
        }}
      >
        <Text style={styles.textStyle}>Close</Text>
      </TouchableHighlight>
    </View>
  </View>
</Modal>

      <Modal visible={open} transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.header}>
              <Text style={styles.menuTitle}>File Manager</Text>
              <TouchableOpacity onPress={() => setOpen(false)}>
                    <Image
                source={require('../../../assets/remove.png')}
                style={{ width: 32, height: 32 }}
              />
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={[styles.modalButton, { backgroundColor: '#22AA11' }]} onPress={handleDownload}>
              <Text style={styles.modalButtonText}>Download</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.modalButton, { backgroundColor: '#FF6347' }]} onPress={handleDelete}>
              <Text style={[styles.modalButtonText, { color: 'white' }]}>Delete</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalButton} onPress={handleTrash}>
              <Text style={styles.modalButtonText}>Trash</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.modalButton, { backgroundColor: '#fff' }]} onPress={handleFav}>
              <Text style={[styles.modalButtonText, { color: '#000' }]}>Favorite</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: '#4682B4' }]}
              onPress={() => {
                setOpen(false);
                setMove(true);
              }}
            >
              <Text style={[styles.modalButtonText, { color: 'white' }]}>Move</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {move && (
        <Modal visible={move} animationType="slide" transparent={true}>
          <MoveFile setDisplay={setMove} setDestination={setNewFolder} moveFile={moveFile} />
        </Modal>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Dimmed background
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  },
  openButton: {
    backgroundColor: "#F194FF",
    borderRadius: 20,
    padding: 10,
    elevation: 2
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center"
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center"
  },
  filePath: {
    marginBottom: 15,
    color: 'grey',
    textAlign: "center"
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.7)', // Darkened background overlay
  },
  modalContainer: {
    backgroundColor: '#333', // Dark background for the modal
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#555', // Slightly lighter border color for separation
    marginBottom: 20,
  },
  fileName: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    color: "#bbb", // Lighter text color for better contrast
    fontFamily: "Roboto-Italic"
  },
  modalButton: {
    padding: 10,
    borderRadius: 10,
    margin: 10,
    alignItems: 'center',
    borderColor: '#555', // Slightly lighter border color for buttons
    borderWidth: 1,
    backgroundColor: '#444', // Dark background for buttons
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  modalButtonText: {
    fontSize: 16,
    fontFamily: 'Roboto-Bold',
    color: '#fff', // White text color for better contrast
  },
  closeButton: {
    backgroundColor: '#222', // Even darker background for the close button
    padding: 10,
    borderRadius: 10,
    margin: 10,
    alignItems: 'center',
    borderColor: '#444', // Border color for the close button
    borderWidth: 1,
  },
  closeButtonText: {
    fontSize: 16,
    fontFamily: 'Roboto-Bold',
    color: '#fff', // White text color for the close button text
  },
  

  fileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'gray',
  },
  buttonContainer: {
    flexDirection: 'row',
  },
  button: {
    marginHorizontal: 1,
    padding: 2,
    backgroundColor: 'blue',
  },
  buttonText: {
    color: 'white',
  },
  menuBox: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    width: '70%',
  },
  menuTitle: {
    fontSize: 25,
    fontWeight: 'bold',
    marginBottom: 10,
    color: 'white'
  },
  
});
/*
<MoveFile current={file.folderId} setDestination={setNewFolder}/>
        <Button title='Move' onPress={()=> {try {
      const fileRef = doc(database.files, file.id);
      getDoc(fileRef)
        .then(async (docSnapshot) => {
          if (docSnapshot.exists()) {
            const fileData = docSnapshot.data();
  
            await updateDoc(fileRef, {
              folderId: newFolder
            });
            onDelete(true);
          } else {
            console.log('File not found in Firestore.');
          }
        })
        .catch((error) => {
          console.error('Error querying Firestore:', error);
        });
    } catch (error) {
      console.error('Error deleting the file:', error);
    }}} />*/
