import { combineReducers } from "redux";
import user  from './user';
import users from "./users";

const Reducer = combineReducers({
    userState: user,
    usersState: users,
});

export default Reducer;