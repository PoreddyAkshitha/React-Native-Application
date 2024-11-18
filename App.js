import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, TextInput, View, FlatList, TouchableOpacity, Image, Animated } from 'react-native';
import checkedImage from './assets/image/complete.jpeg';
import pencilImage from './assets/image/edit.jpeg';
import trashImage from './assets/image/deleted.jpeg';
import saveImage from './assets/image/change.jpeg';

export default function App() {
  const [newTask, setNewTask] = useState('');
  const [taskList, setTaskList] = useState([]);
  const [taskBeingEdited, setTaskBeingEdited] = useState(null);
  const [editText, setEditText] = useState('');
  const slideAnimation = useRef(new Animated.Value(0)).current; // Animation for task deletion

  const addNewTask = () => {
    if (newTask.trim()) {
      const task = { id: Date.now().toString(), text: newTask, completed: false };
      setTaskList([...taskList, task]);
      setNewTask('');
      triggerTaskAnimation();
    }
  };

  const removeTask = (taskId) => {
    Animated.timing(slideAnimation, {
      toValue: -300, // Slide left
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setTaskList(taskList.filter((item) => item.id !== taskId));
      slideAnimation.setValue(0); // Reset the animation value for future tasks
    });
  };

  const toggleCompletionStatus = (taskId) => {
    setTaskList(taskList.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t));
  };

  const startEditTask = (taskId) => {
    const taskToEdit = taskList.find(t => t.id === taskId);
    setTaskBeingEdited(taskId);
    setEditText(taskToEdit.text);
  };

  const saveEditedTask = () => {
    setTaskList(taskList.map(t =>
      t.id === taskBeingEdited ? { ...t, text: editText } : t
    ));
    setTaskBeingEdited(null);
    setEditText('');
  };

  const scaleAnimation = useRef(new Animated.Value(0)).current;

  const triggerTaskAnimation = () => {
    Animated.sequence([
      Animated.timing(scaleAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const animatedStyle = {
    transform: [
      {
        scale: scaleAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.1],
        }),
      },
    ],
  };

  useEffect(() => {
    (async () => {
      const storedTasks = await AsyncStorage.getItem('tasks');
      if (storedTasks) {
        setTaskList(JSON.parse(storedTasks));
      }
    })();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem('tasks', JSON.stringify(taskList));
  }, [taskList]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Simple To-Do List</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Add a new task"
          value={newTask}
          onChangeText={(text) => setNewTask(text)}
        />
        <TouchableOpacity style={styles.addButton} onPress={addNewTask}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={taskList}
        renderItem={({ item }) => (
          <Animated.View style={[styles.taskContainer, animatedStyle, { transform: [{ translateX: slideAnimation }] }]}>
            <View style={styles.taskDetails}>
              <View style={styles.taskTextContainer}>
                <Text style={[styles.taskText, item.completed && styles.completedTask]}>
                  {item.text}
                </Text>

                <TouchableOpacity onPress={() => toggleCompletionStatus(item.id)} style={styles.iconContainer}>
                  <View style={styles.iconWithLabel}>
                    <View style={styles.checkboxContainer}>
                      <Image
                        source={item.completed ? checkedImage : checkedImage}
                        style={styles.actionIcon}
                      />
                      <Text style={styles.checkboxLabel}>{item.completed ? 'Completed' : 'Incomplete'}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.actions}>
              <TouchableOpacity onPress={() => startEditTask(item.id)} style={styles.iconContainer}>
                <View style={styles.iconWithLabel}>
                  <Image source={pencilImage} style={styles.actionIcon} />
                  <Text style={styles.iconLabel}>Edit</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => removeTask(item.id)} style={styles.iconContainer}>
                <View style={styles.iconWithLabel}>
                  <Image source={trashImage} style={styles.actionIcon} />
                  <Text style={styles.iconLabel}>Delete</Text>
                </View>
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}
        keyExtractor={(item) => item.id}
      />

      <View style={styles.edit}>
        {taskBeingEdited && (
          <View style={styles.editContainer}>
            <TextInput
              style={styles.input}
              value={editText}
              onChangeText={setEditText}
            />
            <TouchableOpacity style={styles.editButton} onPress={saveEditedTask}>
              <Image source={saveImage} style={styles.actionIcon} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f8ff', // Changed background color to AliceBlue
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  addButton: {
    backgroundColor: '#5C5CFF',
    height: 40,
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    marginLeft: 10,
  },
  addButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  taskContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  taskDetails: {
    flex: 1,
  },
  taskTextContainer: {
    flexDirection: 'row',
  },
  taskText: {
    fontSize: 16,
    color: '#333',
  },
  completedTask: {
    textDecorationLine: 'line-through',
    color: '#888',
  },
  iconContainer: {
    marginLeft: 10,
    alignItems: 'center',
  },
  iconWithLabel: {
    alignItems: 'center',
  },
  actionIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  iconLabel: {
    fontSize: 10,
    color: '#555',
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editContainer: {
    flexDirection: 'row',
    marginTop: 20,
    alignItems: 'center',
  },
  edit: {
    marginBottom: 40,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxLabel: {
    marginLeft: 5,
    fontSize: 12,
    color: '#555',
  },
  editButton: {
    backgroundColor: 'lightgrey',
    height: 40,
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    marginLeft: 10,
  },
});
