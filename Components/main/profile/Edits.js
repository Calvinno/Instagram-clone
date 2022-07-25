import { Feather, FontAwesome5 } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Updates from 'expo-updates';
import React, { useEffect, useLayoutEffect, useState } from 'react';
import { Button, Image, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { auth, db, storage } from '../../../firbase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { container, form, navbar, text, utils } from '../../styles';
import { doc, updateDoc } from 'firebase/firestore';

function Edit(props) {
    const [name, setName] = useState(props.currentUser.name);
    const [description, setDescription] = useState("");
    const [image, setImage] = useState(props.currentUser.image);
    const [imageChanged, setImageChanged] = useState(false);
    const [hasGalleryPermission, setHasGalleryPermission] = useState(null);

    const onLogout = async () => {
        auth.signOut();
        Updates.reloadAsync()
    }


    useEffect(() => {
        (async () => {
            if (props.currentUser.description !== undefined) {
                setDescription(props.currentUser.description)
            }

        })();
    }, []);

    useLayoutEffect(() => {
        props.navigation.setOptions({
            headerRight: () => (

                <Feather style={navbar.image} name="check" size={24} color="green" onPress={() => { console.log({ name, description }); Save() }} />
            ),
        });
    }, [props.navigation, name, description, image, imageChanged]);


    const pickImage = async () => {
        if (true) {
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 1,
            });

            if (!result.cancelled) {
                setImage(result.uri);
                setImageChanged(true);
            }
        }
    };


    const Save = async () => {
        
        if (imageChanged) {
            const uri = image;
            const childPath = `profile/${auth.currentUser.uid}`;
            const imageRef = ref(storage, childPath)
            const profileImage = await fetch(uri);
            const byte = await profileImage.blob();
            
            await uploadBytes(imageRef, byte)
            .catch(error => alert(error.message))
            const downloadURL = await getDownloadURL(imageRef)
            .catch(error => alert(error.message))
            const documentPath = doc(db, 'users', auth.currentUser.uid)
            updateDoc(documentPath, {
                name,
                description,
                image: downloadURL,
            }).then(() => {
                props.navigation.goBack()

            })
            .catch(error => alert(error.message))
        } else {
            saveData({
                name,
                description,
            })
        }
    }

    const saveData = (data) => {
        const documentPath =  doc(db, 'users', auth.currentUser.uid)
        updateDoc(documentPath, data)
            .then(() => {
                props.navigation.goBack()
            })
    }

    return (
        <View style={container.form}>

            <TouchableOpacity style={[utils.centerHorizontal, utils.marginBottom]} onPress={() => pickImage()} >
                {image == 'default' ?
                    (
                        <FontAwesome5
                            style={[utils.profileImageBig, utils.marginBottomSmall]}
                            name="user-circle" size={80} color="black" />
                    )
                    :
                    (
                        <Image
                            style={[utils.profileImageBig, utils.marginBottomSmall]}
                            source={{
                                uri: image
                            }}
                        />
                    )
                }
                <Text style={text.changePhoto}>Change Profile Photo</Text>
            </TouchableOpacity>

            <TextInput
                value={name}
                style={form.textInput}
                placeholder="Name"
                onChangeText={(name) => setName(name)}
            />
            <TextInput
                value={description}
                style={[form.textInput]}
                placeholderTextColor={"#e8e8e8"}
                placeholder="Description"
                onChangeText={(description) => { setDescription(description); }}
            />
            <Button
                title="Logout"
                onPress={() => onLogout()} />
        </View>

    )
}

const mapStateToProps = (store) => ({
    currentUser: store.userState.currentUser,
})

export default connect(mapStateToProps, null)(Edit);