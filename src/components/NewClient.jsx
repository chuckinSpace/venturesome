import React, { useState, useEffect } from 'react'
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import {addFirestoreDocument} from "../helpers/firestore" 
import firebase from "../firebase_config/config"


const NewClient = () => {
    const db = firebase.firestore()

    const initialState= {
        name:"",
        email:"",
        street:"",
        zipCode:"",
        city:""
    }

   const [
       { 
        name, 
        email, 
        street,
        zipCode,
        city }, setForm] = useState(initialState);
        const [error,setError] = useState(false)  
        const [currentNumber, setCurrentNumber] = useState("")
       
    const reset = () => {
        setForm({ ...initialState });
    };

    const onChange = e => {
        
        const { name, value } = e.target;
        setForm(prevState => ({ ...prevState, [name]: value }));
    };

    const handleSubmit = (e)=>{     
        e.preventDefault();
       
        if(name ==="" || email === "" || street === "" || zipCode === "" || city === ""){
            console.log("sdetting error")
            setError(true)
            
        }
      
        try {
            if(!error){
              
                const client = {name,email,street,zipCode,city,idNumber:currentNumber, clientProjectNumber:0}
                const path = "clients"
                addFirestoreDocument(path,client)
                reset()
                setError(false)      
            }
          
        } catch (error) {
            console.log(error)
        }

    }
    
 useEffect(() => {
     const unsubscribe = 
     db.collection("clients").orderBy("idNumber", "desc").limit(1)
     .onSnapshot(function(querySnapshot) {

         querySnapshot.forEach(async function(doc) {
            const number = await doc.data().idNumber
            setCurrentNumber(number + 1)
         
         });
         
     });
     return () => {
        console.log("detaching listener") 
        unsubscribe()
     };
 }, [db])

    return (
        <Grid container justify="center" direction="column" style={{width:"70%", margin:"auto", marginTop:"2%"}}>
            <h4>Creating New Client</h4>
            <Grid item xs={12}>
                <span>Number Assigned : {currentNumber}</span>
            </Grid>
            <TextField 
                    error={error && name === ""} 
                    helperText="required" 
                    autoComplete="current-password" 
                    required 
                    type="text"
                    name="name"
                    value={name} 
                    label="First Name" 
                    onChange={onChange}
                >First Name
            </TextField>

            <TextField 
                    error={error && email === ""} 
                    helperText="required" 
                    required 
                    type="email" 
                    name="email"
                    value={email} 
                    label="Email"  
                    onChange={onChange}
                >Email
            </TextField>
        

            <TextField 
                    error={error && street === ""} 
                    helperText="required" 
                    required 
                    type="text" 
                    name="street"
                    value={street}  
                    label="Street"  
                    onChange={onChange}
                >Street
            </TextField>
            <TextField 
                    error={error && zipCode === ""} 
                    helperText="required" 
                    required 
                    type="text" 
                    name="zipCode"
                    value={zipCode}  
                    label="Zip Code"  
                    onChange={onChange}
                >Zip Code
            </TextField>
            <TextField 
                    error={error && city === ""} 
                    helperText="required" 
                    required 
                    type="text" 
                    name="city"
                    value={city}  
                    label="City"  
                    onChange={onChange}
                >City
            </TextField>
                
                <Button variant="outlined" size="large" onClick={(e)=> handleSubmit(e)}>Create</Button>
              
            </Grid>


      
    )
}

export default NewClient