import React, {useState} from 'react'
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import {Redirect} from "react-router-dom"
import { useAuth } from '../helpers/useAuth';
import { addUserInfo } from '../helpers/firestore';

const SignUp = ({history}) => {
    
    const [fName,setFName] = useState("")
    const [lName,setLName] = useState("")
    const [email,setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error,setError] = useState(false)
    const {user,signup} = useAuth()
    
    const handleSubmit = async ()=>{     
        if(!!fName || !!lName || !!email || password) setError(true)
        
        try { 
           const user = await signup(email,password)   
            addUserInfo(user.uid, fName,lName,email)     
            
         
         
        } catch (error) {
           console.log("error creating user",error)
        }
    }

    const handleLogin=()=>{
       history.push("/")
    }

    if(!!user && user.uid) return <Redirect to="/home"/>  
    
    return (
        
        <Grid container justify="center" direction="column" style={{width:"30%", margin:"auto", marginTop:"20%"}}>
            
           
                    <TextField 
                        error={error && fName === ""} 
                        helperText="required" 
                        autoComplete="current-password" 
                        required 
                        type="text"
                        value={fName} 
                        label="First Name" 
                        onChange={(e)=>setFName(e.target.value)}
                    >First Name
                    </TextField>
         
                    <TextField 
                        error={error && lName === ""} 
                        helperText="required" 
                        required type="text" 
                        value={lName} 
                        label="Last Name"  
                        onChange={(e)=>setLName(e.target.value)}
                    >Last Name
                    </TextField>
     
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
                
                <Button variant="outlined" size="large" onClick={handleSubmit}>Create</Button>
                <Button variant="outlined" size="large" onClick={handleLogin}>Login</Button>
            </Grid>

      
    )
}

export default SignUp