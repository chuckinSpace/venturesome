import React, { useState,useEffect } from 'react'
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import {Redirect} from "react-router-dom"
import { useAuth } from '../helpers/useAuth';
import {updateFirestoreDocument } from "../helpers/firestore"
import NewProject from "./NewProject"
import NewClient from "./NewClient"

const CreateForm = () => {
    
    const {user} = useAuth()
    const [newProject,setNewProject]  = useState(false)
    const [newClient,setNewClient]  = useState(false)
    
    useEffect(() => {
        updateFirestoreDocument("slack",)
        return () => {
            cleanup
        };
    }, [input])
    
    const handleClient=()=>{
        setNewProject(false)
        setNewClient(true)
    }

    const handleProject = () =>{
        setNewClient(false)
        setNewProject(true)
    }

    const closeClient = ()=>{
        setNewClient(false)
    }
    const closeProject=()=>{
        setNewProject(false)
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
                           {newProject && <NewProject closeProject={closeProject}/>}
                           {newClient && <NewClient closeClient={closeClient}/>}
                        </Grid>
                    </Grid>
                    
                </Grid>
            </Grid>

      
    )
}

export default CreateForm