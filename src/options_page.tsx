/* @refresh reload */
import { OptionsPage } from "components/OptionsPage";
import { render } from 'solid-js/web';

import './index.css';

render(() => <OptionsPage />, document.getElementById('root') as HTMLElement);
