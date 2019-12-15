import React, {useState} from 'react'
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Button from '@material-ui/core/Button';
import {Redirect} from "react-router-dom"
import { useAuth } from '../helpers/useAuth';
import { addUserInfo } from '../helpers/firestore';

const SignUp = ({history}) => {
    

    const initialState= {
        fName:"",
        lName:"",
        email:"",
        password:""
    }

    const [
        { 
         fName, 
         lName,
         email, 
         password,
      
          }, setForm] = useState(initialState);

          
    const [isManager,setIsManager] = useState(false)
    const [error,setError] = useState(false)
    const {user,signup} = useAuth()
    
    
    const reset = () => {
        setForm({ ...initialState });
    };

    const onChange = e => {
        const { name, value } = e.target;
        setForm(prevState => ({ ...prevState, [name]: value }));
    };



    const handleSubmit = async (e)=>{     
        console.log(isManager)
        e.preventDefault();
        if(!!fName || !!lName || !!email || !!password) setError(true)
        
        try { 
            const user = await signup(email,password)   
            console.log(isManager)
            addUserInfo(user.uid, fName,lName,email, isManager)     
            reset()
         
         
        } catch (error) {
           console.log("error creating user",error)
        }
    }

    const handleLogin=()=>{
       history.push("/")
    }

    
    if(!!user && user.uid) return <Redirect to="/home"/>  
   
    return (
        
        <Grid container justify="center" direction="column" style={{width:"30%", margin:"auto", marginTop:"2%"}}>
            
           
                    <TextField 
                        error={error && fName === ""} 
                        helperText="required" 
                        autoComplete="current-password" 
                        required 
                        type="text"
                        value={fName} 
                        label="First Name" 
                        name="fName"
                        onChange={onChange}
                    >First Name
                    </TextField>
         
                    <TextField 
                        error={error && lName === ""} 
                        helperText="required" 
                        required type="text" 
                        value={lName} 
                        label="Last Name"  
                        name="lName"
                        onChange={onChange}
                    >Last Name
                    </TextField>
     
                    <TextField 
                        error={error && email === ""} 
                        helperText="required" 
                        required
                        type="email" 
                        value={email} 
                        label="Email"  
                        name="email"
                        onChange={onChange}
                    >Email
                    </TextField>
                
        
                    <TextField 
                        error={error && password === ""} 
                        helperText="required" 
                        required type="password" 
                        value={password}  
                        label="Password"  
                        name="password"
                        onChange={onChange}
                        >Password
                    </TextField>
                    <FormControlLabel
                    control={
                         <Checkbox checked={isManager} onChange={(e)=> setIsManager(e.target.checked)} value={isManager} />
                            }
                        label="Are You A Project Manager?"
                    />
                
                <Button variant="outlined" size="large" onClick={e=>handleSubmit(e)}>Create</Button>
                <Button variant="outlined" size="large" onClick={handleLogin}>Login</Button>
            </Grid>

      
    )
}

export default SignUp