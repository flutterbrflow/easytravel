# Guia de Conversão: React Web → React Native

## Visão Geral

Este documento detalha o processo de conversão do EasyTravel de React Web para React Native usando Expo.

---

## Diferenças Fundamentais

### React Web vs React Native

| Aspecto | React Web | React Native |
|---------|-----------|--------------|
| **Elementos** | `<div>`, `<span>`, `<button>` | `<View>`, `<Text>`, `<TouchableOpacity>` |
| **Estilização** | CSS, Tailwind Classes | StyleSheet API, Inline Styles |
| **Navegação** | React Router DOM | React Navigation |
| **Eventos** | `onClick`, `onChange` | `onPress`, `onChangeText` |
| **Imagens** | `<img src>` | `<Image source>` |
| **Scroll** | Nativo do browser | `<ScrollView>`, `<FlatList>` |
| **Input** | `<input>`, `<textarea>` | `<TextInput>` |
| **Icons** | Material Symbols (web) | @expo/vector-icons |

---

## Stack Tecnológico React Native

### Core
- **React Native** - Framework mobile
- **Expo** - Toolchain e SDK
- **TypeScript** - Type safety
- **React Navigation** - Navegação

### UI/UX
- **React Native Paper** (opcional) - Components Material Design
- **@expo/vector-icons** - Ícones
- **react-native-safe-area-context** - Safe areas
- **react-native-screens** - Performance de navegação

### Dev Tools
- **Expo Go** - App para testar
- **EAS** - Build e deploy
- **Metro** - Bundler

---

## Mapeamento de Componentes

### Elementos Básicos

#### Containers
```typescript
// Web
<div className="container">...</div>

// React Native
<View style={styles.container}>...</View>
```

#### Texto
```typescript
// Web
<h1>Título</h1>
<p>Parágrafo</p>

// React Native
<Text style={styles.title}>Título</Text>
<Text style={styles.paragraph}>Parágrafo</Text>
```

#### Botões
```typescript
// Web
<button onClick={handleClick}>Click</button>

// React Native
<TouchableOpacity onPress={handleClick}>
  <Text>Click</Text>
</TouchableOpacity>

// Ou usar Button nativo
<Button title="Click" onPress={handleClick} />
```

#### Imagens
```typescript
// Web
<img src={url} alt="description" />

// React Native
<Image source={{ uri: url }} style={styles.image} />
// ou para imagens locais
<Image source={require('./path/to/image.png')} />
```

#### Input
```typescript
// Web
<input 
  type="text"
  value={value}
  onChange={(e) => setValue(e.target.value)}
  placeholder="Digite..."
/>

// React Native
<TextInput
  value={value}
  onChangeText={setValue}
  placeholder="Digite..."
  style={styles.input}
/>
```

#### Scrollable
```typescript
// Web
<div className="overflow-y-auto">...</div>

// React Native
<ScrollView>...</ScrollView>

// Para listas longas, use FlatList
<FlatList
  data={items}
  renderItem={({ item }) => <ItemComponent item={item} />}
  keyExtractor={item => item.id}
/>
```

---

## Estilização

### Substituindo Tailwind CSS

#### Classes Comuns

```typescript
// Web (Tailwind)
className="flex items-center justify-between p-4 bg-white"

// React Native (StyleSheet)
<View style={styles.container} />

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#ffffff',
  },
});
```

#### Mapeamento de Propriedades

