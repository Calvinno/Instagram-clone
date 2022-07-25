import { Feather } from '@expo/vector-icons';
import { Video } from 'expo-av';
import React, { useLayoutEffect, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { list, ref, uploadBytes, getDownloadURL, listAll } from 'firebase/storage'
import { db, storage, auth } from '/Users/calvincantin/Desktop/Desktop/Programmation/React Native Applications/instagram/FrontEnd/firbase.js'
import { setDoc, doc, serverTimestamp, addDoc, collection, getDocs, query, where } from 'firebase/firestore'
import MentionsTextInput from 'react-native-mentions';
import { Snackbar } from 'react-native-paper';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { fetchUserPosts, sendNotification } from '../../../redux/actions/index'
import { container, navbar, text, utils } from '../../styles';
import { v4 } from 'uuid'


function Save (props) {
    const [caption, setCaption] = useState("")
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState(false)
    const [data, setData] = useState("")
    const [keyword, setKeyword] = useState("")

    useLayoutEffect(() => {
        props.navigation.setOptions({
            headerRight: () => (
                <Feather style={navbar.image} name="check" size={24} color="green" onPress={() => { uploadImage() }} />
            ),
        });
    }, [caption]);



    const uploadImage = async () => {
        if (uploading) {
            return;
        }
        setUploading(true)
        let downloadURLStill = null
        let downloadURL = await SaveStorage(props.route.params.source, 'post/' + auth.currentUser.uid + '/' + v4())
        if (props.route.params.imageSource != null) {
            downloadURLStill = await SaveStorage(props.route.params.imageSource, `post/${auth.currentUser.uid}/${v4()}`)
        }

        savePostData(downloadURL, downloadURLStill);
    }


    const SaveStorage = async (imageUri, path) => {
        if (imageUri == 'default') {
            return '';
        }

        const imageRef = ref(storage, path);
        const image = await fetch(imageUri)
        const byte = await image.blob();

        await uploadBytes(imageRef, byte)
        .catch(error => alert(error.message))
        const downloadURL =  await getDownloadURL(imageRef)
        .catch(error => alert(error.message))

        return downloadURL;
    }

    const savePostData = (downloadURL, downloadURLStill) => {

        let object = {
            downloadURL,
            caption,
            likesCount: 0,
            commentsCount: 0,
            type: props.route.params.type,
            creation: serverTimestamp()
        }
        if (downloadURLStill != null) {
            object.downloadURLStill = downloadURLStill
        }


        const path = 'post/' + auth.currentUser.uid  + '/userPosts';
        const documentPath = collection(db, path);
        addDoc(documentPath, object)
        .then((result) => {
            props.fetchUserPosts()
            props.navigation.popToTop()
        })
        .catch(error => {
            setUploading(false)
            setError(true)
            alert(error.message)
        })

        var pattern = /\B@[a-z0-9_-]+/gi;
        let array = caption.match(pattern)

        if(array !== null) {
            for(let i = 0; i < array.length; i++){
                const usersRef = collection(db, 'users');
                const q = query(usersRef, where('username', '==', array[i].substring(1)));
                getDocs(q)
                .then((snapshot) => {
                    snapshot.forEach((doc) => {
                        props.sendNotification(doc.data().notificationToken, "New tag", `${props.currentUser.name} Tagged you in a post`, { type: 0, user: auth.currentUser.uid })
                    })
                })
                .catch(error => alert(error.message))
            }
        }

    }

    const renderSuggestionsRow = ({ item }, hidePanel) => {
        return (
            <TouchableOpacity onPress={() => onSuggestionTap(item.username, hidePanel)}>
                <View style={styles.suggestionsRowContainer}>
                    <View style={styles.userIconBox}>
                        <Image
                            style={{ aspectRatio: 1 / 1, height: 45 }}
                            source={{
                                uri: item.image
                            }}
                        />
                    </View>
                    <View style={styles.userDetailsBox}>
                        <Text style={styles.displayNameText}>{item.name}</Text>
                        <Text style={styles.usernameText}>@{item.username}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        )
    }

    const onSuggestionTap = (username, hidePanel) => {
        hidePanel();
        const comment = caption.slice(0, - keyword.length)
        setCaption(comment + '@' + username + " ");
    }

    const callback = (keyword) => {
        setKeyword(keyword)
        const usersCollection = collection(db, 'users');
        const userCollectionSearch = query(usersCollection, where('name', '>=', keyword.substring(1)))
        getDocs(userCollectionSearch)
        .then((snapshot) => {
            let result = snapshot.docs.map(doc => {
                const data = doc.data();
                const id = doc.id;
                return { id, ...data }
            })
            setData(result);
        })
        .catch(error => alert(error.message))
    }
    

    return (
        <View style={[container.container, utils.backgroundWhite]}>
            {uploading ? (

                <View style={[container.container, utils.justifyCenter, utils.alignItemsCenter]}>
                    <ActivityIndicator style={utils.marginBottom} size="large" />
                    <Text style={[text.bold, text.large]}>Upload in progress...</Text>
                </View>
            ) : (
                <View style={[container.container]}>
                    <View style={[container.container, utils.backgroundWhite, utils.padding15]}>

                        <View style={[{ marginBottom: 20, width: '100%' }]}>


                            <MentionsTextInput

                                textStyle={{ borderColor: '#ebebeb', borderWidth: 1, padding: 5, fontSize: 15, width: '100%' }}
                                suggestionsPanelStyle={{ backgroundColor: 'rgba(100,100,100,0.1)' }}
                                loadingComponent={() => <View style={{ flex: 1, width: 200, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator /></View>}
                                textInputMinHeight={30}
                                textInputMaxHeight={80}
                                trigger={'@'}
                                triggerLocation={'new-word-only'} // 'new-word-only', 'anywhere'
                                value={caption}
                                onChangeText={setCaption}
                                triggerCallback={callback.bind(this)}
                                renderSuggestionsRow={renderSuggestionsRow.bind(this)}
                                suggestionsData={data}
                                keyExtractor={(item, index) => item.username}
                                suggestionRowHeight={45}
                                horizontal={true}
                                MaxVisibleRowCount={3}
                            />
                        </View>
                        <View>
                            {props.route.params.type ?

                                <Image
                                    source={{ uri: props.route.params.source }}
                                    style={[{ aspectRatio: 1 / 1, backgroundColor: 'black'}, container.image]}
                                />

                                :

                                <Video
                                    source={{ uri: props.route.params.source }}
                                    shouldPlay={true}
                                    isLooping={true}
                                    resizeMode="cover"

                                    style={{ aspectRatio: 1 / 1, backgroundColor: 'black' }}
                                />
                            }
                        </View>

                    </View>
                    <Snackbar
                        visible={error}
                        duration={2000}
                        onDismiss={() => setError(false)}>
                        Something Went Wrong!
                    </Snackbar>
                </View>
            )}

        </View>

    )
}
const styles = StyleSheet.create({
    container: {
        height: 300,
        justifyContent: 'flex-end',
        paddingTop: 100
    },
    suggestionsRowContainer: {
        flexDirection: 'row',
    },
    userAvatarBox: {
        width: 35,
        paddingTop: 2
    },
    userIconBox: {
        height: 45,
        width: 45,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#54c19c'
    },
    usernameInitials: {
        color: '#fff',
        fontWeight: '800',
        fontSize: 14
    },
    userDetailsBox: {
        flex: 1,
        justifyContent: 'center',
        paddingLeft: 10,
        paddingRight: 15
    },
    displayNameText: {
        fontSize: 13,
        fontWeight: '500'
    },
    usernameText: {
        fontSize: 12,
        color: 'rgba(0,0,0,0.6)'
    }
});

const mapStateToProps = (store) => ({
    currentUser: store.userState.currentUser
})

const mapDispatchProps = (dispatch) => bindActionCreators({ fetchUserPosts, sendNotification }, dispatch);


export default connect(mapStateToProps, mapDispatchProps)(Save);