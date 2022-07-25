import { StatusBar } from 'expo-status-bar';
import React, { Component } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AsyncStorage } from '@react-native-async-storage/async-storage'
import { getFocusedRouteNameFromRoute, NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firbase';
import PostScreen from './Components/main/post/Post';
import RegisterScreen from './Components/Auth/Register';
import LoginScreen from './Components/Auth/Login';
import MainScreen from './Components/Main';
import CommentsScreen from './Components/main/post/Comments';
import ProfileScreen from './Components/main/profile/Profile';
import EditScreen from './Components/main/profile/Edits';
import { Provider } from 'react-redux';
import { applyMiddleware, configureStore } from '@reduxjs/toolkit';
import  rootReducer from './redux/reducers';
import thunk from 'redux-thunk';
import SaveScreen from './Components/main//add/Save';


const store = configureStore({
  reducer: rootReducer,
  middleware: [thunk],
})

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const Stack = createStackNavigator();
export class  App extends Component {
  constructor(props){
    super(props)
    this.state= {
      loaded: false,

    }
  }

  componentDidMount(){
    onAuthStateChanged(auth, user => {
      if(!user){
        this.setState({
          loggedIn: false,
          loaded: true,
        })
      } 
      else{
        this.setState({
          loggedIn: true,
          loaded: true,
        })
      }
    })
  }
render() {
  const { loggedIn, loaded } = this.state;
  if (!loaded){
    return(
      <View style={{flex: 1, justifyContent: 'center'}}>
        <Text>loading</Text>
      </View>
    )
  }
  
  if (!loggedIn){
    return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
            <Stack.Screen name="Register" component={RegisterScreen} navigation={this.props.navigation} options={{ headerShown: false }} />
            <Stack.Screen name="Login" navigation={this.props.navigation} component={LoginScreen} options={{ headerShown: false }} />
        </Stack.Navigator>
    </NavigationContainer>
  );
  }
  return(
    <Provider store={store}>
      <NavigationContainer>
        <Stack.Navigator initalRouteName='Main'>
          <Stack.Screen key={Date.now()} name="Main" component={MainScreen} navigation={this.props.navigation} options={({ route }) => {
            const routeName = getFocusedRouteNameFromRoute(route)
            switch (routeName) {
              case 'Camera': {
                return {
                  headerTitle: 'Camera',
                };
              }
              case 'chat': {
                return {
                  headerTitle: 'Chat',
                };
              }
              case 'Profile': {
                return {
                  headerTitle: 'Profile',
                };
              }
              case 'Search': {
                return {
                  headerTitle: 'Search',
                };
              }
              case 'Feed':
              default: {
                return {
                  headerTitle: 'Instagram',
                };
              }
            }
          }}/>
          <Stack.Screen key={Date.now()} name="Save" component={SaveScreen} navigation={this.props.navigation} />
          <Stack.Screen key={Date.now()} name="Post" component={PostScreen} navigation={this.props.navigation} />
          <Stack.Screen name='Comment' component={CommentsScreen} navigation={this.props.navigation}/>
          <Stack.Screen key={Date.now()} name="Profile" component={ProfileScreen} navigation={this.props.navigation} />
          <Stack.Screen key={Date.now()} name="ProfileOther" component={ProfileScreen} navigation={this.props.navigation} />
          <Stack.Screen key={Date.now()} name="Edit" component={EditScreen} navigation={this.props.navigation} />
      </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  )
  
}
  
}

export default App;
