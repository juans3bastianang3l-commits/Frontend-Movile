import React, { useContext, useState, useEffect } from "react";
import { View, Text, StyleSheet, Button, Image } from "react-native";
import { AuthContext } from "../context/AuthContext";
import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../Firebase/firebaseConfig";
import * as ImagePicker from "expo-image-picker";
import { uploadProfilePhoto } from "../api/apiService";


const UserDataScreen = ({ setScreen }) => {
    const { user, logout, userToken } = useContext(AuthContext);
    const [foto, setFoto] = useState(null);
    const [rol, setRol] = useState(null);

    const pickImageAndUpload = async () => {
        try {
            // Pedir permisos
            const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (!permission.granted) {
                alert("Se necesitan permisos para acceder a la galería");
                return;
            }

            // Abrir galería
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 1,
            });

            if (result.canceled) return;

            const imageUri = result.assets[0].uri;

            console.log("IMAGEN SELECCIONADA:", imageUri);

            // Subir imagen
            const response = await uploadProfilePhoto(imageUri, userToken);

            console.log("RESPUESTA BACKEND:", response);

            // Actualizar foto en pantalla
            setFoto(response.url);

            alert("Foto actualizada correctamente ✅");

        } catch (error) {
            console.log("ERROR SUBIENDO FOTO:", error);
            alert("Error al subir la foto ❌");
        }
    };

    const obtenerTareas = async () => {
        try {
            let url = "http://192.168.100.225:8000/api/tareas/";

            // 👇 SI ES EMPLEADO → filtrar por usuario
            if (rol !== "administrador") {
                url += `?usuario_id=${user.uid}`;
            }

            const response = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${userToken}`,
                },
            });

            const data = await response.json();
            setTareas(data);

        } catch (error) {
            console.log("ERROR TAREAS:", error);
        }
    };

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const userRef = doc(db, "usuarios", user.uid);
                const userSnap = await getDoc(userRef);

                if (userSnap.exists()) {
                    const data = userSnap.data();

                    console.log("DATA FIREBASE:", data);

                    setFoto(data.foto_url?.replace(".webp", ".jpg"));
                    setRol(data.rol); // 👈 AQUÍ GUARDAS EL ROL

                } else {
                    console.log("No existe el usuario en Firestore");
                }

            } catch (error) {
                console.log("ERROR FIREBASE:", error);
            }
        };

        if (user?.uid) {
            loadProfile();
        }
    }, [user]);

    const handleLogout = async () => {
        try {
            await signOut(auth); // Firebase
            logout(); // Contexto
        } catch (error) {
            console.log("ERROR LOGOUT:", error);
        }
    };

    console.log("USER EN PANTALLA:", user);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Datos del Usuario</Text>
            {foto ? (
                <Image source={{ uri: foto }} style={styles.avatar} />
            ) : (
                <Text style={{ color: "#000" }}>Cargando imagen...</Text>
            )}
            <Text style={styles.text}>UID: {user?.uid}</Text>
            <Text style={styles.text}>Email: {user?.email}</Text>
            <Text style={styles.text}>Rol: {rol}</Text>
            <Button title="Volver" onPress={() => setScreen("products")} />
            <Button title="Cerrar Sesión" color="red" onPress={handleLogout} />
            <Button title="Cambiar Foto de Perfil" color="purple" onPress={pickImageAndUpload}/>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#232222",
        padding: 20,
        justifyContent: "center",
        alignItems: "center",
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#fff",
        marginBottom: 30,
        textAlign: "center",
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        marginBottom: 30,
        backgroundColor: "#e0e0e0",
        borderWidth: 3,
        borderColor: "#6200ee",
    },
    text: {
        fontSize: 16,
        color: "#fff",
        marginBottom: 12,
        textAlign: "center",
        fontWeight: "500",
    },
    buttonContainer: {
        marginTop: 20,
        width: "100%",
        gap: 12,
    }
});

export default UserDataScreen;