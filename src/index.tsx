/* @refresh reload */
import { ThemeProvider } from '@suid/material';
import { render } from 'solid-js/web';
import { setBooks } from 'store/books';
import { setSeries } from 'store/series';
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
  chrome.runtime.sendMessage({ type: 'initialize' }, (res) => {
    console.log('INIT', res);
    setSeries(res.series);
    setBooks(res.books);
  });
  // chrome.runtime.sendMessage({ type: 'refresh' }, (res: BooksStore) => {
  //   console.log('REFRESH', res);
  //   setBooks(res);
  // });
}, 500);
