import React, {useState, useEffect} from 'react'
import firebase from "../firebase_config/config"
import  CheckBox  from '@material-ui/core/CheckBox'
import  Grid  from '@material-ui/core/Grid'
 
const Slack = ({setSlackUsers}) => {
    
    const [venturesomeTeam, setVenturesome]=useState([])
  
    const db = firebase.firestore()
    var users =[]
    useEffect(() => {
        //listener on projects
        const unsubscribe = 
         db.collection("slack")
         .onSnapshot(function(querySnapshot) {
             querySnapshot.forEach(async function(doc) {
                if(doc.exists){
                    console.log("exist")
                    const venturesomeTeam = await doc.data().venturesomeUsers
                    const slackUsers = await doc.data().allUsers.members
                    const venturesome = await slackUsers.filter(user=> venturesomeTeam.includes(user.id) ) 
                    setVenturesome(venturesome) 
                }else{
                    setVenturesome("No Data from  ")
                }
             });
             console.log("projects listener")
         return () => {
            console.log("detaching listener") 
            unsubscribe()
         };
        })
    
         
     }, [db])
   
  
   
    const handleUsers = (e)=>{
            
        const checked = e.target.checked
        const user = e.target.value
     
        if(checked){
            console.log("checked", user)
            users.push({id:user})
            
        }else if(!checked){
            users =  users.filter(e => e.id !== user)    
        } 
        console.log(users)
        setSlackUsers(users)
        
    }
    return (
        <Grid container >
            <h4>Who sould be on the Slack Channel for this project?</h4>
            {venturesomeTeam && venturesomeTeam.map(user=> {
               return(
                        <Grid item xs={6} key={user.id}>
                            <CheckBox value={user.id} onChange={handleUsers}/>
                            <span>{user.real_name}</span>   
                         </Grid>
               ) 
            })  
        }

        </Grid>
    )
}
export default Slack