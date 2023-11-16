import React from "react"
import { StyleSheet, Text, TextInput, View, Button, TouchableOpacity, Image } from 'react-native';

export default function Folder({ folder, navigation }) {
  return (
    <>
        
        <TouchableOpacity onPress={() => navigation.push('Dashboard', {
            folderId: `${folder.id}`,
        })}>
            <Image
                source={require('../../../assets/folder4.png')}
                style={{width: 80, height: 80}}
            />
            <Text style={styles.folderName}>{folder.name.length > 8 ? `${folder.name.substring(0, 8)}...` : folder.name}</Text>
        </TouchableOpacity>
    </>
  )
}

const styles = StyleSheet.create({
  folderName: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    color: "white",
    fontFamily: "Roboto-Italic"
  },

})