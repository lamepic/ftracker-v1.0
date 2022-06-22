import React, { useEffect, useState } from "react";
import "./Flow.css";
import {
  Form,
  Button,
  Space,
  Select,
  Input,
  InputNumber,
  notification,
} from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { loadUsers } from "../../http/user";
import { useStateValue } from "../../store/StateProvider";
import { useHistory } from "react-router-dom";
import { createFlow } from "../../http/document";
import Loading from "../../components/Loading/Loading";
import { Box } from "@chakra-ui/react";
const { Option } = Select;

function Flow() {
  const [store, dispatch] = useStateValue();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

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
    setSubmitting(true);
    if (values.users === 0) {
      return notification.error({
        message: "Error",
        description: "Add users",
      });
    }

    const reference = {
      reference: values.reference,
      last_increment: values.last_increment,
    };

    const form_references =
      values.references === undefined ? [] : values.references;

    const references = [reference, ...form_references].map((reference) => {
      if (reference.last_increment === undefined) {
        reference.last_increment = 0;
      }
      return reference;
    });

    const data = {
      references,
      flowName: values.flowName.trim(),
      users: values.users,
    };

    try {
      const res = await createFlow(store.token, data);
      if (res.status === 200) {
        form.resetFields();
        return notification.success({
          message: "Success",
          description: "Flow Created",
        });
      }
    } catch (e) {
      return notification.error({
        message: "Error",
        description: e.response.data.detail,
      });
    } finally {
      setSubmitting(false);
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
                                backgroundColor: "#00526E",
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
                        backgroundColor: "#00526E",
                        color: "var(--white)",
                        border: "none",
                      }}
                      loading={submitting}
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
                        placeholder="eg. AAA/BBB/CCC"
                        // style={{ width: "80%" }}
                      />
                    </Form.Item>
                    <Form.Item
                      name={["last_increment"]}
                      style={{ width: "80%", marginLeft: "5px" }}
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
                                placeholder="eg. AAA/BBB/CCC"
                                // style={{ width: "80%" }}
                              />
                            </Form.Item>
                            <Form.Item name={[name, "last_increment"]}>
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
                              backgroundColor: "#00526E",
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
