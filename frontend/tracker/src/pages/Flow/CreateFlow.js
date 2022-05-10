import React, { useEffect, useState } from "react";
import "./Flow.css";
import { Form, Button, Space, Select, Input, InputNumber } from "antd";
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

    const reference = {
      reference: values.reference,
      last_increment: values.last_increment,
    };

    const references = [reference, ...values.references];

    const data = {
      references,
      flowName: values.flowName.trim(),
      users: values.users,
    };

    try {
      const res = await createFlow(store.token, data);
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
          <Box overflowY="auto" paddingRight="35px" flex="0.5">
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
              <Box display="flex" justifyContent="space-between">
                <Box flex="0.5" padding="15px">
                  <Form.Item
                    name="flowName"
                    rules={[
                      { required: true, message: "This field is required!" },
                    ]}
                    label="Name"
                    // style={{ width: "60%" }}
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
                                rules={[
                                  { required: true, message: "Add Action" },
                                ]}
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
                              <MinusCircleOutlined
                                onClick={() => remove(name)}
                              />
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
                                // width: "60%",
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
                </Box>

                {/* reference begins */}
                <Box flex="0.5" padding="15px" borderLeft="1px solid #f4f4f4">
                  <Box display="flex">
                    <Form.Item
                      name={["reference"]}
                      rules={[
                        {
                          required: true,
                          message: "Provide reference",
                        },
                      ]}
                      style={{
                        width: "34em",
                      }}
                      label="Reference"
                    >
                      <Input
                        placeholder="Reference"
                        // style={{ width: "80%" }}
                      />
                    </Form.Item>
                    <Form.Item
                      name={["last_increment"]}
                      style={{ width: "80%", marginLeft: "5px" }}
                      rules={[
                        {
                          required: true,
                          message: "Provide a value",
                        },
                      ]}
                      label="Last increment"
                    >
                      <InputNumber min={1} placeholder="Last increment" />
                    </Form.Item>
                  </Box>
                  <Form.List name="references">
                    {(fields, { add, remove }) => (
                      <>
                        {fields.map(({ key, name, ...restField }) => (
                          <Space
                            key={key}
                            style={{
                              display: "flex",
                              marginBottom: 8,
                            }}
                            align="baseline"
                          >
                            <Form.Item
                              {...restField}
                              name={[name, "reference"]}
                              rules={[
                                {
                                  required: true,
                                  message: "Provide reference",
                                },
                              ]}
                              style={{
                                width: "20em",
                              }}
                            >
                              <Input
                                placeholder="Reference"
                                // style={{ width: "80%" }}
                              />
                            </Form.Item>
                            <Form.Item
                              name={[name, "last_increment"]}
                              rules={[
                                {
                                  required: true,
                                  message: "Provide a value",
                                },
                              ]}
                            >
                              <InputNumber
                                min={1}
                                placeholder="Last increment"
                              />
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
                              display: "block",
                              // marginLeft: "auto",
                              backgroundColor: "var(--light-brown)",
                              color: "var(--white)",
                              border: "none",
                              width: "67%",
                            }}
                          >
                            Add Reference
                          </Button>
                        </Form.Item>
                      </>
                    )}
                  </Form.List>
                </Box>
              </Box>
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
