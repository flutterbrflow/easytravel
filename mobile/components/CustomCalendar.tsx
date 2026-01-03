import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants';

interface CustomCalendarProps {
    startDate: string;
    endDate: string;
    onSelectDate: (date: string) => void;
    isDark: boolean;
}

const CustomCalendar: React.FC<CustomCalendarProps> = ({ startDate, endDate, onSelectDate, isDark }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay(); // 0 = Sunday

    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const weekDays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
    const monthNames = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const isSelected = (day: number, preCalculatedStr?: string) => {
        let dateStr = preCalculatedStr;
        if (!dateStr) {
            const year = currentDate.getFullYear();
            const month = String(currentDate.getMonth() + 1).padStart(2, '0');
            const dayStr = String(day).padStart(2, '0');
            dateStr = `${year}-${month}-${dayStr}`;
        }
        return dateStr === startDate || dateStr === endDate;
    };

    const isInRange = (day: number, preCalculatedStr?: string) => {
        if (!startDate || !endDate) return false;
        let currentStr = preCalculatedStr;
        if (!currentStr) {
            const year = currentDate.getFullYear();
            const month = String(currentDate.getMonth() + 1).padStart(2, '0');
            const dayStr = String(day).padStart(2, '0');
            currentStr = `${year}-${month}-${dayStr}`;
        }
        return currentStr > startDate && currentStr < endDate;
    };

    return (
        <View style={[styles.calendarContainer, { backgroundColor: isDark ? '#1e2a36' : '#ffffff' }]}>
            <View style={styles.calendarHeader}>
                <TouchableOpacity onPress={handlePrevMonth} style={styles.monthButton}>
                    <MaterialCommunityIcons name="chevron-left" size={24} color={isDark ? '#ffffff' : '#111418'} />
                </TouchableOpacity>
                <Text style={[styles.monthTitle, { color: isDark ? '#ffffff' : '#111418' }]}>
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </Text>
                <TouchableOpacity onPress={handleNextMonth} style={styles.monthButton}>
                    <MaterialCommunityIcons name="chevron-right" size={24} color={isDark ? '#ffffff' : '#111418'} />
                </TouchableOpacity>
            </View>
            <View style={styles.weekDaysRow}>
                {weekDays.map((d, i) => (
                    <Text key={i} style={styles.weekDayText}>{d}</Text>
                ))}
            </View>
            <View style={styles.daysGrid}>
                {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                    <View key={`empty-${i}`} style={styles.dayCell} />
                ))}
                {days.map((d) => {
                    const year = currentDate.getFullYear();
                    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
                    const dayStr = String(d).padStart(2, '0');
                    const dateStr = `${year}-${month}-${dayStr}`;
                    const selected = isSelected(d, dateStr);
                    const inRange = isInRange(d, dateStr);
                    return (
                        <View key={d} style={styles.dayCell}>
                            {inRange && <View style={[styles.rangeBackground, { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.2)' : '#eff6ff' }]} />}
                            {selected && startDate && endDate && startDate !== endDate && (
                                <View style={[styles.rangeBackground, { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.2)' : '#eff6ff', width: '50%', left: new Date(startDate).getDate() === d ? '50%' : 0 }]} />
                            )}
                            <TouchableOpacity
                                onPress={() => onSelectDate(dateStr)}
                                style={[styles.dayButton, selected && styles.dayButtonSelected, !selected && inRange && styles.dayButtonInRange]}
                            >
                                <Text style={[styles.dayText, { color: isDark ? '#ffffff' : '#111418' }, selected && styles.dayTextSelected, inRange && !selected && { color: '#2563eb' }]}>
                                    {d}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    );
                })}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    calendarContainer: { borderRadius: 16, padding: 16, elevation: 1, backgroundColor: '#fff', marginBottom: 16 },
    calendarHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    monthButton: { padding: 4 },
    monthTitle: { fontSize: 16, fontWeight: 'bold' },
    weekDaysRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 8 },
    weekDayText: { width: 40, textAlign: 'center', fontSize: 12, fontWeight: 'bold', color: '#94a3b8' },
    daysGrid: { flexDirection: 'row', flexWrap: 'wrap' },
    dayCell: { width: '14.28%', height: 40, alignItems: 'center', justifyContent: 'center', marginVertical: 2 },
    rangeBackground: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, height: 40 },
    dayButton: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', zIndex: 2 },
    dayButtonSelected: { backgroundColor: COLORS.primary },
    dayButtonInRange: { borderRadius: 0 },
    dayText: { fontSize: 14, fontWeight: '500' },
    dayTextSelected: { color: '#ffffff', fontWeight: 'bold' },
});

export default CustomCalendar;
