import React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import RefreshIcon from '@mui/icons-material/Refresh';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[FinConsent UI Error Caught by ErrorBoundary]:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/dashboard';
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            minHeight: '80vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 3,
          }}
        >
          <Card
            elevation={0}
            sx={{
              maxWidth: 540,
              width: '100%',
              p: 4,
              borderRadius: 3.5,
              border: '1px solid #E2E8F0',
              textAlign: 'center',
              bgcolor: '#FFFFFF',
            }}
          >
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2, textAlign: 'left' }}>
              <Typography variant="subtitle2" fontWeight={700}>
                Something unexpected happened in the application
              </Typography>
              <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: 'text.secondary' }}>
                {this.state.error?.message || 'A client-side component encountered an unexpected error.'}
              </Typography>
            </Alert>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Your session and mandate data remain secure. You can reload this view or navigate back to the advisory dashboard.
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={this.handleReload}
                sx={{ borderRadius: 2, fontWeight: 600 }}
              >
                Reload Page
              </Button>
              <Button
                variant="contained"
                startIcon={<HomeOutlinedIcon />}
                onClick={this.handleReset}
                sx={{ borderRadius: 2, fontWeight: 700 }}
              >
                Go to Dashboard
              </Button>
            </Box>
          </Card>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
