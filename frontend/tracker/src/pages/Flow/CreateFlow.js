import React, { useEffect, useState } from "react";
import "./Flow.css";
import { Form, Button, Space, Select, Input } from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { loadUsers } from "../../http/user";
import { useStateValue } from "../../store/StateProvider";
import { useHistory } from "react-router-dom";
import { createFlow } from "../../http/document";
import Loading from "../../components/Loading/Loading";
import { Box } from "@chakra-ui/react";
import { openNotificationWithIcon } from "../../utility/helper";
const { Option } = Select;

function Flow() {
  const [store, dispatch] = useStateValue();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const res = await loadUsers(store.token);
    const data = res.data;
    setEmployees(data);
    setLoading(false);
  };

  const onFinish = async (values) => {
    if (values.users === 0) {
      return openNotificationWithIcon("error", "Error", "Add flow");
    }

    try {
      const res = await createFlow(store.token, values);
      if (res.status === 200) {
        form.resetFields();
        openNotificationWithIcon("success", "Success", "Flow Created");
      }
    } catch (e) {
      openNotificationWithIcon("error", "Error", e.response.data.detail);
    }
  };

  return (
    <div>
      {!loading ? (
        <>
          <Box maxW="450px" maxH="65vh" overflowY="auto" paddingRight="35px">
            <Form
              name="dynamic_form_nest_item"
              onFinish={onFinish}
              autoComplete="off"
              style={{
                marginTop: "10px",
              }}
              form={form}
              requiredMark={false}
              layout="vertical"
            >
              <Form.Item
                name="flowName"
                rules={[{ required: true, message: "This field is required!" }]}
                label="Name"
              >
                <Input />
              </Form.Item>
              <Box marginTop="20px">
                <Form.List
                  name="users"
                  rules={[
                    {
                      validator: async (_, names) => {
                        if (!names || names.length < 0) {
                          return Promise.reject(
                            new Error("Add at least 2 flows")
                          );
                        }
                      },
                    },
                  ]}
                >
                  {(fields, { add, remove }, { errors }) => (
                    <>
                      {fields.map(({ key, name, ...restField }) => (
                        <Space
                          key={key}
                          style={{ display: "flex", marginBottom: 8 }}
                          align="baseline"
                        >
                          <Form.Item
                            {...restField}
                            name={[name, "employee"]}
                            rules={[
                              { required: true, message: "Add Employee" },
                            ]}
                            style={{ width: "200px" }}
                          >
                            <Select
                              showSearch
                              placeholder="Select a Employee"
                              optionFilterProp="children"
                              filterOption={(input, option) =>
                                option.children
                                  .toLowerCase()
                                  .indexOf(input.toLowerCase()) >= 0
                              }
                            >
                              {employees.map((employee) => {
                                return (
                                  <Option
                                    value={employee.staff_id}
                                    key={employee.staff_id}
                                  >
                                    {`${employee.first_name} ${employee.last_name}`}
                                  </Option>
                                );
                              })}
                            </Select>
                          </Form.Item>
                          <Form.Item
                            {...restField}
                            name={[name, "action"]}
                            rules={[{ required: true, message: "Add Action" }]}
                            style={{ width: "200px" }}
                          >
                            <Select
                              showSearch
                              placeholder="Select action"
                              optionFilterProp="children"
                              filterOption={(input, option) =>
                                option.children
                                  .toLowerCase()
                                  .indexOf(input.toLowerCase()) >= 0
                              }
                            >
                              <Option value="forward">Forward</Option>
                            </Select>
                          </Form.Item>
                          <MinusCircleOutlined onClick={() => remove(name)} />
                        </Space>
                      ))}
                      <Form.Item>
                        <Button
                          type="dashed"
                          onClick={() => add()}
                          block
                          icon={<PlusOutlined />}
                          style={{
                            backgroundColor: "var(--light-brown)",
                            color: "var(--white)",
                            border: "none",
                            marginTop: "15px",
                          }}
                        >
                          Add flow
                        </Button>
                        <Form.ErrorList errors={errors} />
                      </Form.Item>
                    </>
                  )}
                </Form.List>
              </Box>
              <Form.Item>
                <Button
                  htmlType="submit"
                  style={{
                    display: "block",
                    marginLeft: "auto",
                    backgroundColor: "var(--light-brown)",
                    color: "var(--white)",
                    border: "none",
                  }}
                >
                  Submit
                </Button>
              </Form.Item>
            </Form>
          </Box>
        </>
      ) : (
        <Loading />
      )}
    </div>
  );
}

export default Flow;
