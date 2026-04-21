/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

jest.mock('react-native-quick-sqlite', () => ({
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
jest.mock('../global.css', () => ({}), { virtual: true });
jest.mock('../src/navigation/AppNavigator', () => () => null);

import App from '../App';

test('renders correctly', async () => {
  await ReactTestRenderer.act(() => {
    ReactTestRenderer.create(<App />);
  });
});
