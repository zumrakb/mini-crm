export type Screen = 'Dashboard' | 'About' | 'Settings' | 'Privacy';

export type RootStackParamList = {
  Dashboard: undefined;
  About: undefined;
  Settings: undefined;
  Privacy: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
