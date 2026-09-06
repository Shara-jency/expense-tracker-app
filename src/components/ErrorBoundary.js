import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error, errorInfo) {
    console.error('GLOBAL APP ERROR:', error);
    console.error('ERROR INFO:', errorInfo);

    this.setState({
      errorInfo,
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>
            SpendLens encountered an error
          </Text>

          <ScrollView style={styles.scroll}>
            <Text style={styles.label}>Error:</Text>

            <Text style={styles.error}>
              {String(this.state.error)}
            </Text>

            <Text style={styles.label}>
              Component Stack:
            </Text>

            <Text style={styles.error}>
              {this.state.errorInfo?.componentStack || 'No stack available'}
            </Text>
          </ScrollView>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121218',
    padding: 25,
    paddingTop: 60,
  },

  title: {
    color: '#FF6B6B',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },

  scroll: {
    flex: 1,
  },

  label: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 8,
  },

  error: {
    color: '#FFB4B4',
    fontSize: 14,
    lineHeight: 22,
  },
});