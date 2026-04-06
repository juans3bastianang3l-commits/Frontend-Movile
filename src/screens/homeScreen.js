import React, {useContext} from "react";
import {View, Text, StyleSheet, TouchableOpacity, Image} from 'react-native';
import { AuthContext } from "../context/AuthContext";

const homeScreen = ({navegation}) => {
    const {logout} = useContext(AuthContext);

    return (
        <View>
            <View>
                <Text style={StyleSheet.welcome}>Hola, desarrollador</Text>
                <Text style={StyleSheet.sub}>Bienvenido al panel principal</Text>
            </View>
            
            <View style={style.menuGrid}>
                <TouchableOpacity style={styles.card} onPress={() => navegation.navegate('Products')}>
                    <Text style={styles.cardText}>⚜</Text>
                    <Text style={styles.cardText}>Gestionar Productos</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.card} onPress={'logout'}>
                    <Text style={styles.cardText}>🚪</Text>
                    <Text style={styles.cardText}>Cerrar Sesión</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    welcome: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1a1a1a',
        marginBottom: 8,
        marginTop: 20,
        marginHorizontal: 20,
    },
    sub: {
        fontSize: 16,
        color: '#666666',
        marginHorizontal: 20,
        marginBottom: 30,
    },
    menuGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        paddingHorizontal: 15,
        paddingVertical: 30,
    },
    card: {
        width: '45%',
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 25,
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 12,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    cardText: {
        fontSize: 24,
        fontWeight: '600',
        color: '#1a1a1a',
        marginVertical: 8,
        textAlign: 'center',
    }
})

export default homeScreen;