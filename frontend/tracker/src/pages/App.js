import React from "react";

import Login from "./Login/Login";
import Dashboard from "./Dashboard/Dashboard";
import { Route, Switch } from "react-router-dom";
import PrivateRoute from "../utility/PrivateRoute";
import useFetchUser from "../hooks/useFetchUser";
import ResetPassword from "./ResetPassword/ResetPassword";
import ConfirmResetPasswordEmail from "./ResetPassword/ConfirmResetPasswordEmail";

function App() {
  const user = useFetchUser();

  return (
    <div>
      <Switch>
        <Route exact path="/" component={Login} />
        <PrivateRoute path="/dashboard" component={Dashboard} />
        {/* <Route exact path="*" component={() => <p>404</p>} /> */}
        <Route
          exact
          path="/password/reset/confirm/:uid/:token/"
          component={ResetPassword}
        />
        <Route path="/confirm-email" component={ConfirmResetPasswordEmail} />
      </Switch>
    </div>
  );
}

export default App;
