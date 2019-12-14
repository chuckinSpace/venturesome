import React, {useState} from 'react'
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import FirebaseAuth from './FirebaseAuth';
import {Redirect} from "react-router-dom"
import { useAuth } from '../helpers/useAuth';

const Login = ({history}) => {
    
    const [email,setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error,setError] = useState(false)
    const {user,signin} = useAuth()

 
    const handleSubmit = ()=>{     
        if( !!email || password) setError(true)
       
        try {
            signin(email,password)      
        } catch (error) {
           console.log("error creating user",error)
        }
    }
    const handleNewUser =()=>{
        console.log("here")
        history.push("createUser")
    }

    
     if(!!user && user.uid) return <Redirect to="/home"/>  
  
    return (
        
        <Grid container justify="center" direction="column" style={{width:"30%", margin:"auto", marginTop:"20%"}}>
             <FirebaseAuth/>

                    <TextField 
                        error={error && email === ""} 
                        helperText="required" 
                        required type="email" 
                        value={email} 
                        label="Email"  
                        onChange={(e)=>setEmail(e.target.value)}
                    >Email
                    </TextField>
                
        
                    <TextField 
                        error={error && password === ""} 
                        helperText="required" 
                        required type="password" 
                        value={password}  
                        label="Password"  
                        onChange={(e)=>setPassword(e.target.value)}
                        >Password
                    </TextField>
                
                <Button variant="outlined" size="large" onClick={handleSubmit}>Login</Button>  
                <Button variant="outlined" size="large" onClick={handleNewUser}>New User</Button>
            </Grid>

      
    )
}

export default Login