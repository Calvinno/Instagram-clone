import React, { Component, useState } from 'react';
import { View, Button, TextInput, Text } from 'react-native'
import { signInWithEmailAndPassword } from "firebase/auth";
import { container, form } from '../styles';
import { auth } from '../../firbase';


export default function Login(props) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    
    const onSignIn = () => {
        signInWithEmailAndPassword(auth, email, password)
        .then(userCredentials => {
            const user = userCredentials.user;
            console.log("Login with", user.email);
          })
          .catch(error => alert(error.message))
        
    }
    
        return (
        <View style={container.center}>
            <View style={container.formCenter}>
            <TextInput
                placeholder='email'
                onChangeText={(email) => setEmail(email)}
            />
            <TextInput
                placeholder='password'
                secureTextEntry={true}
                onChangeText={(password) => setPassword(password)}
            />
            <Button
                style={form.button}
                title='Sign in'
                onPress={() => onSignIn()}/>
            </View>

            <View style={form.bottomButton} >
                <Text
                    title="Register"
                    onPress={() => props.navigation.navigate("Register")} >
                    Don't have an account? SignUp.
                </Text>
            </View>

        </View>
        
        );
    }



