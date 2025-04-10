import { Slot } from 'expo-router';
//slots act like a placeholder for whatever screen is currently active
export default function Layout() {
  return <Slot />; //this renders the screen for the current router inside this layout
}