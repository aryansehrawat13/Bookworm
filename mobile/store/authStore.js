import {create} from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {API_URL} from "../constants/api";

export const useAuthStore = create((set) => ({
    user: null,
    token: null,
    isLoading: false,
    isCheckingAuth: true,

    register: async (username, email, password) => {

        set({isLoading: true});
        try {
            const response = await fetch(`${API_URL}/auth/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({username, email, password}),
            })

            const data = await response.json();

            if(!response.ok) throw new Error(data.message || "Something went wrong");

            await AsyncStorage.setItem("user", JSON.stringify(data.user));
            await AsyncStorage.setItem("token", data.token);
            set({user: data, isLoading: false, token: data.token});

            return {
                success: true
            };

        } catch (error) {
            set({isLoading: false});
            return {
                success: false,
                error: error.message
            }
        }

    },

    login: async (email, password) => {

        set({isLoading: true});
        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({email, password}),
            });

            const data = await response.json();

            if(!response.ok) throw new Error(data.message || "Something went wrong");            

            await AsyncStorage.setItem("user", JSON.stringify(data.user));
            await AsyncStorage.setItem("token", data.token);
            set({user: data, isLoading: false, token: data.token});

            return {
                success: true
            };

        } catch (error) {
            set({isLoading: false});
            return {
                success: false,
                error: error.message
            };
        }
    },


    checkAuth: async () => {
        try {

            const userJson = await AsyncStorage.getItem("user");
            const token = await AsyncStorage.getItem("token");

            const user = userJson ? JSON.parse(userJson) : null; 
            
            set({token, user});
            

        } catch(error) {
            console.log("Error checking auth", error);
        } finally {
            set({isCheckingAuth: false});
        }
    },

    logout: async () => {
        await AsyncStorage.removeItem("user");
        await AsyncStorage.removeItem("token");
        set({user: null, token: null});
    }

}));