import React, { useState } from 'react'
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import {Redirect} from "react-router-dom"
import { useAuth } from '../helpers/useAuth';
import NewProject from "./NewProject"
import NewClient from "./NewClient"

const CreateForm = () => {
    
    const {user} = useAuth()
    const [newProject,setNewProject]  = useState(false)
    const [newClient,setNewClient]  = useState(false)
    
    
    const handleClient=()=>{
        setNewProject(false)
        setNewClient(true)
    }

    const handleProject = () =>{
        setNewClient(false)
        setNewProject(true)
    }


    if(!user) return <Redirect to="/"/>  
    
    return (
        
            <Grid container justify="center" spacing={1} style={{width:"30%", margin:"auto"}}> 
                <Grid item xs={12}>
                    <Button 
                        style={{width:"100%"}} 
                        variant="outlined" 
                        size="large" 
                        onClick={handleClient}
                    >New Client
                    </Button>
                </Grid>
                <Grid item xs={12}> 
                    <Button 
                        style={{width:"100%"}} 
                        variant="outlined" 
                        size="large" 
                        onClick={handleProject}
                    >New Project
                    </Button>
                    <Grid container>
                        <Grid item xs={12}>
                           {newProject && <NewProject/>}
                           {newClient && <NewClient/>}
                        </Grid>
                    </Grid>
                    
                </Grid>
            </Grid>

      
    )
}

export default CreateForm