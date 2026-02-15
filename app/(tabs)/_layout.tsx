import { Tabs } from 'expo-router';
import { Timer, FolderCanvas, History } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: '#3b82f6', headerStyle: { backgroundColor: '#0f172a' }, headerTintColor: '#fff' }}>
      <Tabs.Screen name="index" options={{ title: 'Timer', tabBarIcon: ({color}) => <Timer color={color} /> }} />
      <Tabs.Screen name="projects" options={{ title: 'Projects', tabBarIcon: ({color}) => <FolderCanvas color={color} /> }} />
      <Tabs.Screen name="history" options={{ title: 'History', tabBarIcon: ({color}) => <History color={color} /> }} />
    </Tabs>
  );
}
