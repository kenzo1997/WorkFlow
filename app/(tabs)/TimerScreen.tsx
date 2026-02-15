import React, { useState, useEffect, useMemo } from 'react';
import { 
  View, Text, TouchableOpacity, StyleSheet, 
  Alert, Modal, ScrollView, Dimensions, TextInput, KeyboardAvoidingView, Platform 
} from 'react-native';
import { 
  Play, Square, Trash2, Clock, Zap, Pause, 
  Plus, DollarSign 
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import Svg, { Circle } from 'react-native-svg';
import { BarChart } from "react-native-chart-kit";
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';

import { supabase } from './supabase';

const PROJECT_COLORS = ['#3b82f6', '#22c55e', '#eab308', '#a855f7', '#ec4899', '#f97316'];
const DAILY_GOAL_SECONDS = 6 * 3600; 

export default function TimerScreen() {
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [taskName, setTaskName] = useState('');
  const [hourlyRate, setHourlyRate] = useState('50');
  const [selectedColor, setSelectedColor] = useState(PROJECT_COLORS[0]); // Color State
  const [history, setHistory] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'stats' | 'weekly' | 'monthly'>('stats');
  const [isModalVisible, setIsModalVisible] = useState(false);
  
  const [manualName, setManualName] = useState('');
  const [manualMinutes, setManualMinutes] = useState('');
  const [manualRate, setManualRate] = useState('50');

  const PROJECTS = ['General', 'Design', 'Development', 'Marketing', 'Admin'];
  const [selectedProject, setSelectedProject] = useState('General');

  const [activeFilter, setActiveFilter] = useState('All');

  /*
  async function playSuccessSound() {
    const { sound } = await Audio.Sound.createAsync(
       require('./assets/success.mp3') // Make sure to add a small mp3 to your assets folder!
    );
    await sound.playAsync();
  }
  */
  
  /*
  useEffect(() => {
    const loadData = async () => {
      const saved = await AsyncStorage.getItem('@timer_history');
      if (saved) setHistory(JSON.parse(saved));
    };
    loadData();
  }, []);
  */

  useEffect(() => {
    const fetchSessions = async () => {
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .order('created_at', { ascending: false });

      if (data) setHistory(data);
    };
    fetchSessions();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem('@timer_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    let interval: any;
    if (isRunning && !isPaused) {
      interval = setInterval(() => { setSeconds((s) => s + 1); }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, isPaused]);

  const getChartData = (daysCount: number) => {
    const labels = [];
    const values = [];
    const daysArr = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      if (daysCount <= 7) labels.push(daysArr[d.getDay()]);
      else labels.push(i % 5 === 0 ? `${d.getDate()}/${d.getMonth() + 1}` : "");
      const ds = d.toLocaleDateString();
      const daySecs = history
        .filter(item => new Date(parseInt(item.id)).toLocaleDateString() === ds)
        .reduce((acc, item) => acc + (item.rawSeconds || 0), 0);
      values.push(daySecs / 3600);
    }
    return { labels, datasets: [{ data: values }] };
  };

  const weeklyData = useMemo(() => getChartData(7), [history]);
  const monthlyData = useMemo(() => getChartData(30), [history]);

  const formatTime = (s: number) => {
    const hrs = Math.floor(s / 3600);
    const mins = Math.floor((s % 3600) / 60);
    const secs = s % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStop = async () => {
  // 1. Reset the UI immediately (so the button feels like it works)
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  
  const rateNum = parseFloat(hourlyRate) || 0;
  const newEntry = {
    id: Date.now().toString(),
    name: taskName.trim() || 'Untitled Task',
    project: selectedProject,
    color: selectedColor,
    duration: formatTime(seconds),
    rawSeconds: seconds,
    rate: hourlyRate,
    earned: (seconds / 3600) * rateNum,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };

  const updatedHistory = [newEntry, ...history];
  
  // Update local states
  setHistory(updatedHistory);
  setSeconds(0); 
  setTaskName(''); 
  setIsRunning(false); 
  setIsPaused(false);

  // 2. Save to Local Storage
  try {
    await AsyncStorage.setItem('@timer_history', JSON.stringify(updatedHistory));
  } catch (e) {
    console.log("Local save error", e);
  }

  // 3. Save to Supabase (only if you have it set up)
  // This is likely where it was getting stuck before!
  if (activeFilter === 'All') { // Using a simple check for now or your cloud toggle
    try {
      const { error } = await supabase
        .from('sessions')
        .insert([{
          name: newEntry.name,
          project: newEntry.project,
          color: newEntry.color,
          duration: newEntry.duration,
          raw_seconds: newEntry.rawSeconds,
          rate: newEntry.rate,
          earned: newEntry.earned
        }]);
        
      if (error) console.log("Supabase Error:", error.message);
    } catch (err) {
      console.log("Cloud save failed, but local worked.");
    }
  }
};

  const addManualEntry = () => {
    const mins = parseInt(manualMinutes);
    if (!manualName || isNaN(mins)) return;
    const secs = mins * 60;
    const rateNum = parseFloat(manualRate) || 0;
    const newEntry = {
      id: Date.now().toString(),
      name: manualName,
      color: selectedColor, // Manual entries also get selected color
      duration: formatTime(secs),
      rawSeconds: secs,
      rate: manualRate,
      earned: (secs / 3600) * rateNum,
      timestamp: "Manual"
    };
    setHistory([newEntry, ...history]);
    setManualName(''); setManualMinutes(''); setIsModalVisible(false);
  };

  const exportToCSV = async () => {
    const header = "Task,Duration,Rate,Earned,Date\n";
    const rows = history.map(item => `"${item.name}","${item.duration}","$${item.rate}","$${(item.earned || 0).toFixed(2)}","${new Date(parseInt(item.id)).toLocaleDateString()}"`).join("\n");
    const fileUri = FileSystem.documentDirectory + "history.csv";
    await FileSystem.writeAsStringAsync(fileUri, header + rows);
    await Sharing.shareAsync(fileUri);
  };

  const todayStr = new Date().toLocaleDateString();
  const todayHistory = history.filter(item => new Date(parseInt(item.id)).toLocaleDateString() === todayStr);
  const totalSecsToday = todayHistory.reduce((acc, item) => acc + (item.rawSeconds || 0), 0);
  const totalEarnedToday = todayHistory.reduce((acc, item) => acc + (item.earned || 0), 0);
  const progress = Math.min((totalSecsToday / DAILY_GOAL_SECONDS) * 100, 100);

  const filteredHistory = useMemo(() => {
    if (activeFilter === 'All') return history;
    return history.filter(item => item.project === activeFilter);
  }, [history, activeFilter]);

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.progressContainer}>
            <Svg width="60" height="60">
              <Circle cx="30" cy="30" r="25" stroke="#1e293b" strokeWidth="6" fill="none" />
              <Circle cx="30" cy="30" r="25" 
                stroke={selectedColor} // Progress ring now matches selected color
                strokeWidth="6" fill="none" 
                strokeDasharray={2 * Math.PI * 25} strokeDashoffset={2 * Math.PI * 25 * (1 - progress/100)} 
                strokeLinecap="round" rotation="-90" origin="30, 30" />
            </Svg>
            <View style={styles.progText}><Text style={styles.progPerc}>{Math.round(progress)}%</Text></View>
          </View>
          <View style={{flex: 1}}>
            <Text style={styles.hTitle}>Work Sessions</Text>
            <Text style={styles.hSub}>{formatTime(totalSecsToday)} Today</Text>
          </View>
          <TouchableOpacity onPress={() => setIsModalVisible(true)} style={styles.addBtn}><Plus color="white" size={24} /></TouchableOpacity>
        </View>

        {/* TOGGLE */}
        <View style={styles.toggleWrapper}>
          {(['stats', 'weekly', 'monthly'] as const).map((mode) => (
            <TouchableOpacity key={mode} style={[styles.tBtn, viewMode === mode && styles.tBtnAct]} onPress={() => setViewMode(mode)}>
              <Text style={[styles.tText, viewMode === mode && styles.tTextAct]}>{mode.charAt(0).toUpperCase() + mode.slice(1)}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* DASHBOARD CONTENT */}
        {viewMode === 'stats' ? (
          <View style={styles.dashboard}>
            <View style={styles.statBox}>
              <DollarSign color="#22c55e" size={14} /><Text style={styles.statLabel}>EARNED</Text>
              <Text style={styles.statValue}>${totalEarnedToday.toFixed(2)}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Clock color="#3b82f6" size={14} /><Text style={styles.statLabel}>SESSIONS</Text>
              <Text style={styles.statValue}>{todayHistory.length}</Text>
            </View>
          </View>
        ) : (
          <View style={styles.chartCard}>
             <Text style={styles.chartTitle}>{viewMode.toUpperCase()} HOURS</Text>
             <BarChart
              data={viewMode === 'weekly' ? weeklyData : monthlyData}
              width={Dimensions.get("window").width - 60}
              height={180}
              yAxisLabel="" yAxisSuffix="h" fromZero
              chartConfig={{
                backgroundGradientFrom: "#1e293b", backgroundGradientTo: "#1e293b",
                decimalPlaces: 1, 
                color: (op = 1) => viewMode === 'weekly' ? `rgba(168, 85, 247, ${op})` : `rgba(59, 130, 246, ${op})`,
                labelColor: (op = 1) => `rgba(148, 163, 184, ${op})`,
                barPercentage: viewMode === 'weekly' ? 0.6 : 0.3,
              }}
              style={{ borderRadius: 16, marginTop: 10 }}
              showValuesOnTopOfBars={viewMode === 'weekly'}
            />
          </View>
        )}

        {/* TIMER CARD */}
	<View style={styles.timerCard}>
 	 <TextInput 
  	  style={styles.input} 
 	   placeholder="Task Name..." 
 	   placeholderTextColor="#64748b" 
  	  value={taskName} 
  	  onChangeText={setTaskName} 
 	   editable={!isRunning} 
 	 />

         {!isRunning && (
         <View style={styles.projectPicker}>
           <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
             {PROJECTS.map((proj) => (
               <TouchableOpacity
                 key={proj}
                 onPress={() => {
                   Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                   setSelectedProject(proj);
                 }}
                 style={[
                   styles.projChip,
                   selectedProject === proj && { backgroundColor: selectedColor, borderColor: selectedColor }
                 ]}
               >
                 <Text style={[styles.projChipText, selectedProject === proj && { color: 'white' }]}>
                   {proj}
                 </Text>
               </TouchableOpacity>
             ))}
           </ScrollView>
         </View>
         )}
  
 	 {!isRunning && (
   	 <View style={styles.colorPicker}>
    	  {PROJECT_COLORS.map((color) => (
    	    <TouchableOpacity
     	     key={color}
     	     onPress={() => setSelectedColor(color)}
      	    style={[
       	     styles.colorOption,
         	   { backgroundColor: color },
        	    selectedColor === color && styles.colorSelected
        	  ]}
      	  />
    	  ))}
   	 </View>
 	 )}

 	 {!isRunning && (
 	   <View style={styles.rateRow}>
   	    <Text style={styles.rateLabel}>Rate: $</Text>
  	     <TextInput style={styles.rateInput} keyboardType="numeric" value={hourlyRate} onChangeText={setHourlyRate} />
  	     <Text style={styles.rateLabel}>/hr</Text>
 	   </View>
	  )}

 	 {/* MAIN TIMER DISPLAY */}
 	 <Text style={[styles.timerText, { color: isRunning ? (isPaused ? '#64748b' : selectedColor) : 'white' }]}>
 	   {formatTime(seconds)}
	  </Text>

 	 {/* NEW: LIVE EARNINGS PREVIEW */}
 	 {isRunning && (
  	  <Text style={styles.liveEarnings}>
   	   EARNING: <Text style={{ color: '#22c55e' }}>${((seconds / 3600) * (parseFloat(hourlyRate) || 0)).toFixed(2)}</Text>
  	  </Text>
 	 )}

	  <View style={styles.controls}>
 	   {!isRunning ? (
 	     <TouchableOpacity style={[styles.mainBtn, { backgroundColor: selectedColor }]} onPress={() => setIsRunning(true)}>
 	       <Play color="white" fill="white" size={20} /><Text style={styles.btnText}>Start</Text>
 	     </TouchableOpacity>
	    ) : (
 	     <>
  	      <TouchableOpacity style={styles.pauseBtn} onPress={() => setIsPaused(!isPaused)}>
  	        {isPaused ? <Play color="white" fill="white" size={20} /> : <Pause color="white" fill="white" size={20} />}
  	      </TouchableOpacity>
  	      <TouchableOpacity style={styles.stopBtn} onPress={handleStop}>
  	        <Square color="white" fill="white" size={20} /><Text style={styles.btnText}>Stop</Text>
  	      </TouchableOpacity>
  	    </>
 	   )}
 	 </View>
	</View>
        {/* ACTIVITY LOG */}
        <View style={styles.historySection}>
          <View style={styles.hHeader}>
            <Text style={styles.hTitle}>Activity Log</Text>
            <TouchableOpacity onPress={exportToCSV}><Text style={{ color: '#3b82f6', fontSize: 12 }}>Export CSV</Text></TouchableOpacity>
          </View>

	  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterBar} contentContainerStyle={{ gap: 8 }}>
          {['All', ...PROJECTS].map((filter) => (
            <TouchableOpacity
              key={filter}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setActiveFilter(filter);
              }}
              style={[
                styles.filterChip,
                activeFilter === filter && styles.filterChipActive
              ]}
            >
              <Text style={[styles.filterText, activeFilter === filter && styles.filterTextActive]}>
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
          
          {filteredHistory.map((item) => (
            <View key={item.id} style={[styles.hItem, { borderLeftColor: item.color }]}>
              {/* LEFT SIDE: Name, Project Badge, and Meta Info */}
              <View style={{ flex: 1, paddingRight: 10 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
                  <Text style={styles.hName}>{item.name}</Text>
                  <View style={[styles.hBadge, { backgroundColor: item.color + '22', borderColor: item.color }]}>
                    <Text style={[styles.hBadgeText, { color: item.color }]}>{item.project || 'General'}</Text>
                  </View>
                </View>
                <Text style={styles.hDate}>{item.timestamp} • ${item.rate}/hr</Text>
              </View>
        
              {/* RIGHT SIDE: Duration, Earned, and DELETE */}
              <View style={{ alignItems: 'flex-end', justifyContent: 'center' }}>
                <Text style={[styles.hDuration, { color: item.color }]}>{item.duration}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 4 }}>
                  <Text style={styles.hEarned}>${(item.earned || 0).toFixed(2)}</Text>
                  <TouchableOpacity 
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      Alert.alert("Delete Session", "Are you sure?", [
                        { text: "No" },
                        { text: "Yes", onPress: () => setHistory(history.filter(h => h.id !== item.id)) }
                      ]);
                    }}
                    style={{ padding: 4 }} // Larger tap target
                  >
                    <Trash2 color="#ef4444" size={18} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>  
              

      </ScrollView>

      {/* MODAL */}
      <Modal visible={isModalVisible} animationType="fade" transparent>
        <View style={styles.mOverlay}>
          <View style={styles.mContent}>
            <Text style={styles.mTitle}>Manual Entry</Text>
            <TextInput style={styles.mInput} placeholder="Task" placeholderTextColor="#64748b" value={manualName} onChangeText={setManualName} />
            <View style={{flexDirection:'row', gap: 10}}>
              <TextInput style={[styles.mInput, {flex: 1}]} placeholder="Mins" placeholderTextColor="#64748b" keyboardType="numeric" value={manualMinutes} onChangeText={setManualMinutes} />
              <TextInput style={[styles.mInput, {flex: 1}]} placeholder="Rate" placeholderTextColor="#64748b" keyboardType="numeric" value={manualRate} onChangeText={setManualRate} />
            </View>
            <TouchableOpacity style={[styles.mainBtn, { backgroundColor: selectedColor, alignSelf: 'center' }]} onPress={addManualEntry}><Text style={styles.btnText}>Save</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => setIsModalVisible(false)}><Text style={{ color: '#64748b', textAlign: 'center' }}>Cancel</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', paddingTop: 50 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 15, gap: 15 },
  progressContainer: { position: 'relative', width: 60, height: 60, justifyContent: 'center', alignItems: 'center' },
  progText: { position: 'absolute' },
  progPerc: { color: 'white', fontSize: 10, fontWeight: 'bold' },
  hTitle: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  hSub: { color: '#64748b', fontSize: 14 },
  addBtn: { backgroundColor: '#3b82f6', padding: 10, borderRadius: 12 },
  toggleWrapper: { flexDirection: 'row', backgroundColor: '#1e293b', marginHorizontal: 20, marginBottom: 15, borderRadius: 12, padding: 4 },
  tBtn: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  tBtnAct: { backgroundColor: '#334155' },
  tText: { color: '#64748b', fontSize: 11, fontWeight: '600' },
  tTextAct: { color: 'white' },
  dashboard: { flexDirection: 'row', backgroundColor: '#1e293b', marginHorizontal: 20, borderRadius: 20, padding: 15, marginBottom: 15 },
  statBox: { flex: 1, alignItems: 'center', gap: 4 },
  statDivider: { width: 1, height: '100%', backgroundColor: '#334155' },
  statLabel: { color: '#64748b', fontSize: 9, fontWeight: 'bold' },
  statValue: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  chartCard: { backgroundColor: '#1e293b', marginHorizontal: 20, padding: 15, borderRadius: 20, marginBottom: 20, alignItems: 'center' },
  chartTitle: { color: '#94a3b8', fontSize: 10, fontWeight: 'bold' },
  timerCard: { alignItems: 'center', backgroundColor: '#1e293b', marginHorizontal: 20, padding: 25, borderRadius: 25, marginBottom: 20 },
  input: { width: '100%', backgroundColor: '#0f172a', color: 'white', padding: 12, borderRadius: 12, textAlign: 'center' },
  
  // COLOR PICKER STYLES
  colorPicker: { flexDirection: 'row', gap: 12, marginTop: 15, marginBottom: 5 },
  colorOption: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: 'transparent' },
  colorSelected: { borderColor: 'white', transform: [{ scale: 1.2 }] },

  rateRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  rateLabel: { color: '#64748b' },
  rateInput: { color: '#22c55e', fontWeight: 'bold', marginHorizontal: 5, borderBottomWidth: 1, borderBottomColor: '#334155', minWidth: 30, textAlign: 'center' },
  timerText: { fontSize: 54, fontWeight: 'bold', marginVertical: 15, fontVariant: ['tabular-nums'] },
  controls: { flexDirection: 'row', gap: 10 },
  mainBtn: { flexDirection: 'row', paddingVertical: 12, paddingHorizontal: 30, borderRadius: 50, alignItems: 'center', gap: 10 },
  pauseBtn: { backgroundColor: '#475569', width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
  stopBtn: { backgroundColor: '#ef4444', paddingVertical: 12, paddingHorizontal: 25, borderRadius: 50, flexDirection: 'row', alignItems: 'center', gap: 8 },
  btnText: { color: 'white', fontWeight: 'bold' },
  historySection: { paddingHorizontal: 20, paddingBottom: 50 },
  hHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  hItem: { flexDirection: 'row', backgroundColor: '#1e293b', padding: 15, borderRadius: 15, marginBottom: 10, borderLeftWidth: 5 },
  hName: { color: 'white', fontWeight: 'bold' },
  hDate: { color: '#64748b', fontSize: 11 },
  hDuration: { fontWeight: 'bold', fontSize: 16 },
  hEarned: { color: '#22c55e', fontSize: 12 },
  mOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', padding: 25 },
  mContent: { backgroundColor: '#1e293b', borderRadius: 25, padding: 25, gap: 15 },
  mTitle: { color: 'white', fontSize: 20, fontWeight: 'bold', textAlign: 'center' },
  mInput: { backgroundColor: '#0f172a', color: 'white', padding: 15, borderRadius: 12 },		
  liveEarnings: { color: '#94a3b8', fontSize: 14, fontWeight: 'bold', marginBottom: 20, letterSpacing: 1 },

  projectPicker: { flexDirection: 'row', marginBottom: 15, paddingHorizontal: 5 },
projChip: { 
  paddingHorizontal: 14, 
  paddingVertical: 6, 
  borderRadius: 20, 
  borderWidth: 1, 
  borderColor: '#334155', 
  backgroundColor: 'transparent' 
},
projChipText: { color: '#94a3b8', fontSize: 12, fontWeight: 'bold' },
hBadge: { 
  paddingHorizontal: 6, 
  paddingVertical: 1, 
  borderRadius: 4, 
  borderWidth: 0.5 
},
hBadgeText: { fontSize: 9, fontWeight: 'bold', textTransform: 'uppercase' },


filterBar: {
  marginBottom: 15,
},
filterChip: {
  paddingHorizontal: 12,
  paddingVertical: 6,
  borderRadius: 8,
  backgroundColor: '#1e293b',
  borderWidth: 1,
  borderColor: '#334155',
},
filterChipActive: {
  backgroundColor: '#3b82f6',
  borderColor: '#3b82f6',
},
filterText: {
  color: '#94a3b8',
  fontSize: 12,
  fontWeight: '600',
},
filterTextActive: {
  color: 'white',
},

});
