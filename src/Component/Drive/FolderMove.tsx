import React from "react"
import { StyleSheet, Text, TextInput, View, Button, TouchableOpacity, Image } from 'react-native';

export default function FolderMove({ folder, setFolder }) {
  return (
    <View>
        
        <TouchableOpacity onPress={() => setFolder(folder.id)}>
            <Image
                source={require('../../../assets/folder4.png')}
                style={{width: 50, height: 50}}
            />
            <Text style={styles.folderName}>{folder.name.length > 10 ? `${folder.name.substring(0, 10)}...` : folder.name}</Text>
        </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
    folderName: {
      flex: 1,
      textAlign: 'center',
      fontSize: 10,
      color: "white",
      fontFamily: "Roboto-Italic"
    },
  
  })