
// id  3695043
// workspace 2355444
let rp = require('request-promise');
require('dotenv').config()
const WID = process.env.TOGGL_WID

const getClients = ()=>{

    let options = {
        url: 'https://www.toggl.com/api/v8/workspaces/2355444/clients',
        auth: {
            'user': process.env.TOGGL_USER,
            'pass': 'api_token'
        }
    };

    rp(options)
    .then(response => console.log(JSON.parse(response)))
    .catch(err => console.log(err))

}

const addClient = ()=>{
    let options = {
        method: 'POST',
        url: 'https://www.toggl.com/api/v8/clients',
        auth: {
            'user': process.env.TOGGL_USER,
            'pass': 'api_token'
        },
        body: {"client":
                    {
                     "name":"Test Company Api",
                     "wid":WID
                    }
              },
        json:true
    };
    
    
    rp(options)
    .then(response => console.log(response))
    .catch(err => console.log(err))
    
}


const createProject = ()=>{
    let options = {
        method: 'POST',
        url: 'https://www.toggl.com/api/v8/projects',
        auth: {
            'user': process.env.TOGGL_USER,
            'pass': 'api_token'
        },
        body: {"project":
                    {
                        "name":"An awesome project",
                        "wid":WID,
                        "is_private":false,
                        "cid": 46475199
                    }
             },
        json:true
    };
    
    
    rp(options)
    .then(response => console.log(response))
    .catch(err => console.log(err))
    
}

/* createProject() */