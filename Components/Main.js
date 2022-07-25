import * as Notifications from 'expo-notifications';
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { reload } from '../redux/actions';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import FeedScreen from './main/Feed';
import ProfileScreen from './main/profile/Profile'
import SearchScreen from './main/profile/Search';
import CameraScreen from './main/add/Camera';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { auth } from '../firbase';


const Tab = createMaterialBottomTabNavigator();

function Main(props){
    const [unreadChats, setUnreadChats] = useState(false)
    const [lastNot, setLastNot] = useState(false)

    const lastNotificationResponse = Notifications.useLastNotificationResponse();


    useEffect(() =>{
        props.reload()
        if (lastNotificationResponse != null && lastNotificationResponse != lastNot) {
            setLastNot(lastNotificationResponse)
            switch (lastNotificationResponse.notification.request.content.data.type) {
                case 0:
                    props.navigation.navigate("Post", { item: lastNotificationResponse.notification.request.content.data.postId, user: lastNotificationResponse.notification.request.content.data.user, notification: true })
                    break;
                case 1:
                    props.navigation.navigate("Chat", { user: lastNotificationResponse.notification.request.content.data.user, notification: true })
                    break;
                case 2:
                    props.navigation.navigate("ProfileOther", { uid: lastNotificationResponse.notification.request.content.data.user, username: undefined, notification: true })
                    break;
            }
        }
        Notifications.addNotificationResponseReceivedListener((notification) => {
            switch (notification.notification.request.content.data.type) {
                case "post":
                    props.navigation.navigate("Post", { item: notification.notification.request.content.data.postId, user: notification.notification.request.content.data.user, notification: true })
                    break;
                case "chat":
                    props.navigation.navigate("Chat", { user: notification.notification.request.content.data.user, notification: true })
                    break;
                case "profile":
                    props.navigation.navigate("ProfileOther", { uid: notification.notification.request.content.data.user, username: undefined, notification: true })
                    break;
            }
        });
    },[]) 

        return (
            <Tab.Navigator initialRouteName='Feed' labeled={false}>
                <Tab.Screen name="Feed" 
                    component={FeedScreen} 
                    options={{
                        headerShown: false,
                        tabBarIcon:({color, size}) => (
                            <MaterialCommunityIcons name='home' color={color} size={26}/>
                        )
                        }} />
                <Tab.Screen key={Date.now()} name="Search" component={SearchScreen} navigation={props.navigation}
                    options={{
                        tabBarLabel: 'Seach',
                        tabBarIcon: ({ color, size }) => (
                            <MaterialCommunityIcons name="magnify" color={color} size={26} />
                        ),
                    }} />       
                <Tab.Screen key={Date.now()} name="Camera" component={CameraScreen} navigation={props.navigation}
                    options={{
                        tabBarIcon: ({ color, size }) => (
                            <MaterialCommunityIcons name="camera" color={color} size={26} />
                        ),
                    }} />
                <Tab.Screen name="Profile" 
                    component={ProfileScreen} navigation={props.navigation}
                    listeners={({navigation}) => ({
                        tabPress: event => {
                        event.preventDefault();
                        navigation.navigate('Profile', {uid: auth.currentUser.uid});
                        }
                    })}
                    options={{
                        
                        headerShown: false,
                        tabBarIcon:({color, size}) => (
                            <MaterialCommunityIcons name='account-circle' color={color} size={26}/>
                        ),
                    }} />
            </Tab.Navigator>
        )
    
}

const mapStateToProps = (store) => ({
    currentUser: store.userState.currentUser
})
const mapDispatchProps = (dispatch) => bindActionCreators({ reload }, dispatch);

export default connect(mapStateToProps, mapDispatchProps)(Main); 