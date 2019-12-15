import React, { useState, useEffect } from 'react'
import Grid from '@material-ui/core/Grid';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import {addFirestoreDocument, getDocument} from "../helpers/firestore" 
import firebase from "../firebase_config/config"


const NewProject = () => {
    const db = firebase.firestore()

        const [error,setError] = useState(false)  
        const [currentNumber, setCurrentNumber] = useState("")
        const [clients,setClients] = useState("")
        const [clientId,setClientId] = useState("")
        const [clientName,setClientName] = useState("")
        const [clientIdNumber, setClientIdNumber] = useState("")
        const [clientEmail, setClientEmail] = useState("")
        const [managers,setManagers] = useState("")
        const [managerId,setManagerId] = useState("")
        const [managerName,setManagerName] = useState("")
        const [managerEmail, setManagerEmail] = useState("")
        
        
         const reset =()=>{
            setClients("")
            setClientId("")
            setClientName("")
            setClientIdNumber("")
            setClientEmail("")
            setManagers("")
            setManagerId("")
            setManagerName("")
            setManagerEmail("")
            setError(false)
            setCurrentNumber("")
         }
      


    const handleSubmit = (e)=>{     
        e.preventDefault();
       
        if(managerName ==="" || clientIdNumber === "" || managerEmail === ""||clientName === "" || clientEmail === "" || clientIdNumber === ""){
            console.log("setting error")
            setError(true)
        }
        try {
            if(!error){
                const project = {managerName,createdAt:new Date(),managerEmail, idNumber:currentNumber, clientIdNumber, clientEmail, clientName}
                addFirestoreDocument("projects",project)
                 reset() 
                setError(false)      
            }
          
        } catch (error) {
            console.log(error)
        }

    }
    
 useEffect(() => {
    //listener on projects
    const unsubscribe = 
     db.collection("projects").orderBy("idNumber", "desc").limit(1)
     .onSnapshot(function(querySnapshot) {
         querySnapshot.forEach(async function(doc) {
            if(doc.exists){
                console.log("exist")
                const number = await doc.data().idNumber
                setCurrentNumber(number + 1)
            }else{
                console.log("no projects")
                setCurrentNumber(1)
            }
         });
     return () => {
        console.log("detaching listener") 
        unsubscribe()
     };
    })

     
 }, [db])

 useEffect(() => {
     //listener on clients
    const unsubscribe = 
     db.collection("clients").orderBy("idNumber", "desc")
     .onSnapshot(function(querySnapshot) {
         querySnapshot.forEach(async function(doc) {
            if(doc.exists){

            await setClients(prevState => [...prevState,doc])  
            
            }else{
                setCurrentNumber(1)
            }
         });
     });
   
     return () => {
        console.log("detaching listener") 
        unsubscribe()
     };

   
 }, [db])

 useEffect(() => {
     //listener on managers
    const unsubscribe = 
     db.collection("users").where("isManager", "==", true)
     .onSnapshot(function(querySnapshot) {
         querySnapshot.forEach(async function(doc) {
            if(doc.exists){

            await setManagers(prevState => [...prevState,doc])  
            
            }else{
                setManagers("No Managers")
            }
         });
     });
   
     return () => {
        console.log("detaching listener") 
        unsubscribe()
     };

   
 }, [db])

  const handleClient= async (e)=>{
    const clientObj = await getDocument("clients", e.target.value)
    setClientId(e.target.value)
    setClientName(clientObj.data().name)
    setClientIdNumber(clientObj.data().idNumber)
    setClientEmail(clientObj.data().email)   
  }
  
 
  const handleManager= async (e)=>{
    const managerObj = await getDocument("users", e.target.value)
    setManagerId(e.target.value)
    setManagerName(managerObj.data().fName)
    setManagerEmail(managerObj.data().email)
    
     
  }
   
    return (
        
        <Grid container justify="center" direction="column" spacing={2} style={{width:"70%", margin:"auto", marginTop:"2%"}}>
            <h4>Creating new Project</h4>
           
                <Grid item xs={12}>
                    <span>Project Number Assigned : {currentNumber}</span>
                </Grid>
                <Grid item xs={12} container justify="flex-start" alignItems="flex-start" alignContent="flex-start">
                <InputLabel id="client">Client</InputLabel>
                        <Select
                            labelId="client"
                            id="client"
                            value={clientId}
                            style={{width:"100%"}}
                            onChange={(e)=>handleClient(e)} 
                            >
                        {!!clients && clients.map(client=>{
                            return <MenuItem key={client.id} value={client.id}>
                                        {client.data().name}
                                    </MenuItem>
                        })}
                        </Select>
                    </Grid>
                    <Grid item xs={12}>
                        <InputLabel id="manager">Manager</InputLabel>     
                        <Select
                            labelId="manager"
                            id="manager"
                            value={managerId}
                            style={{width:"100%"}}
                            onChange={(e)=>handleManager(e)} 
                            >
                        {!!managers && managers.map(manager=>{
                            return <MenuItem key={manager.id} value={manager.id}>
                                        {manager.data().fName}
                                    </MenuItem>
                        })}
                        </Select>
                    </Grid>
           
           
          
            <TextField 
                    error={error && clientName === ""} 
                    helperText="required" 
                    required 
                    type="text" 
                    name="clientName"
                    value={clientName}  
                    label="Client Name"  
                    onChange={(e)=>setClientName(e.target.value)}
                >Client Name
            </TextField>
            <TextField 
                    error={error && clientIdNumber === ""} 
                    helperText="required" 
                    required 
                    type="text" 
                    name="clientIdNumber"
                    value={clientIdNumber} 
                    label="Client Number"  
                    onChange={(e)=>setClientIdNumber(e.target.value)}
                >Client Number
            </TextField>

            <TextField 
                    error={error && clientEmail === ""} 
                    helperText="required" 
                    required 
                    type="text" 
                    name="clientEmail"
                    value={clientEmail}  
                    label="Client Email"  
                    onChange={(e)=>setClientEmail(e.target.value)}
                >Client Email
            </TextField>
            <TextField 
                    error={error && managerName === ""} 
                    helperText="required" 
                    autoComplete="current-password" 
                    required 
                    type="text"
                    name="managerName"
                    value={managerName} 
                    label="Manager Name" 
                    onChange={(e)=>setManagerName(e.target.value)}
                >Manager Name
            </TextField>
         
            <TextField 
                    error={error && managerEmail === ""} 
                    helperText="required" 
                    required 
                    type="text" 
                    name="managerEmail"
                    value={managerEmail} 
                    label="Manager Email"  
                    onChange={(e)=>setManagerEmail(e.target.value)}
                >Manager Email
            </TextField>
          
                <Button variant="outlined" size="large" onClick={(e)=> handleSubmit(e)}>Create</Button>
              
            </Grid>


      
    )
}

export default NewProject