| Tailwind | React Native |
|----------|--------------|
| `flex` | `display: 'flex'` (default) |
| `flex-row` | `flexDirection: 'row'` |
| `flex-col` | `flexDirection: 'column'` |
| `items-center` | `alignItems: 'center'` |
| `justify-between` | `justifyContent: 'space-between'` |
| `p-4` | `padding: 16` |
| `px-4` | `paddingHorizontal: 16` |
| `py-4` | `paddingVertical: 16` |
| `m-4` | `margin: 16` |
| `w-full` | `width: '100%'` |
| `h-screen` | `height: '100%'` (ou Dimensions) |
| `rounded-xl` | `borderRadius: 12` |
| `bg-blue-500` | `backgroundColor: '#3b82f6'` |
| `text-white` | `color: '#ffffff'` |
| `font-bold` | `fontWeight: 'bold'` |
| `text-lg` | `fontSize: 18` |
| `shadow-lg` | elevation ou shadowColor/shadowOffset |

#### Unidades

```typescript
// Web usa px, rem, %, vh, vw
// React Native usa apenas números (pixels)

padding: 16  // 16 pixels
width: '100%' // Porcentagem
height: Dimensions.get('window').height // Tamanho da tela
```

#### Dark Mode

```typescript
// Web (Tailwind)
className="bg-white dark:bg-gray-900"

// React Native
import { useColorScheme } from 'react-native';

const colorScheme = useColorScheme();
const isDark = colorScheme === 'dark';

<View style={{
  backgroundColor: isDark ? '#111827' : '#ffffff'
}} />

// Ou criar tema
const theme = {
  light: { background: '#ffffff', text: '#000000' },
  dark: { background: '#111827', text: '#ffffff' },
};

<View style={{ 
  backgroundColor: theme[colorScheme].background 
}} />
```

---

## Navegação

### React Router → React Navigation

#### Instalação
```bash
npm install @react-navigation/native
npm install @react-navigation/native-stack
expo install react-native-screens react-native-safe-area-context
```

#### Setup

```typescript
// Web (React Router)
import { HashRouter, Routes, Route } from 'react-router-dom';

<HashRouter>
  <Routes>
    <Route path="/" element={<WelcomeScreen />} />
    <Route path="/list" element={<TripListScreen />} />
  </Routes>
</HashRouter>

// React Native (React Navigation)
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

<NavigationContainer>
  <Stack.Navigator>
    <Stack.Screen name="Welcome" component={WelcomeScreen} />
    <Stack.Screen name="TripList" component={TripListScreen} />
  </Stack.Navigator>
</NavigationContainer>
```

#### Navegação

```typescript
// Web
import { useNavigate } from 'react-router-dom';
const navigate = useNavigate();
navigate('/list');
navigate(-1);

// React Native
import { useNavigation } from '@react-navigation/native';
const navigation = useNavigation();
navigation.navigate('TripList');
navigation.goBack();
```

#### Bottom Tabs

```typescript
// Instalar
npm install @react-navigation/bottom-tabs

// Uso
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

const Tab = createBottomTabNavigator();

<Tab.Navigator>
  <Tab.Screen 
    name="Viagens" 
    component={TripListScreen}
    options={{
      tabBarIcon: ({ color }) => <Icon name="airplane" color={color} />
    }}
  />
  <Tab.Screen name="Explorar" component={ExploreScreen} />
  <Tab.Screen name="Perfil" component={ProfileScreen} />
</Tab.Navigator>
```

---

## Componente por Componente

### App.tsx

**Antes (Web):**
```typescript
import { HashRouter, Routes, Route } from 'react-router-dom';

const App = () => (
  <HashRouter>
    <div className="container">
      <Routes>
        <Route path="/" element={<WelcomeScreen />} />
      </Routes>
    </div>
  </HashRouter>
);
```

**Depois (React Native):**
```typescript
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

const App = () => (
  <NavigationContainer>
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="TripList" component={TripListScreen} />
      <Stack.Screen name="NewTrip" component={NewTripScreen} />
    </Stack.Navigator>
  </NavigationContainer>
);
```

### WelcomeScreen

**Mudanças principais:**
- `div` → `View`
- `button` → `TouchableOpacity` ou `Pressable`
- Classes CSS → StyleSheet
- `useNavigate` → `useNavigation`
- Gradient overlay → `LinearGradient` do Expo

