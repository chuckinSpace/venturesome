import firebase from "../firebase_config/config"

const db = firebase.firestore()

export const addUserInfo = (uid,fName,lName,email)=>{
    console.log("adding info", uid, fName,lName,email)
   
    db.collection("users")
    .doc(uid)
    .set({email,fName,lName})
    .then(()=>console.log("sucess adding data",email,fName,lName))
    .catch((err)=> console.log("error adding data",err))
}




