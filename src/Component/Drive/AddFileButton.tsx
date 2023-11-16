import React, { useState } from "react"

import { useAuth } from "../../Contexts/AuthContext"
import { storage, database } from "../../Firebase"
import { ROOT_FOLDER } from "../../Hooks/useFolder"
import "react-native-get-random-values";
import { v4 as uuidV4 } from "uuid"
import { ref, uploadBytes, getDownloadURL, uploadBytesResumable } from "firebase/storage"
import { getDocs, query, where, addDoc, updateDoc, collection } from "firebase/firestore";
import { serverTimestamp } from "firebase/firestore";
import { StyleSheet, View, Text, Button, TouchableOpacity, ToastAndroid, Image, Modal, ActivityIndicator } from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import { PermissionsAndroid } from 'react-native';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { Platform } from 'react-native';

export default function AddFileButton({ currentFolder }) {
  const [uploadingFiles, setUploadingFiles] = useState([])
  const [openAlert, setOpenAlert] = useState(false);

  const { currentUser } = useAuth()

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
  
  const uploadMenu = async () => {
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
        copyTo: "cachesDirectory"
      });
      if (result) {
        setUploadingFiles([result]);
        console.log(uploadingFiles)
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

  const handleUpload = async (file) => {
    if (currentFolder == null || file == null) return
    
    const id = uuidV4()
    setUploadingFiles(prevUploadingFiles => [
      ...prevUploadingFiles,
      { id: id, name: file[0].name, progress: 0, error: false },
    ]);
    const filePath =
      currentFolder === ROOT_FOLDER
        ? `${currentFolder.path.join("/")}/${file[0].name}`
        : `${currentFolder.path.join("/")}/${currentFolder.name}/${file[0].name}`
    
    const storageRef = ref(storage, `/files/${currentUser.uid}/${filePath}`);

    console.log(file[0])
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
    
    const response = await fetch(file[0].fileCopyUri);
    const blob = await response.blob();


    const uploadTask = uploadBytesResumable(storageRef, blob);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setOpenAlert(true);
        setUploadingFiles((prevUploadingFiles) => {
          return prevUploadingFiles.map((uploadFile) => {
            if (uploadFile.id === id) {
              return { ...uploadFile, progress: progress };
            }
            return uploadFile;
          });
        });
      },
      () => {
        // Handle the upload error
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
        setOpenAlert(false);
        // Remove the file from the uploading files state
        setUploadingFiles((prevUploadingFiles) => {
          return prevUploadingFiles.filter((uploadFile) => {
            return uploadFile.id !== id;
          });
        });
      
        // Get the download URL for the uploaded file
        let urlGlobal;
        getDownloadURL(uploadTask.snapshot.ref)
          .then((url) => {
            urlGlobal = url;
            // Check if a file with the same name, userId, and folderId exists
            return getDocs(
              query(
                database.files,
                where("name", "==", file[0].name),
                where("userId", "==", currentUser.uid),
                where("folderId", "==", currentFolder.id)
              )
            );
          })
          .then((existingFiles) => {
            if (!existingFiles.empty) {
              const existingFile = existingFiles.docs[0];
              updateDoc(existingFile.ref, { url: urlGlobal });
            } else {
              return addDoc(database.files, {
                url: urlGlobal,
                name: file[0].name,
                createdAt: serverTimestamp(),
                folderId: currentFolder.id,
                userId: currentUser.uid,
                fav: false,
                deleted: false,
              });
            }
          })
          .catch((error) => {
            console.error("Error during Firestore operation:", error);
          });
      }
    )
  }

  return (
    <View style={{marginTop: 10}}>
      <Modal visible={openAlert} transparent={true} animationType="fade">
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <ActivityIndicator size="large" color="#0000ff" />
            <Text style={styles.modalText}>
              Please wait until the upload finishes.
            </Text>
          </View>
        </View>
      </Modal>
      <TouchableOpacity style={styles.modalButton2} onPress={uploadMenu}>
          <Image source={require('../../../assets/uploading.gif')} style={{width: 30, height: 30}} />
          <Text style={styles.modalButtonText}>Upload File</Text>
        </TouchableOpacity>
      
    </View>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
  modalText: {
    marginTop: 15,
    textAlign: "center",
    fontSize: 16, // Adjusted font size for better readability
  },
  modalButton2: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 10,
    marginHorizontal: 20,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333', // Darker border color
    borderStyle: 'dashed',
    shadowColor: 'rgba(0, 0, 0, 1)', // Slight shadow with transparency
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 1, // Full shadow opacity
    shadowRadius: 8,
    // Add a linear gradient background to make it more interesting
    // You may need to install 'react-native-linear-gradient' and import it
    // gradient colors can be adjusted as per your preference
    // For example, from white to a light shade of blue
    // This adds a subtle gradient to the button's background
    // You can adjust the 'start' and 'end' properties to control the gradient direction
  },
  
  modalButtonText: {
    color: '#333', // Dark text color
    fontFamily: 'Roboto-Bold',
    fontSize: 20,
  },
})