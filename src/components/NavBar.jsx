import React from 'react'
import Button  from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import { useAuth } from '../helpers/useAuth';

 const NavBar= () => {

    const {user,signout} = useAuth()

    return (
        <Grid container >
            <Grid item xs={12} container justify="flex-end" alignItems="center" alignContent="center">
                {!!user && user.email}
                <Button size="large" variant="text" onClick={signout}>Logout</Button>
            </Grid>
           
        </Grid>
    )
}
export default NavBar