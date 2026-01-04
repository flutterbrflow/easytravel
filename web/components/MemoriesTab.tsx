import React, { useState, useRef, useEffect } from 'react';
import { api, MemoryRow, MemoryInsert } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface MemoriesTabProps {
    tripId: string;
    memories: MemoryRow[];
    onRefresh: () => void;
}

const MemoriesTab: React.FC<MemoriesTabProps> = ({ tripId, memories, onRefresh }) => {
    const { user } = useAuth();
    const [uploading, setUploading] = useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files || event.target.files.length === 0 || !user) return;

        setUploading(true);
        const files = Array.from(event.target.files);

        try {
            await Promise.all(files.map(async (file: File) => {
                const imageUrl = await api.memories.uploadImage(file, user.id);

                await api.memories.create({
                    trip_id: tripId,
                    user_id: user.id,
                    image_url: imageUrl,
                    caption: '', // Opcional: Adicionar um diálogo para definir legenda depois
                    taken_at: new Date().toISOString(),
                });
            }));

            onRefresh();
        } catch (error) {
            alert('Erro ao enviar fotos. Tente novamente.');
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleDelete = async (id: string, event?: React.MouseEvent) => {
        event?.stopPropagation(); // Previne abrir o lightbox ao excluir
        if (!confirm('Tem certeza que deseja excluir esta foto?')) return;

        try {
            await api.memories.delete(id);
            if (selectedImageIndex !== null) setSelectedImageIndex(null); // Fecha o lightbox se estiver aberto
            onRefresh();
        } catch (error) {
            alert('Erro ao excluir memória.');
        }
    };

    // Controles do Lightbox
    const handlePrev = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (selectedImageIndex !== null) {
            setSelectedImageIndex((prev) => (prev! > 0 ? prev! - 1 : memories.length - 1));
        }
    };

    const handleNext = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (selectedImageIndex !== null) {
            setSelectedImageIndex((prev) => (prev! < memories.length - 1 ? prev! + 1 : 0));
        }
    };

    const handleClose = () => setSelectedImageIndex(null);

    // Navegação por Teclado
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (selectedImageIndex === null) return;
            if (e.key === 'Escape') handleClose();
            if (e.key === 'ArrowLeft') handlePrev();
            if (e.key === 'ArrowRight') handleNext();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedImageIndex, memories.length]);

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="relative h-full flex flex-col">
            <div className="flex-1 overflow-y-auto pb-24 custom-scrollbar">
                {memories.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-[#1e2a36] rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                        <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h4 className="text-lg font-medium text-gray-900 dark:text-white">Nenhuma foto ainda</h4>
                        <p className="text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
                            Comece a adicionar fotos para criar sua galeria de memórias desta viagem.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {memories.map((memory, index) => (
                            <div
                                key={memory.id}
                                className="group relative aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 cursor-pointer"
                                onClick={() => setSelectedImageIndex(index)}
                            >
                                <img
                                    src={memory.image_url}
                                    alt={memory.caption || 'Memória'}
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
                                    <div className="absolute top-2 right-2">
                                        <button
                                            onClick={(e) => handleDelete(memory.id, e)}
                                            className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-sm"
                                            title="Excluir"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                    {memory.caption && (
                                        <p className="text-white text-center text-sm font-medium line-clamp-3">
                                            {memory.caption}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Overlay do Lightbox */}
            {selectedImageIndex !== null && memories[selectedImageIndex] && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm"
                    onClick={handleClose}
                >
                    {/* Botão Fechar */}
                    <button
                        onClick={handleClose}
                        className="absolute top-4 right-4 p-3 text-white/70 hover:text-white rounded-full hover:bg-white/10 transition-colors z-50"
                    >
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    {/* Botões de Navegação */}
                    <button
                        onClick={handlePrev}
                        className="absolute left-4 p-3 text-white/70 hover:text-white rounded-full hover:bg-white/10 transition-colors z-50 hidden md:block"
                    >
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>

                    <button
                        onClick={handleNext}
                        className="absolute right-4 p-3 text-white/70 hover:text-white rounded-full hover:bg-white/10 transition-colors z-50 hidden md:block"
                    >
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>

                    {/* Imagem Principal */}
                    <div
                        className="relative max-w-[90vw] max-h-[90vh] flex flex-col items-center"
                        onClick={(e) => e.stopPropagation()} // Previne fechar ao clicar na imagem
                    >
                        <img
                            src={memories[selectedImageIndex].image_url}
                            alt={memories[selectedImageIndex].caption || 'Visualização completa'}
                            className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
                        />

                        {/* Barra de Informações da Imagem */}
                        <div className="mt-4 text-center text-white">
                            {memories[selectedImageIndex].caption && (
                                <p className="text-lg font-medium mb-1">{memories[selectedImageIndex].caption}</p>
                            )}
                            <p className="text-sm text-gray-400">
                                {formatDate(memories[selectedImageIndex].taken_at)}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* FAB para Upload */}
            <div className="absolute bottom-6 right-4 z-20">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    multiple
                    accept="image/*"
                    className="hidden"
                />
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/30 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {uploading ? (
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    ) : (
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                    )}
                </button>
            </div>
        </div>
    );
};

export default MemoriesTab;
