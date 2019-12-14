import React from 'react'
import { useAuth } from '../helpers/useAuth';
import {Redirect} from "react-router-dom"

 const Home = () => {
    const {user} = useAuth()   
    
    if(!user) return <Redirect to="/"/>  
    return   (
        <div>
            <h1>Home</h1> 
        </div>
        )
         
        
        
 
 
    
   
}
export default Home