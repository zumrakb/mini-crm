import React from 'react';
import AppErrorScreen from '../../screens/AppErrorScreen';

interface AppErrorBoundaryProps {
  children: React.ReactNode;
}

interface AppErrorBoundaryState {
  error: Error | null;
}

class AppErrorBoundary extends React.Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  state: AppErrorBoundaryState = {
    error: null,
  };

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return { error };
  }

  private handleRetry = () => {
    this.setState({ error: null });
  };

  render() {
    if (this.state.error) {
      return (
        <AppErrorScreen
          onRetry={this.handleRetry}
          showDetails={__DEV__}
          details={this.state.error.message}
        />
      );
    }

    return this.props.children;
  }
}

export default AppErrorBoundary;
