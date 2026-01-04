import React from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
    useColorScheme,
    Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { RootStackParamList } from '../types';
import { IMAGES, COLORS } from '../constants';

const { width } = Dimensions.get('window');

type Props = NativeStackScreenProps<RootStackParamList, 'Welcome'>;

const WelcomeScreen: React.FC<Props> = ({ navigation }) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    return (
        <View style={[styles.container, { backgroundColor: isDark ? COLORS.backgroundDark : COLORS.surfaceLight }]}>
            {/* Área de Conteúdo Principal */}
            <View style={styles.content}>
                {/* Seção Hero */}
                <View style={styles.heroContainer}>
                    <View style={styles.heroImageWrapper}>
                        <Image
                            source={IMAGES.welcomeHero}
                            style={styles.heroImage}
                            resizeMode="contain"
                        />

                    </View>
                </View>

                {/* Conteúdo de Texto */}
                <View style={styles.textContent}>
                    <Text style={[styles.title, { color: isDark ? COLORS.textLight : COLORS.textDark }]}>
                        Explore o Mundo{'\n'}sem Estresse
                    </Text>
                    <Text style={[styles.description, { color: isDark ? COLORS.textGrayDark : COLORS.textGray }]}>
                        Organize roteiros, controle gastos e guarde memórias incríveis em um só lugar.
                    </Text>

                    {/* Ícones de Funcionalidades */}
                    <View style={styles.features}>
                        <FeatureIcon icon="map" label="Roteiros" isDark={isDark} />
                        <FeatureIcon icon="cash" label="Gastos" isDark={isDark} />
                        <FeatureIcon icon="image-multiple" label="Memórias" isDark={isDark} />
                    </View>
                </View>
            </View>

            {/* Ações de Rodapé */}
            <View style={[styles.footer, { backgroundColor: isDark ? COLORS.backgroundDark : COLORS.surfaceLight }]}>
                {/* Indicadores */}
                <View style={styles.indicators}>
                    <View style={[styles.indicator, styles.indicatorActive]} />
                    <View style={[styles.indicator, { backgroundColor: isDark ? '#3e4a56' : '#dbe0e6' }]} />
                    <View style={[styles.indicator, { backgroundColor: isDark ? '#3e4a56' : '#dbe0e6' }]} />
                </View>

                {/* Botão de Ação */}
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => navigation.navigate('Login')}
                    activeOpacity={0.8}
                >
                    <Text style={styles.buttonText}>Começar Agora</Text>
                    <MaterialCommunityIcons name="arrow-right" size={20} color="#ffffff" />
                </TouchableOpacity>

                {/* Link de Login */}
                {/* Link de Login Removido */}
                <View style={styles.loginContainer}>
                </View>
            </View>
        </View>
    );
};

const FeatureIcon: React.FC<{ icon: string; label: string; isDark: boolean }> = ({ icon, label, isDark }) => (
    <View style={styles.featureItem}>
        <MaterialCommunityIcons name={icon as any} size={24} color={COLORS.primary} />
        <Text style={[styles.featureLabel, { color: isDark ? COLORS.textLight : COLORS.textDark }]}>
            {label}
        </Text>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
    },
    heroContainer: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 8,
    },
    heroImageWrapper: {
        width: '100%',
        aspectRatio: 3 / 4,
        // Elevação e sombra removidas para misturar com o fundo
        alignItems: 'center',
        justifyContent: 'center',
    },
    heroImage: {
        width: '100%',
        height: '100%',
    },
    gradient: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
    },
    textContent: {
        paddingHorizontal: 24,
        paddingTop: 24,
        alignItems: 'center',
    },
    title: {
        fontSize: 30,
        fontWeight: '800',
        textAlign: 'center',
        lineHeight: 38,
        marginBottom: 12,
    },
    description: {
        fontSize: 16,
        textAlign: 'center',
        maxWidth: 300,
        lineHeight: 24,
    },
    features: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 24,
        marginTop: 24,
        opacity: 0.8,
    },
    featureItem: {
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
    },
    featureLabel: {
        fontSize: 12,
        fontWeight: '500',
    },
    footer: {
        paddingHorizontal: 16,
        paddingTop: 24,
        paddingBottom: 32,
    },
    indicators: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        marginBottom: 24,
    },
    indicator: {
        height: 8,
        width: 8,
        borderRadius: 4,
    },
    indicatorActive: {
        width: 24,
        backgroundColor: COLORS.primary,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.primary,
        height: 56,
        borderRadius: 12,
        paddingHorizontal: 20,
        marginBottom: 16,
        elevation: 8,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
        marginRight: 8,
    },
    loginContainer: {
        alignItems: 'center',
    },
    loginText: {
        fontSize: 14,
        fontWeight: '500',
    },
    loginLink: {
        color: COLORS.primary,
        fontWeight: 'bold',
    },
});

export default WelcomeScreen;
