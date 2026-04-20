import type { NavigatorScreenParams } from '@react-navigation/native';

export type CustomerStackParamList = {
  CustomerList: undefined;
  CustomerDetail: {
    customerId: number;
  };
};

export type RootTabParamList = {
  Home: undefined;
  Customers: NavigatorScreenParams<CustomerStackParamList>;
  Terms: undefined;
  Settings: undefined;
};

export type RootStackParamList = RootTabParamList;

export type Screen =
  | keyof RootTabParamList
  | keyof CustomerStackParamList;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootTabParamList {}
  }
}
