import React, { useEffect, useState } from "react";
import { fetchOutgoing } from "../../http/document";
import useFetchData from "../../hooks/useFetchData";
import Page from "../../components/Layout/Page";
import { useStateValue } from "../../store/StateProvider";
import { notification } from "antd";

function Outgoing() {
  const [data, setData] = useState([]);
  const [store, dispatch] = useStateValue();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [store.socketSignal]);

  const fetchData = async () => {
    try {
      const res = await fetchOutgoing(store.token);
      const data = res.data;
      setData(data);
    } catch (e) {
      notification.error({
        message: "Error",
        description: e.response.data.detail,
      });
    } finally {
      setLoading(false);
    }
  };

  return <Page type="outgoing" data={data} loading={loading} />;
}

export default Outgoing;
