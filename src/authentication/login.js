import React from "react";
import "./login.css";



function Login(props){
    
    return(
        <div className="login">
              


        <div className="center">
          <h1>{props.title}</h1>
          <form onSubmit={props.submitted}>
            <div className="txt_field">
              <input type="text" name="email" required />
              <span></span>
              <label>Email</label>
            </div>
            <div className="txt_field">
              <input type="password" name="password" required />
              <span></span>
              <label>Password</label>
            </div>
            <div className="pass">{props.forgot}</div>
            
            <input type="submit" value={props.submit} />
           <div className="signup_link">
               {props.lab_not_member} <a href="#"  onClick={props.switch}>{props.not_member}</a> or
            </div>
            <button className="google_signin" onClick={props.handleGoogleSignIn}>Sign in with Google</button>
          </form>
         
        </div>
        </div> 
    )
}
export default Login