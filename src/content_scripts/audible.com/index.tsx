import { AllInclusive } from '@suid/icons-material';
import { IconButton } from '@suid/material';
import { Component } from 'solid-js';
import { render } from 'solid-js/web';

const OpenAppButton: Component = () => {
  const onClick = () => chrome.runtime.sendMessage({ type: 'show-app' });
  return (
    <IconButton onClick={onClick}>
      <AllInclusive />
    </IconButton>
  );
};

const parent = document.querySelector('#ui-it-orderhistory-heading');
if (parent) {
  const mountPoint = document.createElement('span');
  mountPoint.id = 'audible-listen-history-tracker-open-app-button';
  render(() => <OpenAppButton />, mountPoint);
  parent.append(mountPoint);
}
console.log('PARENT', parent);
export {};
