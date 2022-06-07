import { useEffect, useState } from "react";
import { notification } from "antd";
import { useStateValue } from "../store/StateProvider";
import useWebSocket, { ReadyState } from "react-use-websocket";
import addNotification from "react-push-notification";

function useFetchData(callback, arg = null) {
  const [data, setData] = useState([]);
  const [store, dispatch] = useStateValue();
  const [loading, setLoading] = useState(true);

  const [socketUrl, setSocketUrl] = useState(
    `ws://192.168.40.9:8000/push-notification/?token=${localStorage.getItem(
      "token"
    )}`
  );
  const { sendMessage, lastMessage, readyState } = useWebSocket(socketUrl, {
    shouldReconnect: (e) => true,
    reconnectInterval: 4000,
  });

  useEffect(() => {
    fetchData();
  }, [lastMessage]);

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
