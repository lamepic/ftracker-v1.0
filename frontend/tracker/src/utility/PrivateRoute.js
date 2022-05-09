import React from "react";
import { Route, Redirect } from "react-router";
import LoadingBackdrop from "../components/Loading/LoadingBackdrop";
import { useStateValue } from "../store/StateProvider";

const PrivateRoute = ({ component: Component, ...rest }) => {
  const [{ isAuthenticated, isLoading }] = useStateValue();

  return (
    <Route
      {...rest}
      render={(props) => {
        if (isLoading) {
          return <LoadingBackdrop />;
        } else if (!isAuthenticated) {
          return <Redirect to="/" />;
        } else {
          return <Component {...props} />;
        }
      }}
    />
  );
};

export default PrivateRoute;
