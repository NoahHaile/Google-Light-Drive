import { useReducer, useEffect } from "react";
import { useAuth } from "../Contexts/AuthContext";
import { collection, query, onSnapshot, doc, where, orderBy } from "firebase/firestore";
import { database } from "../Firebase";

const ACTIONS = {
  SELECT_FOLDER: "select-folder",
  UPDATE_FOLDER: "update-folder",
  SET_CHILD_FOLDERS: "set-child-folders",
  SET_CHILD_FILES: "set-child-files",
};

export const ROOT_FOLDER = { name: "Root", id: null, path: [] };

function reducer(state, { type, payload }) {
  switch (type) {
    case ACTIONS.SELECT_FOLDER:
      return {
        folderId: payload.folderId,
        folder: payload.folder,
        childFiles: [],
        childFolders: [],
      };
    case ACTIONS.UPDATE_FOLDER:
      return {
        ...state,
        folder: payload.folder,
      };
    case ACTIONS.SET_CHILD_FOLDERS:
      return {
        ...state,
        childFolders: payload.childFolders,
      };
    case ACTIONS.SET_CHILD_FILES:
      return {
        ...state,
        childFiles: payload.childFiles,
      };
    default:
      return state;
  }
}

export function useFolder(folderId = null, folder = null) {
  const [state, dispatch] = useReducer(reducer, {
    folderId,
    folder,
    childFolders: [],
    childFiles: [],
  });
  const { currentUser } = useAuth();

  useEffect(() => {
    dispatch({ type: ACTIONS.SELECT_FOLDER, payload: { folderId, folder } });
  }, [folderId, folder]);

  useEffect(() => {
    if (folderId == null) {
      return dispatch({
        type: ACTIONS.UPDATE_FOLDER,
        payload: { folder: ROOT_FOLDER },
      });
    }

    const folderRef = doc(database.folders, folderId);

    onSnapshot(folderRef, (docI) => {
        const folderData = docI.data();
        folderData.id = docI.id; // Set the document ID in the folderData object
        dispatch({
          type: ACTIONS.UPDATE_FOLDER,
          payload: { folder: folderData },
        });
    });
  }, [folderId]);

  useEffect(() => {
    const childFoldersQuery = query(
      database.folders,
      where("parentId", "==", folderId),
      where("userId", "==", currentUser.uid),
      orderBy("createdAt")
    );

    const unsubscribeChildFolders = onSnapshot(childFoldersQuery, (snapshot) => {
      dispatch({
        type: ACTIONS.SET_CHILD_FOLDERS,
        payload: { childFolders: snapshot.docs.map((docI) =>{
             const folderData = docI.data();
             folderData.id = docI.id;
             return folderData;
       }) },
      });
    });

    return unsubscribeChildFolders;
  }, [folderId, currentUser]);


  
  useEffect(() => {
    const childFilesQuery = query(
      database.files,
      where("folderId", "==", folderId),
      where("userId", "==", currentUser.uid),
      where("deleted", "==", false)
    );

    const unsubscribeChildFiles = onSnapshot(childFilesQuery, (snapshot) => {
      dispatch({
        type: ACTIONS.SET_CHILD_FILES,
        payload: { childFiles: snapshot.docs.map((docI) =>{
            const filesData = docI.data();
            filesData.id = docI.id;
            return filesData;
      }) },
      });
    });

    return unsubscribeChildFiles;
  }, [folderId, currentUser]);

  return state;
}
