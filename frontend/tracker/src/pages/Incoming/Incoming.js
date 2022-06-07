import React, { useEffect, useState } from "react";
import Page from "../../components/Layout/Page";
import { fetchActivateDocument, fetchIncoming } from "../../http/document";
import useFetchData from "../../hooks/useFetchData";
import { notification } from "antd";
import { useStateValue } from "../../store/StateProvider";

function Incoming() {
  const [data, setData] = useState([]);
  const [store, dispatch] = useStateValue();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    console.log(store.newIncoming);
  }, [store.newIncoming]);

  const fetchData = async () => {
    try {
      const res = await fetchIncoming(store.token);
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

  return <Page type="incoming" data={data} loading={loading} />;
}

export default Incoming;
