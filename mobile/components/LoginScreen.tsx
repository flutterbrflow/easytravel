
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ImageBackground, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { IMAGES, COLORS } from '../constants';
import { StatusBar } from 'expo-status-bar';

const LoginScreen = () => {
    const navigation = useNavigation<any>();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);

    const handleAuth = async () => {
        if (!email || !password) {
            Alert.alert('Erro', 'Por favor, preencha todos os campos.');
            return;
        }

        setLoading(true);
        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (error) throw error;
                Alert.alert('Sucesso', 'Verifique seu email para confirmar o cadastro!', [
                    { text: 'OK', onPress: () => setIsSignUp(false) }
                ]);
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                // Navigation is handled by App.tsx observing session state normally, 
                // but explicit nav works too if we stack it right.
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'TripList' }],
                });
            }
        } catch (err: any) {
            Alert.alert('Erro', err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar style="light" />
            <ImageBackground source={{ uri: IMAGES.welcomeHero }} style={styles.backgroundImage}>
                <View style={styles.overlay} />
                <View style={styles.content}>
                    <View style={styles.card}>
                        <Text style={styles.title}>{isSignUp ? 'Criar Conta' : 'Bem-vindo de volta'}</Text>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Email</Text>
                            <TextInput
                                style={styles.input}
                                value={email}
                                onChangeText={setEmail}
                                placeholder="seu@email.com"
                                placeholderTextColor="#999"
                                autoCapitalize="none"
                                keyboardType="email-address"
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Senha</Text>
                            <TextInput
                                style={styles.input}
                                value={password}
                                onChangeText={setPassword}
                                placeholder="********"
                                placeholderTextColor="#999"
                                secureTextEntry
                            />
                        </View>

                        <TouchableOpacity
                            style={[styles.button, loading && styles.buttonDisabled]}
                            onPress={handleAuth}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.buttonText}>{isSignUp ? 'Cadastrar' : 'Entrar'}</Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)} style={styles.switchButton}>
                            <Text style={styles.switchText}>
                                {isSignUp ? 'Já tem uma conta? ' : 'Não tem uma conta? '}
                                <Text style={styles.switchTextBold}>{isSignUp ? 'Entrar' : 'Cadastre-se'}</Text>
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ImageBackground>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    backgroundImage: {
        flex: 1,
        resizeMode: 'cover',
        justifyContent: 'center',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        padding: 24,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 24,
        padding: 32,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#111418',
        textAlign: 'center',
        marginBottom: 24,
    },
    inputContainer: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111418',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#f6f7f8',
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 16,
        fontSize: 16,
        color: '#111418',
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    button: {
        backgroundColor: COLORS.primary,
        borderRadius: 50,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 8,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    switchButton: {
        marginTop: 16,
        alignItems: 'center',
    },
    switchText: {
        fontSize: 14,
        color: '#637588',
    },
    switchTextBold: {
        color: COLORS.primary,
        fontWeight: 'bold',
    },
});

export default LoginScreen;
