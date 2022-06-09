import { useEffect, useState } from "react";
import { notification } from "antd";
import { useStateValue } from "../store/StateProvider";

function useFetchData(callback, arg = null) {
  const [data, setData] = useState([]);
  const [store, dispatch] = useStateValue();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      if (arg !== null) {
        const res = await callback(store.token, arg);
        const data = res.data;
        setData(data);
      } else {
        const res = await callback(store.token);
        const data = res.data;
        setData(data);
      }
    } catch (e) {
      notification.error({
        message: "Error",
        description: e.response.data.detail,
      });
    } finally {
      setLoading(false);
    }
  };

  return { loading, data };
}

export default useFetchData;
