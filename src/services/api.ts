import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { apiConfig } from '../config';

// Simple Event Emitter implementation for React Native
class SimpleEventEmitter {
  private listeners: { [key: string]: Function[] } = {};

  on(event: string, callback: Function) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  off(event: string, callback: Function) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
  }

  emit(event: string, ...args: any[]) {
    if (!this.listeners[event]) return;
    this.listeners[event].forEach(cb => cb(...args));
  }
}

// Event emitter for auth events
export const authEvents = new SimpleEventEmitter();

const EXPO_PUBLIC_API_GATEWAY_URL = apiConfig.baseUrl || 'http://localhost:8080/api';

export const api = axios.create({
  baseURL: EXPO_PUBLIC_API_GATEWAY_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Inject token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error("Error getting token for interceptor:", error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Handle 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      console.warn("Authentication error (401/403) detected. Triggering logout...");
      
      // Emit logout event
      authEvents.emit('logout');
      
      // Optionally clear token immediately here too, but AuthContext should handle the full cleanup
      await SecureStore.deleteItemAsync('accessToken');
    }
    return Promise.reject(error);
  }
);
