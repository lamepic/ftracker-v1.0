import { Box, Text } from "@chakra-ui/react";
import { Collapse, Table } from "antd";
import React, { useEffect, useState } from "react";
import { fetchFlow } from "../../http/document";
import { useStateValue } from "../../store/StateProvider";
import { openNotificationWithIcon } from "../../utility/helper";
import { EditOutlined } from "@ant-design/icons";

function FlowList({ activeTab }) {
  const [store, dispatch] = useStateValue();
  const [flows, setFlows] = useState([]);

  useEffect(() => {
    if (activeTab === "manage") {
      getFlow();
    }
  }, [activeTab]);

  const getFlow = async () => {
    try {
      const res = await fetchFlow(store.token);
      setFlows(res.data);
    } catch (e) {
      openNotificationWithIcon("error", "Error", e.response.data.detail);
    }
  };

  const callback = (key) => {};

  const genExtra = () => (
    <EditOutlined
      onClick={(event) => {
        event.stopPropagation();
      }}
    />
  );

  return (
    <Box
      maxW="450px"
      maxH={{ sm: "90vh", lg: "65vh" }}
      overflowY="auto"
      paddingRight="10px"
    >
      {flows.length > 0 ? (
        <Collapse onChange={callback} accordion>
          {flows.map((flow) => {
            const { id, name, document_action } = flow;

            const data = document_action.map((item) => {
              const { action, user, id } = item;
              const name = `${user.first_name} ${user.last_name}`;
              const actionText =
                action.toLowerCase() === "f" ? "Forward" : "Copy";
              return { actionText, name, key: id };
            });

            const columns = [
              { title: "Name", dataIndex: "name", key: "name" },
              {
                title: "Action",
                dataIndex: "actionText",
                key: "actionText",
              },
            ];

            return (
              <Collapse.Panel header={name} key={id} extra={genExtra()}>
                <Table columns={columns} dataSource={data} />
              </Collapse.Panel>
            );
          })}
        </Collapse>
      ) : (
        <Box>
          <Text
            as="h2"
            fontSize="1.5rem"
            color="var(--dark-brown)"
            fontWeight="600"
            marginTop="20px"
          >
            No Flows to Manage
          </Text>
        </Box>
      )}
    </Box>
  );
}

export default FlowList;
