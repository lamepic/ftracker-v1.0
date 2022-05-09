import React from "react";

import Login from "./Login/Login";
import Dashboard from "./Dashboard/Dashboard";
import { Route, Switch } from "react-router-dom";
import PrivateRoute from "../utility/PrivateRoute";
import useFetchUser from "../hooks/useFetchUser";

function App() {
  const user = useFetchUser();

  return (
    <div>
      <Switch>
        <Route exact path="/" component={Login} />
        <PrivateRoute path="/dashboard" component={Dashboard} />
        {/* <Route exact path="*" component={() => <p>404</p>} /> */}
      </Switch>
    </div>
  );
}

export default App;
