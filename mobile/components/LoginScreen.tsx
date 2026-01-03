
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { IMAGES, COLORS } from '../constants';
import { StatusBar } from 'expo-status-bar';

const LoginScreen = () => {
    const navigation = useNavigation<any>();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);

    const handleAuth = async () => {
        if (!email || !password) {
            Alert.alert('Erro', 'Por favor, preencha todos os campos.');
            return;
        }

        if (isSignUp && !name.trim()) {
            Alert.alert('Erro', 'Por favor, informe seu nome.');
            return;
        }

        setLoading(true);
        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: name,
                            display_name: name
                        }
                    }
                });
                if (error) {
                    if (error.message.includes('User already registered')) {
                        throw new Error('Usuário já cadastrado.');
                    }
                    throw error;
                }
                Alert.alert('Sucesso', 'Verifique seu email para confirmar o cadastro!', [
                    { text: 'OK', onPress: () => setIsSignUp(false) }
                ]);
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) {
                    if (error.message.includes('Invalid login credentials')) {
                        throw new Error('Email ou senha inválidos.');
                    }
                    throw error;
                }
                // Navigation is handled automatically by App.tsx based on session state
            }
        } catch (err: any) {
            Alert.alert('Erro', err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />
            <View style={styles.imageContainer}>
                <Image
                    source={IMAGES.loginBackground}
                    style={styles.heroImage}
                    resizeMode="contain"
                />
            </View>
            <View style={styles.content}>
                <View style={styles.card}>
                    <Text style={styles.title}>{isSignUp ? 'Criar Conta' : 'Bem-vindo de volta'}</Text>

                    {isSignUp && (
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Nome</Text>
                            <TextInput
                                style={styles.input}
                                value={name}
                                onChangeText={setName}
                                placeholder="Seu nome"
                                placeholderTextColor="#999"
                                autoCapitalize="words"
                            />
                        </View>
                    )}

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
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    imageContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '55%', // Occupy top half roughly
        alignItems: 'center',
        justifyContent: 'flex-start', // Align start so padding top can be added if needed
        paddingTop: 40,
    },
    heroImage: {
        width: '100%',
        height: '100%',
    },
    content: {
        flex: 1,
        justifyContent: 'flex-end',
        padding: 24,
        paddingBottom: 48,
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
