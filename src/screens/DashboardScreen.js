import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { useTheme } from '../context/ThemeContext';
import { getDashboardStyles } from '../styles/dashboardStyles';

import StatCard from '../components/StatCard';
import InsightCard from '../components/InsightCard';
import TransactionRow from '../components/TransactionRow';

export default function DashboardScreen() {
    const { theme, toggleTheme } = useTheme();
    const styles = getDashboardStyles(theme);

    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalSpend, setTotalSpend] = useState(0);
    const [leakSpend, setLeakSpend] = useState(0);

    useEffect(() => {
        const user = auth.currentUser;

        if (!user) return;

        // Real-time Firestore subscription for logged-in user's expenses
        const q = query(
            collection(db, 'expenses'),
            where('userId', '==', user.uid),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const docs = [];
            let calculatedTotal = 0;
            let calculatedLeak = 0;

            snapshot.forEach((doc) => {
                const data = doc.data();
                docs.push({ id: doc.id, ...data });

                calculatedTotal += data.amount || 0;
                if (data.isLeak) {
                    calculatedLeak += data.amount || 0;
                }
            });

            setTransactions(docs);
            setTotalSpend(calculatedTotal);
            setLeakSpend(calculatedLeak);
            setLoading(false);
        }, (error) => {
            console.error("Firestore real-time listener error:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const userEmail = auth.currentUser?.email ? auth.currentUser.email.split('@')[0] : 'User';
    const userName = auth.currentUser?.displayName || auth.currentUser?.email?.split('@')[0] || 'User';

    return (
        <View style={styles.container}>
            {/* Header Bar */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.greetingText}>Welcome back,</Text>
                    <Text style={styles.userEmailText}>{userName}</Text>
                </View>
                <TouchableOpacity style={styles.themeToggleButton} onPress={toggleTheme}>
                    <Text style={styles.themeToggleText}>
                        {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Stats Section */}
            <View style={styles.statsContainer}>
                <StatCard
                    title="Total Spend"
                    amount={totalSpend.toFixed(2)}
                    subtitle="This Month"
                    theme={theme}
                />
                <StatCard
                    title="Leak Alert"
                    amount={leakSpend.toFixed(2)}
                    subtitle="Impulse / Delivery"
                    isLeak={true}
                    theme={theme}
                />
            </View>

            {/* Insight Banner if Leaks Exist */}
            {leakSpend > 0 && (
                <InsightCard
                    category="Impulse & Leaks"
                    currentMonth={leakSpend.toFixed(0)}
                    previousMonth={(leakSpend * 0.7).toFixed(0)}
                    percentageIncrease={30}
                    theme={theme}
                />
            )}

            {/* Recent Activity List */}
            <Text style={styles.sectionTitle}>Recent Activity</Text>

            {loading ? (
                <ActivityIndicator style={{ marginTop: 20 }} />
            ) : (
                <FlatList
                    data={transactions}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <TransactionRow
                            title={item.title}
                            category={item.category}
                            amount={item.amount}
                            date={item.date || 'Today'}
                            isLeak={item.isLeak}
                            theme={theme}
                        />
                    )}
                    ListEmptyComponent={
                        <Text style={styles.emptyStateText}>
                            No expenses logged yet. Tap Add Expense to get started!
                        </Text>
                    }
                />
            )}
        </View>
    );
}