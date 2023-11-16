import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ROOT_FOLDER } from "../../Hooks/useFolder";

export default function FolderBreadcrumbsMove({ currentFolder, setFolder }) {
  let path = currentFolder ? [ROOT_FOLDER, ...currentFolder.path] : [ROOT_FOLDER];

  return (
    <View style={styles.breadcrumbsContainer}>
      {path.map((folder, index) => (
        <TouchableOpacity
          key={folder.id}
          onPress={() => setFolder(folder.id)}
          style={styles.crumb}
        >
          <Text style={styles.crumbText}>\{folder.name}</Text>
        </TouchableOpacity>
      ))}
      {currentFolder && currentFolder.name !== 'Root' && (
        <Text style={styles.crumbText}>\{currentFolder.name}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  breadcrumbsContainer: {
    flexDirection: 'row',
    backgroundColor: '#000',
    padding: 8,
    margin: 0,
    flexGrow: 1,
  },
  crumb: {
    maxWidth: 150,
    marginRight: 10,
    overflow: 'hidden',
  },
  crumbText: {
    fontFamily: 'Roboto-Italic',
    textAlign: 'center',
    color: '#6fc4f2',
    fontSize: 16,
  },
});
