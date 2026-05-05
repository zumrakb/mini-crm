/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

jest.mock('react-native-quick-sqlite', () => ({
  QuickSQLite: {
    open: jest.fn(),
    close: jest.fn(),
    delete: jest.fn(),
    attach: jest.fn(),
    detach: jest.fn(),
    transaction: jest.fn(),
    execute: jest.fn(() => ({
      rows: { _array: [] },
      insertId: 1,
    })),
    executeAsync: jest.fn(async () => ({
      rows: { _array: [] },
      insertId: 1,
    })),
    executeBatch: jest.fn(() => ({})),
    executeBatchAsync: jest.fn(async () => ({})),
    loadFile: jest.fn(() => ({})),
    loadFileAsync: jest.fn(async () => ({})),
  },
  open: () => ({
    execute: () => ({
      rows: { _array: [] },
      insertId: 1,
    }),
  }),
}));

jest.mock('react-native-gesture-handler', () => ({}));
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(async () => null),
  setItem: jest.fn(async () => undefined),
}));
jest.mock('react-native-localize', () => ({
  getLocales: () => [{ languageCode: 'en' }],
}));
jest.mock('@notifee/react-native', () => {
  const AuthorizationStatus = {
    NOT_DETERMINED: 0,
    DENIED: 1,
    AUTHORIZED: 2,
    PROVISIONAL: 3,
  };

  return {
    __esModule: true,
    default: {
      createChannel: jest.fn(async () => 'term-reminders'),
      getTriggerNotificationIds: jest.fn(async () => []),
      cancelNotification: jest.fn(async () => undefined),
      requestPermission: jest.fn(async () => ({
        authorizationStatus: AuthorizationStatus.AUTHORIZED,
      })),
      getNotificationSettings: jest.fn(async () => ({
        authorizationStatus: AuthorizationStatus.AUTHORIZED,
      })),
      displayNotification: jest.fn(async () => undefined),
      createTriggerNotification: jest.fn(async () => undefined),
    },
    AndroidImportance: {
      HIGH: 4,
    },
    AuthorizationStatus,
    TriggerType: {
      TIMESTAMP: 0,
    },
  };
});
jest.mock('../global.css', () => ({}), { virtual: true });
jest.mock('../src/navigation/AppNavigator', () => () => null);
jest.mock('../src/components/ui/theme', () => ({
  AppThemeProvider: ({ children }: { children: React.ReactNode }) => children,
}));

import App from '../App';

test('renders correctly', async () => {
  await ReactTestRenderer.act(() => {
    ReactTestRenderer.create(<App />);
  });
});
