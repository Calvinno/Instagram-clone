import React, { Component, useState } from 'react';
import { View, Button, TextInput, Text } from 'react-native'
import { AsyncStorage } from '@react-native-async-storage/async-storage'
import { Snackbar } from 'react-native-paper';
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from '../../firbase';
import { setDoc, doc, collection, query, where, getDocs } from 'firebase/firestore';
import { container, form } from '../styles';

export default function Register (props) {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [isValid, setIsValid] = useState(true);
    
    const onSignUp = () => {

        if (name.length == 0 || username.length == 0 || email.length == 0 || password.length == 0) {
            setIsValid({ bool: true, boolSnack: true, message: "Please fill out everything" })
            return;
        }
        if (password.length < 6) {
            setIsValid({ bool: true, boolSnack: true, message: "passwords must be at least 6 characters" })
            return;
        }
        if (password.length < 6) {
            setIsValid({ bool: true, boolSnack: true, message: "passwords must be at least 6 characters" })
            return;
        }

       const usersRef = collection(db, 'users');
       const q = query(usersRef, where('username', '==', username));
        getDocs(q)
       .then((snapshot) => {
            if(snapshot.empty) {
                createUserWithEmailAndPassword(auth, email, password)
                .then(() => {
                    if(!snapshot.empty) {
                        console.log('allo')
                        return
                    }
                    setDoc(doc(db, 'users', auth.currentUser.uid), {
                        name,
                        email,
                        username,
                        image: 'default',
                        followingCount: 0,
                        followersCount: 0,
                    });
                })
                .catch((error) => {
                    setIsValid({ bool: true, boolSnack: true, message: "Something2 went wrong" })
                    alert(error.message)
                })

            }
        })
        .catch((error) => {
            setIsValid({ bool: true, boolSnack: true, message: "Something1 went wrong" })
            alert(error.message)
        })

       }
    
        return (
            <View style={container.center}>
            <View style={container.formCenter}>
                <TextInput
                    style={form.textInput}
                    placeholder="Username"
                    value={username}
                    keyboardType="twitter"
                    //À comparer avec le tuto
                    onChangeText={(username) => setUsername(username)}
                />
                <TextInput
                    style={form.textInput}
                    placeholder="name"
                    onChangeText={(name) => setName(name)}
                />
                <TextInput
                    style={form.textInput}
                    placeholder="email"
                    onChangeText={(email) => setEmail(email)}
                />
                <TextInput
                    style={form.textInput}
                    placeholder="password"
                    secureTextEntry={true}
                    onChangeText={(password) => setPassword(password)}
                />

                <Button
                    style={form.button}
                    onPress={() => onSignUp()}
                    title="Register"
                />
            </View>

            <View style={form.bottomButton} >
                <Text
                    onPress={() => props.navigation.navigate("Login")} >
                    Already have an account? SignIn.
                </Text>
            </View>
            <Snackbar
                visible={isValid.boolSnack}
                duration={2000}
                onDismiss={() => { setIsValid({ boolSnack: false }) }}>
                {isValid.message}
            </Snackbar>
        </View>
        );
}

