
import React, { useState, useEffect } from 'react';
import { Image, ImageProps, View, ActivityIndicator } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import { COLORS } from '../constants';

interface CachedImageProps extends ImageProps {
    uri?: string;
    placeholder?: any;
}

export const CachedImage: React.FC<CachedImageProps> = ({ uri, placeholder, style, ...props }) => {
    const [localUri, setLocalUri] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const load = async () => {
            if (!uri) {
                setLoading(false);
                return;
            }

            // Se já for local, usa direto
            if (uri.startsWith('file://')) {
                setLocalUri(uri);
                setLoading(false);
                return;
            }

            try {
                // Cria diretório de cache se não existir
                const cacheDir = (FileSystem as any).documentDirectory + 'image_cache/';
                const dirInfo = await FileSystem.getInfoAsync(cacheDir);
                if (!dirInfo.exists) {
                    await FileSystem.makeDirectoryAsync(cacheDir, { intermediates: true });
                }

                // Nome do arquivo baseado na URL (hash simples) e extensão
                const fileName = uri.split('/').pop()?.split('?')[0] || 'temp.jpg';
                const fileUri = cacheDir + fileName;

                // Verifica se já existe em cache
                const fileInfo = await FileSystem.getInfoAsync(fileUri);
                if (fileInfo.exists) {
                    if (isMounted) {
                        setLocalUri(fileUri);
                        setLoading(false);
                    }
                    return;
                }

                // Baixa se não existir ou se for remote url
                if (uri.startsWith('http')) {
                    const downloadRes = await FileSystem.downloadAsync(uri, fileUri);
                    if (isMounted && downloadRes.status === 200) {
                        setLocalUri(downloadRes.uri);
                    } else {
                        // Falha no download
                    }
                }
            } catch (e) {
                // Em caso de erro, tenta usar a URI original se possível (fallback do componente Image)
                if (isMounted) setLocalUri(uri);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        load();

        return () => { isMounted = false; };
    }, [uri]);

    if (!localUri && !placeholder) {
        return <View style={[style, { backgroundColor: '#e1e4e8' }]} />;
    }

    if (loading && !localUri && placeholder) {
        return <Image source={placeholder} style={style} {...props} />;
    }

    // Se falhou o download ou carregamento, tenta usar a URI original se disponivel ou placeholder
    const source = localUri ? { uri: localUri } : (uri ? { uri } : placeholder);

    return (
        <Image
            source={source}
            style={style}
            defaultSource={placeholder}
            {...props}
        />
    );
};
