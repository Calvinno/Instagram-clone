import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { getDocs, getDoc, doc, query, orderBy, collection, onSnapshot, updateDoc, deleteDoc, where } from "firebase/firestore"
import { auth, db } from "../../firbase";
import { USER_STATE_CHANGE, USER_POSTS_STATE_CHANGE, USER_FOLLOWING_STATE_CHANGE, USERS_DATA_STATE_CHANGE, USERS_POSTS_STATE_CHANGE, CLEAR_DATA, USERS_LIKES_STATE_CHANGE } from "../constants";

let unsubscribe = [];

export function reload() {
    return ((dispatch) => {
        dispatch(clearData())
        dispatch(fetchUser())
        dispatch(setNotificationService())
        dispatch(fetchUserPosts())
        dispatch(fetchUserFollowing())
    })
}

export const setNotificationService = () => async dispatch => {
    let token;
    if (Device.isDevice) {
        const existingStatus = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus.status !== 'granted') {
            const status = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus.status !== 'granted') {
            alert('Failed to get push token for push notification!');
            return;
        }

        token = (await Notifications.getExpoPushTokenAsync());
    } else {
        alert('Must use physical device for Push Notifications');
    }
    
    if (Platform.OS === 'android') {
        Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    Notifications.setNotificationHandler({
        handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: false,
            shouldSetBadge: false,
        }),
    });

    if(token != undefined) {
        const userReference = doc(db, 'users', auth.currentUser.uid);
        updateDoc(userReference, {
            notificationToken: token.data,
        })
        .catch(error => alert(error.message))
    }
}

export const sendNotification = (to, title, body, data) => dispatch => {
    if (to == null) {
        return;
    }

    let response = fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            to,
            sound: 'default',
            title,
            body,
            data
        })
    })

}


export function clearData() {
    return ((dispatch) => {
        for (let i = unsubscribe; i < unsubscribe.length; i++) {
            unsubscribe[i]();
        }
        dispatch({type: CLEAR_DATA})
    })
}

export function fetchUser(){
    return((dispatch) => {
        const userReference = doc(db, 'users', auth.currentUser.uid);
        let listener = onSnapshot(userReference, (snapshot, error) => {
            if(snapshot.exists()) {
                dispatch({ type: USER_STATE_CHANGE, currentUser: { uid: auth.currentUser.uid, ...snapshot.data() } })
            }
        })
        unsubscribe.push(listener)
    })
}

export function fetchUserPosts(){
    return((dispatch) => {
        const path = 'post/' + auth.currentUser.uid  + '/userPosts';
        const postsCollection = collection(db, path);
        const postCollectionInTimeStampOrder = query(postsCollection, orderBy('creation'));

        getDocs(postCollectionInTimeStampOrder)
        .then(snapshot => {
            let posts = snapshot.docs.map(doc => {
                const data = doc.data();
                const id = doc.id;
                return { id, ...data }
            })
            dispatch({type : USER_POSTS_STATE_CHANGE, posts})
            
            
        })
        .catch( error => alert(error.message))
    })
}

export function fetchUserFollowing(){
    return((dispatch) => {
        const path = 'following/' + auth.currentUser.uid  + '/userFollowing';
        const followingCollection = collection(db, path);


        let listener = onSnapshot(followingCollection, (snapshot) => {
            let following = snapshot.docs.map(doc => {
                const id = doc.id;
                return id
            })
            dispatch({type : USER_FOLLOWING_STATE_CHANGE, following})
            for(let i = 0; i < following.length; i++){
                dispatch(fetchUsersData(following[i], true))
            }
            
        })

        unsubscribe.push(listener)
    })
}

export function fetchUsersData(uid, getPosts) {
    return((dispatch, getState) => {
        const found  = getState().usersState.users.some(el => el.uid === uid);
        if(!found) {
            const userReference = doc(db, 'users', uid);
            getDoc(userReference)
            .then(snapshot => {
                if(snapshot.exists()){
                    let user = snapshot.data();
                    user.uid = snapshot.id
                    dispatch({type : USERS_DATA_STATE_CHANGE, user})
                }
                else { 
                    console.log('does not exist');
                }
            })
            .catch( error => alert(error.message))
            if(getPosts) {
                dispatch(fetchUsersFollowingPosts(uid))
            }
        }
    })
}

export function fetchUsersFollowingPosts(uid){
    return((dispatch, getState) => {
        const path = 'post/' + uid  + '/userPosts';
        const postsCollection = collection(db, path);
        const postCollectionInTimeStampOrder = query(postsCollection, orderBy('createdAt'));

        getDocs(postCollectionInTimeStampOrder)
        .then(snapshot => {
            const uid  = snapshot.query._query.path.segments[1];
            const user  = getState().usersState.users.find(el => el.uid === uid);
            let posts = snapshot.docs.map(doc => {
                const data = doc.data();
                const id = doc.id;
                return { id, ...data, user }
            })
            for(let i = 0; i < posts.length; i++){
                dispatch(fetchUsersFollowingLikes(uid, posts[i].id))
            }
            dispatch({type : USERS_POSTS_STATE_CHANGE, posts, uid})
        })
        .catch( error => alert(error.message))
    })
}

export function fetchUsersFollowingLikes(uid, postId){
    return((dispatch) => {
        const path = 'post/' + uid  + '/userPosts/' + postId + '/likes/' + auth.currentUser.uid;
        const likesReference = doc(db, path);

        let listener = onSnapshot(likesReference, (snapshot) => {
            const postId  = snapshot._key.path.segments[3];

            let currentUserLike = false;
            if(snapshot.exists()){
                currentUserLike = true;
            }
            dispatch({ type: USERS_LIKES_STATE_CHANGE, postId, currentUserLike });
            
        })

        unsubscribe.push(listener)
    })
}

export function queryUsersByUsername(username) {
    return((dispatch, getState) => {
        return new Promise((resolve, reject) => {
            if (username.length == 0) {
                resolve([])
            }

            const usersCollection = collection(db, 'users');
            const userCollectionSearch = query(usersCollection, where('name', '>=', username))
            getDocs(userCollectionSearch)
            .then((snapshot) => {
                let users = snapshot.docs.map(doc => {
                    const data = doc.data();
                    const id = doc.id;
                    return { id, ...data }
                })
                resolve(users);
            })
            
        })
    })
}

export function deletePost(item) {
    retrun ((dispatch, getState) => {
        return new Promise((resolve, reject) => {
            const path = 'post/' + auth.currentUser.uid  + '/userPosts/' + item.id;
            deleteDoc(path)
            .then(() => {
                resolve();
            }).catch(() => {
                reject();
            })
        })
    })
}