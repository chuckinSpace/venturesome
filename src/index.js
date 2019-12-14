import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import {BrowserRouter as Router} from "react-router-dom"
import { ProvideAuth } from "./helpers/useAuth";

ReactDOM.render(
    <ProvideAuth>
        <Router>
            <App />
        </Router>
    </ProvideAuth>
    , document.getElementById('root'));

