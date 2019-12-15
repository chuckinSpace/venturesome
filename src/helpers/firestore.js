import firebase from "../firebase_config/config"

const db = firebase.firestore()



export const addUserInfo = (uid,fName,lName,email,isManager)=>{
    console.log("adding info", uid, fName,lName,email,isManager)
   
    db.collection("users")
    .doc(uid)
    .set({email,fName,lName,isManager})
    .then(()=>console.log("sucess adding data",email,fName,lName))
    .catch((err)=> console.log("error adding data",err))
}


export const addListener = (queryString)=>{
    var data = [];
    db.queryString
    .onSnapshot(querySnapshot=> {
        querySnapshot.forEach(function(doc) { 
            data.push(doc)
        });
    });
    return data
}


export const getCurrentNumber =async (group)=>{
    var  myNumber= ""
   
    await db.collection("currentNumber").doc("C8X80WzuFzW1LaNKx4Yy")
    .get()
    .then(currentNumber=> myNumber = currentNumber.data()[group])
    .then(()=> console.log("success"))
    .catch(err => console.log("error getting current Numer"))
  
    return myNumber
} 

export const addFirestoreDocument=(path, object)=>{
    db.collection(path).doc()
    .set(object)
    .then(()=>console.log("sucess adding data",object))
    .catch((err)=> console.log("error adding data",err))
}


export const getDocument= async (collection,docId)=>{
   
    var doc = {}
   await db.collection(collection).doc(docId)
    .get()
    .then((obj=> doc = obj))
    .then(()=> console.log("success fetching docuement"))
    .catch((err)=> console.log("error adding data",err))
    
    return doc
}