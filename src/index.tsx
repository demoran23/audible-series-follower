/* @refresh reload */
import { ThemeProvider } from '@suid/material';
import { render } from 'solid-js/web';
import { BooksStore, setBooks } from 'store/books';
import { theme } from 'theme';
import App from './App';

import './index.css';

export const extensionId = chrome.runtime.id;

render(
  () => (
    <ThemeProvider theme={theme}>
      <App />
    </ThemeProvider>
  ),
  document.getElementById('root') as HTMLElement,
);

setTimeout(() => {
  chrome.runtime.sendMessage({ type: 'initialize' }, (res: BooksStore) => {
    console.log('INIT', res);
    setBooks(res);
  });
  chrome.runtime.sendMessage({ type: 'refresh' }, (res: BooksStore) => {
    console.log('REFRESH', res);
    setBooks(res);
  });
}, 500);
