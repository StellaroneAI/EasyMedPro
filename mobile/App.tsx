import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import DashboardScreen from './src/screens/Dashboard';
import PatientDashboardScreen from './src/screens/PatientDashboard';

const Tab = createBottomTabNavigator();
import RootNavigator from './src/navigation/RootNavigator';

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Dashboard" component={DashboardScreen} />
        <Tab.Screen name="Patient" component={PatientDashboardScreen} />
      </Tab.Navigator>
      <RootNavigator />
    </NavigationContainer>
  );
}
