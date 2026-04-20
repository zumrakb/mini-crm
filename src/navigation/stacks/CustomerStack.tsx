import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import CustomerDetailScreen from '../../screens/CustomerDetailScreen';
import CustomerListScreen from '../../screens/CustomerListScreen';
import type { CustomerStackParamList } from '../../types/navigation';

const Stack = createStackNavigator<CustomerStackParamList>();

const CustomerStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CustomerList" component={CustomerListScreen} />
      <Stack.Screen name="CustomerDetail" component={CustomerDetailScreen} />
    </Stack.Navigator>
  );
};

export default CustomerStackNavigator;
