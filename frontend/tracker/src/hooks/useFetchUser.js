import { useEffect } from "react";
import { loadUser } from "../http/user";
import { useStateValue } from "../store/StateProvider";
import * as actionTypes from "../store/actionTypes";
import { auth_axios } from "../utility/axios";

function useFetchUser() {
  const [store, dispatch] = useStateValue();

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Token ${localStorage.getItem("token")}`,
        },
      };

      const userRes = await auth_axios.get("/users/me/", config);

      if (userRes.status === 200) {
        dispatch({
          type: actionTypes.SET_USER,
          payload: userRes.data,
        });
      }
    } catch {
      dispatch({
        type: actionTypes.AUTH_ERROR,
      });
    }
  };

  return store.user;
}

export default useFetchUser;
