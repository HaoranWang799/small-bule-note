import { createBrowserRouter } from "react-router";
import { SplashScreen } from "./components/SplashScreen";
import { LoginScreen } from "./components/LoginScreen";
import { RegisterScreen } from "./components/RegisterScreen";
import { TabLayout } from "./components/TabLayout";
import { ChatListScreen } from "./components/ChatListScreen";
import { ChatScreen } from "./components/ChatScreen";
import { ContactsScreen } from "./components/ContactsScreen";
import { AddFriendScreen } from "./components/AddFriendScreen";
import { ProfileScreen } from "./components/ProfileScreen";
import { EditProfileScreen } from "./components/EditProfileScreen";

export const router = createBrowserRouter([
  { path: "/", Component: SplashScreen },
  { path: "/login", Component: LoginScreen },
  { path: "/register", Component: RegisterScreen },
  {
    Component: TabLayout,
    children: [
      { path: "/chats", Component: ChatListScreen },
      { path: "/contacts", Component: ContactsScreen },
      { path: "/profile", Component: ProfileScreen },
    ],
  },
  { path: "/chat/:contactId", Component: ChatScreen },
  { path: "/add-friend", Component: AddFriendScreen },
  { path: "/edit-profile", Component: EditProfileScreen },
]);
