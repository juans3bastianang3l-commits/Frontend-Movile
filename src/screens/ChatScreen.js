import React, { useEffect, useState, useContext, useRef } from "react";
import { View, Text, FlatList, ActivityIndicator, StyleSheet, Button, TextInput, KeyboardAvoidingView, Platform } from "react-native";

import { AuthContext } from "../context/AuthContext";
import { getChatHistory } from "../api/apiService";

import * as Notifications from "expo-notifications";

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

const ChatScreen = ({ setScreen }) => {

    const { userToken, user } = useContext(AuthContext);

    const [mensajes, setMensajes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [nuevoMensaje, setNuevoMensaje] = useState("");

    const ws = useRef(null);
    const flatListRef = useRef();

    // =====================
    // Cargar historial
    // =====================
    const cargarChat = async () => {
        try {
            const data = await getChatHistory(userToken);
            setMensajes(data);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    // =====================
    // WebSocket
    // =====================
    useEffect(() => {
        const pedirPermisos = async () => {
            const { status } = await Notifications.requestPermissionsAsync();
            if (status !== "granted") {
                alert("Necesitas activar notificaciones");
            }
        };

        pedirPermisos();

        cargarChat();

        ws.current = new WebSocket("ws://192.168.100.225:8000/ws/chat/");

        ws.current.onmessage = (e) => {
            const data = JSON.parse(e.data);

            setMensajes((prev) => [...prev, data]);

            if (data.usuario !== (user?.uid || "anonimo")) {
                Notifications.scheduleNotificationAsync({
                    content: {
                        title: `Nuevo mensaje de ${data.usuario}`,
                        body: data.mensaje,
                    },
                    trigger: null,
                });
            }

            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
        };

        return () => ws.current.close();

    }, []);

    // =====================
    // Enviar mensaje
    // =====================
    const enviarMensaje = () => {
        if (!nuevoMensaje.trim()) return;

        ws.current.send(
            JSON.stringify({
                mensaje: nuevoMensaje,
                uid_usuario: user?.uid || "anonimo"
            })
        );

        setNuevoMensaje("");
    };

    // =====================
    // Render burbujas
    // =====================
    const renderItem = ({ item }) => {
        const esMio = item.usuario === (user?.uid || "anonimo");

        return (
            <View
                style={[
                    styles.mensajeContainer,
                    esMio ? styles.derecha : styles.izquierda
                ]}
            >
                <View
                    style={[
                        styles.burbuja,
                        esMio ? styles.burbujaMia : styles.burbujaOtro
                    ]}
                >
                    {!esMio && (
                        <Text style={styles.usuario}>{item.usuario}</Text>
                    )}
                    <Text style={styles.texto}>{item.mensaje}</Text>
                </View>
            </View>
        );
    };

    if (loading) return <ActivityIndicator size="large" />;

    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={0}>
            <View style={styles.container}>

                <Text></Text>
                <Text></Text>
                <Text></Text>

                <Text style={styles.title}>Chatea con los Demas Usuarios de la App 💬</Text>

                <FlatList
                    ref={flatListRef}
                    data={mensajes}
                    keyExtractor={(item, index) => item.id || index.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={{ paddingBottom: 10 }}
                />
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Escribe un mensaje..."
                        value={nuevoMensaje}
                        onChangeText={setNuevoMensaje}
                    />
                    <Button title="Enviar" onPress={enviarMensaje} />
                </View>
                <Button title="⬅️ Volver" onPress={() => setScreen("products")} />
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: "#232222",
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 10,
        color: "#fff",
    },
    mensajeContainer: {
        flexDirection: "row",
        marginVertical: 4,
    },
    izquierda: {
        justifyContent: "flex-start",
    },
    derecha: {
        justifyContent: "flex-end",
    },
    burbuja: {
        maxWidth: "75%",
        padding: 10,
        borderRadius: 10,
    },
    burbujaMia: {
        backgroundColor: "#DCF8C6",
    },
    burbujaOtro: {
        backgroundColor: "#fff",
    },
    texto: {
        fontSize: 16,
    },
    usuario: {
        fontSize: 12,
        fontWeight: "bold",
        marginBottom: 3,
        color: "#555",
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        marginVertical: 10,
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 20,
        paddingHorizontal: 15,
        backgroundColor: "#fff",
    },
});

export default ChatScreen;