import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';

/**
 * Generates and shares a CSV report for user expenses and liabilities
 */
export const exportExpensesToCSV = async (expenses = [], mandatoryExpenses = []) => {
  try {
    if (!expenses.length && !mandatoryExpenses.length) {
      Alert.alert('No Data', 'There are no records to export.');
      return;
    }

    // CSV Headers
    let csvContent = 'Type,Title,Category,Amount (INR),Date\n';

    // Append Discretionary Expenses
    expenses.forEach((item) => {
      const dateStr = item.createdAt?.toDate 
        ? item.createdAt.toDate().toLocaleDateString('en-IN')
        : new Date(item.createdAt || Date.now()).toLocaleDateString('en-IN');

      const titleEscaped = `"${(item.title || 'Expense').replace(/"/g, '""')}"`;
      const categoryEscaped = `"${(item.category || 'Other').replace(/"/g, '""')}"`;

      csvContent += `Expense,${titleEscaped},${categoryEscaped},${item.amount || 0},${dateStr}\n`;
    });

    // Append Fixed Liabilities
    mandatoryExpenses.forEach((item) => {
      const titleEscaped = `"${(item.title || 'Liability').replace(/"/g, '""')}"`;
      const categoryEscaped = `"${(item.category || 'Bill/Loan').replace(/"/g, '""')}"`;

      csvContent += `Fixed Liability,${titleEscaped},${categoryEscaped},${item.amount || 0},Due: Day ${item.dueDate || 1}\n`;
    });

    // Save File Locally
    const fileUri = `${FileSystem.documentDirectory}SpendLens_Statement_${Date.now()}.csv`;
    await FileSystem.writeAsStringAsync(fileUri, csvContent, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    // Trigger Native Share Sheet
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'text/csv',
        dialogTitle: 'Export SpendLens Monthly Statement',
      });
    } else {
      Alert.alert('Success', `File saved to: ${fileUri}`);
    }
  } catch (error) {
    Alert.alert('Export Failed', error.message || 'Could not export statement.');
  }
};