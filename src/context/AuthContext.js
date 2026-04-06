import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getAuth } from "firebase/auth";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

    const [userToken, setUserToken] = useState(null);
    const [user, setUser] = useState(null); // 👈 NUEVO
    const [isLoading, setIsLoading] = useState(true);

    // 🔐 LOGIN
    const login = async (token) => {
        try {
            const auth = getAuth();
            const firebaseUser = auth.currentUser;

            setUserToken(token);
            await AsyncStorage.setItem('userToken', token);

            if (firebaseUser) {
                const userData = {
                    uid: firebaseUser.uid,
                    email: firebaseUser.email,
                    rol: "aprendiz"
                };

                setUser(userData);

                // 🔥 GUARDAR USUARIO TAMBIÉN
                await AsyncStorage.setItem('userData', JSON.stringify(userData));
            }

        } catch (error) {
            console.log("ERROR LOGIN:", error);
        }
    };

    // 🚪 LOGOUT
    const logout = async () => {
        setUserToken(null);
        setUser(null);

        await AsyncStorage.removeItem('userToken');
        await AsyncStorage.removeItem('userData');
    };

    // 🔄 CARGAR SESIÓN GUARDADA
    const isLoggedIn = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            const userData = await AsyncStorage.getItem('userData');

            if (token) setUserToken(token);
            if (userData) setUser(JSON.parse(userData));

        } catch (e) {
            console.log('error en persistencia:', e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        isLoggedIn();
    }, []);

    return (
        <AuthContext.Provider value={{ login, logout, userToken, user, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};