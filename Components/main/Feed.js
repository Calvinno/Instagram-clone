import React, { useState, useEffect } from 'react'
import { View, Text, Image, FlatList, StyleSheet, Button } from 'react-native'
import { useFocusEffect } from '@react-navigation/native';
import { doc, getDoc, getDocs, collection, query, orderBy, setDoc, deleteDoc } from 'firebase/firestore';

import { connect } from 'react-redux'
import { auth, db } from '../../firbase';
import { async } from '@firebase/util';

function Feed(props) {
  const [posts, setPosts] = useState([]);
  
  

  useEffect(() => {
     if(props.usersFollowingLoaded == props.following.length && props.following.length !== 0) {
        props.feed.sort(function(x,y) {
          return x.createdAt < y.createdAt
        })
        setPosts(props.feed);

     }


  }, [props.usersFollowingLoaded, props.feed])

  useFocusEffect(() => {
    props.navigation.getParent().setOptions({
        headerTitle: 'Instagram'
      })
});


  const onLikePress = (userId, postId) => {
    const path = 'post/' + userId  + '/userPosts/' + postId + '/likes/' + auth.currentUser.uid ;
    const likesReference = doc(db, path);
    setDoc(likesReference, {})
  } 

  const onDislikePress = (userId, postId) => {
    const path = 'post/' + userId  + '/userPosts/' + postId + '/likes/' + auth.currentUser.uid ;
    const likesReference = doc(db, path);
    deleteDoc(likesReference)
  } 

  return (
    <View style={styles.container}>

      <View style={styles.containerGallery}>
        <FlatList
          numColumns={1}
          horizontal={false}
          data={posts}
          renderItem={({item}) => (
            <View style={styles.containerImage}>
              <Text style={styles.container}> {item.user.name} </Text>
              <Image
              style={styles.image}
              source={{uri: item.downloadUrl}}
            />
            {item.currentUserLike ? 
            (
              <Button
                title='Dislike'
                onPress={() => onDislikePress(item.user.uid, item.id)}/>
            ) : 
            (
              <Button
                title='Like'
                onPress={() => onLikePress(item.user.uid, item.id)}/>
            )}
            <Text
              onPress={() => props.navigation.navigate('Comments', {postID: item.id, uid: item.user.uid})}>
                View Comments...
            </Text>
            </View>
            
          )}
        />

      </View>
    </View>
  )
}

const mapStateToProps = (store) => ({
  currentUser: store.userState.currentUser,
  following: store.userState.following,
  feed: store.usersState.feed,
  usersFollowingLoaded: store.usersState.usersFollowingLoaded
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 40,
  },
  containerInfo: {
    margin: 20
  },
  containerGallery: {
    flex: 1,
  },
  image: {
    flex: 1,
    aspectRatio: 1/1
  },
  containerImage: {
    flex: 1/3
  }
})

export default connect(mapStateToProps, null)(Feed);