**Exemplo:**
```typescript
// Web
<button onClick={() => navigate('/list')} className="btn-primary">
  <span>Começar Agora</span>
</button>

// React Native
<TouchableOpacity 
  style={styles.button}
  onPress={() => navigation.navigate('TripList')}
>
  <Text style={styles.buttonText}>Começar Agora</Text>
</TouchableOpacity>
```

### TripListScreen

**Mudanças principais:**
- Lista de trips: usar `FlatList` ao invés de `.map()`
- Segmented control: criar componente custom
- FAB: usar `TouchableOpacity` com `position: 'absolute'`
- Bottom tabs: usar `@react-navigation/bottom-tabs`

**Exemplo:**
```typescript
// Web
{MOCK_TRIPS.map(trip => (
  <TripCard key={trip.id} trip={trip} />
))}

// React Native
<FlatList
  data={MOCK_TRIPS}
  renderItem={({ item }) => <TripCard trip={item} />}
  keyExtractor={item => item.id}
  contentContainerStyle={styles.list}
/>
```

### NewTripScreen

**Mudanças principais:**
- `input` → `TextInput`
- `textarea` → `TextInput multiline`
- Calendário: usar library como `react-native-calendars`
- Scroll: envolver em `ScrollView`
- Avatares: usar `Image` com `borderRadius`

---

## Ícones

### Material Symbols → Expo Vector Icons

```bash
# Já incluído no Expo
```

**Uso:**
```typescript
// Web
<span className="material-symbols-outlined">airplane_ticket</span>

// React Native
import { MaterialCommunityIcons } from '@expo/vector-icons';

<MaterialCommunityIcons name="airplane-takeoff" size={24} color="black" />
```

**Mapeamento de ícones:**
| Web (Material Symbols) | React Native (Expo) |
|------------------------|---------------------|
| `airplane_ticket` | `airplane-takeoff` |
| `map` | `map` |
| `payments` | `cash` |
| `photo_library` | `image-multiple` |
| `settings` | `cog` |
| `person` | `account` |
| `add` | `plus` |

---

## Imagens e Assets

### Estrutura
```
assets/
├── images/
│   ├── welcome-hero.jpg
│   ├── paris.jpg
│   └── ...
├── icon.png
└── splash.png
```

### Uso

```typescript
// Imagens locais
<Image 
  source={require('../assets/images/welcome-hero.jpg')}
  style={styles.heroImage}
/>

// Imagens remotas
<Image
  source={{ uri: 'https://example.com/image.jpg' }}
  style={styles.image}
/>
```

---

## Fontes Customizadas

### Google Fonts no Expo

```bash
expo install expo-font
```

```typescript
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded] = useFonts({
    'PlusJakartaSans-Regular': require('./assets/fonts/PlusJakartaSans-Regular.ttf'),
    'PlusJakartaSans-Bold': require('./assets/fonts/PlusJakartaSans-Bold.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return <AppContent />;
}

// Uso
<Text style={{ fontFamily: 'PlusJakartaSans-Bold' }}>Texto</Text>
```

---

## TypeScript Types

### Navegação

```typescript
// types.ts
export type RootStackParamList = {
  Welcome: undefined;
  TripList: undefined;
  NewTrip: { tripId?: string };
  TripDetail: { tripId: string };
};

// Em componentes
import { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<RootStackParamList, 'NewTrip'>;

const NewTripScreen = ({ navigation, route }: Props) => {
  const tripId = route.params?.tripId;
  // ...
};
```

---

## Setup do Projeto Expo

### 1. Criar Projeto
```bash
npx create-expo-app@latest easytravel-native --template blank-typescript
cd easytravel-native
```

### 2. Instalar Dependências
```bash
# Navegação
npm install @react-navigation/native
npm install @react-navigation/native-stack
npm install @react-navigation/bottom-tabs
expo install react-native-screens react-native-safe-area-context

# UI
expo install expo-linear-gradient
expo install expo-font

# Ícones (já incluídos)
# @expo/vector-icons
```

