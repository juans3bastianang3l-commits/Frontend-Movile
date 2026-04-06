import React, { useEffect, useState, useContext } from "react";
import { View, Text, FlatList, ActivityIndicator, StyleSheet, Button, Alert, TextInput } from "react-native";

import { AuthContext } from "../context/AuthContext";

import { getProducts, deleteProduct, updateProduct, createProduct } from "../api/apiService";

import { db } from "../Firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

const ListScreen = ({ setScreen }) => {
    const { userToken, user, logout } = useContext(AuthContext);

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const [newProductTitle, setNewProductTitle] = useState("");
    const [newProductDescription, setNewProductDescription] = useState("");
    const [showForm, setShowForm] = useState(false);

    const [editingProduct, setEditingProduct] = useState(null);
    const [newTitle, setNewTitle] = useState("");
    const [newDescription, setNewDescription] = useState("");

    const [rol, setRol] = useState(null);
    

    // 🔥 Cargar productos
    const loadProducts = async () => {
        try {
            console.log("TOKEN:", userToken);

            const data = await getProducts(userToken);

            console.log("RESPUESTA API:", data);

            setProducts(data.datos || []);
        } catch (error) {
            console.log("ERROR:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!newProductTitle.trim() || !newProductDescription.trim()) {
            Alert.alert("Error", "Todos los campos son obligatorios");
            return;
        }

        try {
            const data = {
                titulo: newProductTitle,
                descripcion: newProductDescription,
            };

            const response = await createProduct(data, userToken);

            // 🔥 agregar al inicio de la lista
            setProducts((prev) => [
                {
                    id: response.id,
                    ...data,
                },
                ...prev,
            ]);

            // reset
            setNewProductTitle("");
            setNewProductDescription("");
            setShowForm(false);

        } catch (error) {
            console.log("ERROR CREATE:", error);
        }
    };

    const handleDelete = (productId) => {
        Alert.alert(
            "Eliminar producto",
            "¿Seguro que quieres eliminar este producto?",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Eliminar",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deleteProduct(productId, userToken);

                            setProducts((prevProducts) =>
                                prevProducts.filter((product) => product.id !== productId)
                            );
                        } catch (error) {
                            console.log("ERROR:", error);
                        }
                    },
                },
            ]
        );
    };

    const startEditing = (product) => {
        setEditingProduct(product.id);
        setNewTitle(product.titulo);
            setNewDescription(product.descripcion);
        };

    const handleUpdate = async () => {
        try {
            const updatedData = {
                titulo: newTitle,
                descripcion: newDescription,
            };

            await updateProduct(editingProduct, updatedData, userToken);

            // 🔥 Actualizar estado local
            setProducts((prevProducts) =>
                prevProducts.map((product) =>
                    product.id === editingProduct
                        ? { ...product, ...updatedData }
                        : product
                )
            );

            // Reset
            setEditingProduct(null);
            setNewTitle("");
            setNewDescription("");

        } catch (error) {
            console.log("ERROR UPDATE:", error);
        }
    };

    const handleRequest = async (item) => {
        try {
            const data = {
                titulo: item.titulo,
                descripcion: item.descripcion,
                producto_id: item.id, // 🔥 CLAVE
            };

            await createProduct(data, userToken);

            Alert.alert("Éxito", "Solicitud enviada");

        } catch (error) {
            console.log("ERROR SOLICITUD:", error);
        }
    };

    useEffect(() => {
        const loadProfile = async () => {
            try {
                if (!user) return;

                const userRef = doc(db, "usuarios", user.uid);
                const userSnap = await getDoc(userRef);

                if (userSnap.exists()) {
                    const data = userSnap.data();

                    console.log("DATA FIREBASE:", data);
                    setRol(data.rol); // ✅ guardar rol correctamente

                } else {
                    console.log("No existe el usuario en Firestore");
                }

            } catch (error) {
                console.log("ERROR FIREBASE:", error);
            }
        };

        if (userToken) {
            loadProducts();
            loadProfile();
        }

    }, [userToken, user]);

    // ⏳ Loading
    if (loading) {
        return (
            <View style={styles.loading}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    // 📱 UI
    if (rol == 'administrador'){
        return (
            <View style={styles.container}>
                <Text></Text>
                <Text></Text>
                <Text style={styles.header}>Mis productos 😊</Text>

                <Button style={styles.button} title="🙍‍♀️ Ver Datos del Usuario 🙍‍♂️" onPress={() => setScreen("user")}/>
                <Button style={styles.button} color="green" title="➕ Añadir Producto ➕" onPress={() => setShowForm(true)}/>
                <Button color="purple" style={styles.button} title="Ver las solicitudes" onPress={() => setScreen("solicitudes")}/>
                <Button style={styles.button} title="💬 Chatea 💬" color="red" onPress={() => setScreen("chat")}/>


                {showForm && (
                    <View style={styles.card}>
                        <TextInput style={styles.input} value={newProductTitle} onChangeText={setNewProductTitle} placeholder="Título" placeholderTextColor="#888"/>
                        <TextInput style={styles.input} value={newProductDescription} onChangeText={setNewProductDescription} placeholder="Descripción" placeholderTextColor="#888"/>
                        <Button title="Crear" color="green" onPress={handleCreate} />
                        <Button title="Cancelar" onPress={() => setShowForm(false)} />
                    </View>
                )}

                <FlatList data={products} keyExtractor={(item) => item.id.toString()}

                    ListEmptyComponent={
                        <Text style={styles.empty}>No hay productos</Text>
                    }

                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            {editingProduct === item.id ? (
                                <>
                                    <TextInput style={styles.input} value={newTitle} onChangeText={setNewTitle} placeholder="Título" placeholderTextColor="#888"/>
                                    <TextInput style={styles.input} onChangeText={setNewDescription} value={newDescription} placeholder="Descripción" placeholderTextColor="#888"/>
                                    <Button style={styles.button} title="Guardar" color="green" onPress={handleUpdate}/>
                                    <Button style={styles.button} title="Cancelar" onPress={() => setEditingProduct(null)}/>
                                </>
                            ) : (
                                <>
                                    <Text style={styles.title}>{item.titulo}</Text>
                                    <Text style={styles.description}>{item.descripcion}</Text>
                                    <Button style={styles.button} title="Editar" color="green" onPress={() => startEditing(item)}/>
                                    <Button style={styles.button} title="Eliminar" color="red" onPress={() => handleDelete(item.id)}/>
                                </>
                            )}
                        </View>
                    )}
                />
            </View>
        );
    }else{
        return (
            <View style={styles.container}>
                <Text></Text>
                <Text></Text>
                <Text style={styles.header}>Productos Disponibles 😊</Text>

                <Button style={styles.button} title="🙍‍♀️ Ver Datos del Usuario 🙍‍♂️" onPress={() => setScreen("user")}/>
                <Button color="purple" style={styles.button} title="Ver Mis Solicitudes" onPress={() => setScreen("solicitudes")}/>
                <Button style={styles.button} color="red" title="💬 Chatea 💬" onPress={() => setScreen("chat")}/>

                {showForm && (
                    <View style={styles.card}>
                        <TextInput style={styles.input} value={newProductTitle} onChangeText={setNewProductTitle} placeholder="Título" placeholderTextColor="#888"/>
                        <TextInput style={styles.input} value={newProductDescription} onChangeText={setNewProductDescription} placeholder="Descripción" placeholderTextColor="#888"/>
                        <Button title="Crear" color="green" onPress={handleCreate} />
                        <Button title="Cancelar" color="red" onPress={() => setShowForm(false)} />
                    </View>
                )}

                <FlatList data={products} keyExtractor={(item) => item.id.toString()}

                    ListEmptyComponent={
                        <Text style={styles.empty}>No hay productos</Text>
                    }

                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            <Text style={styles.title}>{item.titulo}</Text>
                            <Text style={styles.description}>{item.descripcion}</Text>
                            <Button style={styles.button} title="Solicitar" color="green" onPress={() => handleRequest(item)}/>
                        </View>
                    )}
                />
            </View>
        );
    }
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#232222",
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    header: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#fff",
        textAlign: "center",
        marginBottom: 20,
        marginTop: 10,
    },
    button: {
        marginVertical: 8,
        borderRadius: 8,
    },
    card: {
        backgroundColor: "#ffffff",
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    input: {
        borderWidth: 1,
        borderColor: "#e0e0e0",
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        marginBottom: 12,
        fontSize: 16,
        color: "#2c3e50",
        backgroundColor: "#fafafa",
    },
    title: {
        fontSize: 18,
        fontWeight: "600",
        color: "#2c3e50",
        marginBottom: 8,
    },
    description: {
        fontSize: 14,
        color: "#7f8c8d",
        marginBottom: 12,
        lineHeight: 20,
    },
    empty: {
        fontSize: 16,
        color: "#95a5a6",
        textAlign: "center",
        marginTop: 80,
    },
    loading: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f5f5f5",
    },
});

export default ListScreen;