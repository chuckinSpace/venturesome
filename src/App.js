import React from 'react';
import './App.css';

import Grid from '@material-ui/core/Grid';
import SignUp from "./Auth/SignUp"
import Home from './components/Home';
import Login from "./Auth/Login"
import {Route,Switch} from "react-router-dom"
import NavBar from './components/NavBar';

function App() {
  return (
    <Grid container justify="center" >
       <Grid item xs={12}>
          <NavBar/>
          <Switch>
            <Route exact path="/createUser" component={SignUp}/>
            <Route exact path="/" component={Login}/>
            <Route exact path="/home" component={Home}/>
          </Switch>
         
          
       </Grid>
    </Grid>
  );
}

export default App;