### 3. Estrutura de Pastas
```
easytravel-native/
├── app/
│   └── (tabs)/
├── components/
│   ├── WelcomeScreen.tsx
│   ├── TripListScreen.tsx
│   └── NewTripScreen.tsx
├── constants/
│   ├── Colors.ts
│   └── Mockdata.ts
├── types/
│   └── index.ts
├── assets/
│   ├── images/
│   └── fonts/
├── App.tsx
└── package.json
```

### 4. Executar
```bash
# Desenvolvimento
npm start

# iOS Simulator
npm run ios

# Android Emulator  
npm run android

# Expo Go (physical device)
# Scan QR code com app Expo Go
```

---

## Checklist de Conversão

### Preparação
- [ ] Criar projeto Expo
- [ ] Instalar dependências
- [ ] Configurar TypeScript
- [ ] Setup navegação

### Componentes
- [ ] Converter App.tsx
- [ ] Converter WelcomeScreen
- [ ] Converter TripListScreen
- [ ] Converter NewTripScreen
- [ ] Criar sub-componentes

### Recursos
- [ ] Configurar ícones
- [ ] Adicionar imagens aos assets
- [ ] Configurar fontes
- [ ] Implementar dark mode

### Funcionalidades
- [ ] Navegação entre telas
- [ ] Estado local (useState)
- [ ] Formulários
- [ ] Listas e FlatLists
- [ ] Gestos e interações

### Polimento
- [ ] Safe Area insets
- [ ] Keyboard avoiding
- [ ] Loading states
- [ ] Error handling
- [ ] Animações (optional)

### Testes
- [ ] Testar em iOS
- [ ] Testar em Android  
- [ ] Testar dark mode
- [ ] Testar diferentes tamanhos de tela

---

## Desafios Comuns e Soluções

### 1. Flexbox Diferenças
**Problema:** Flexbox funciona diferente  
**Solução:** `flexDirection: 'column'` é default (não 'row')

### 2. Overflow
**Problema:** Overflow não funciona como web  
**Solução:** Usar `ScrollView` ou `FlatList`

### 3. Fonts
**Problema:** Fontes não carregam  
**Solução:** Usar `expo-font` e aguardar carregamento

### 4. Images não aparecem
**Problema:** Dimensões obrigatórias  
**Solução:** Sempre definir width/height em styles

### 5. Keyboard Cover Input
**Problema:** Teclado cobre campos  
**Solução:** Usar `KeyboardAvoidingView`

```typescript
<KeyboardAvoidingView
  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
  style={{ flex: 1 }}
>
  <TextInput />
</KeyboardAvoidingView>
```

---

## Recursos e Ferramentas

### Documentação
- [React Native](https://reactnative.dev/)
- [Expo](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/)

### UI Libraries
- [React Native Paper](https://callstack.github.io/react-native-paper/)
- [NativeBase](https://nativebase.io/)
- [React Native Elements](https://reactnativeelements.com/)

### Ferramentas
- [Expo Snack](https://snack.expo.dev/) - Playground online
- [Reactotron](https://github.com/infinitered/reactotron) - Debugging
- [Flipper](https://fbflipper.com/) - Debug tool

---

## Próximos Passos Após Conversão

1. **Backend Integration**
   - Supabase/Firebase
   - AsyncStorage para cache local

2. **Features Nativas**
   - Camera (expo-camera)
   - Image Picker (expo-image-picker)
   - Location (expo-location)
   - Notifications (expo-notifications)

3. **Otimizações**
   - Memoização (React.memo, useMemo)
   - Lazy loading
   - Image optimization

4. **Build e Deploy**
   - EAS Build
   - App Store / Play Store
   - Over-the-air updates

---

**Boa sorte com a conversão! 🚀**
