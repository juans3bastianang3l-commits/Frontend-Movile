import React, { useState, useContext } from "react";
import { View, Text, Button, StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, TextInput, Platform } from "react-native";

import { AuthContext } from "../context/AuthContext";

// Firebase
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { app } from "../Firebase/firebaseConfig";

const auth = getAuth(app);

const LoginScreen = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const { login } = useContext(AuthContext);

    const handleLogin = async () => {
        if (!email || !password) {
            return Alert.alert("Error", "Por favor ingrese email y contraseña");
        }

        setLoading(true);

        try {
            //  Login con Firebase
            const userCredential = await signInWithEmailAndPassword(
                auth,
                email,
                password
            );

            //  Obtener token REAL de Firebase
            const token = await userCredential.user.getIdToken();

            console.log("TOKEN FIREBASE:", token);

            //  Guardar token en tu contexto
            login(token);

        } catch (error) {
            Alert.alert("Error de login", error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={0}>
            <View style={styles.container}>
                <Text style={styles.title}>ECO TECH</Text>
                <Text style={styles.title}>SISTEMA DE ADMINISTRACIÓN DE INVENTARIO DE EQUIPOS TECNOLOGICOS</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />

                <TextInput
                    style={styles.input}
                    placeholder="Contraseña"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />

                {loading ? (
                    <ActivityIndicator size="large" color="#0000ff" />
                ) : (
                    <Button title="Iniciar Sesión" onPress={handleLogin} />
                )}
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#232222",
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#fff",
        marginBottom: 10,
        textAlign: "center",
    },
    input: {
        width: "100%",
        height: 50,
        borderRadius: 10,
        backgroundColor: "#ffffff",
        paddingHorizontal: 15,
        marginBottom: 15,
        fontSize: 16,
        borderWidth: 1,
        borderColor: "#e0e0e0",
        color: "#2c3e50",
    },
    button: {
        width: "100%",
        height: 50,
        borderRadius: 10,
        backgroundColor: "#3498db",
        justifyContent: "center",
        alignItems: "center",
    },
});

export default LoginScreen;