import { CheckCircleOutlined } from "@ant-design/icons";
import { Box, Text } from "@chakra-ui/react";
import { Button, Form, Input, notification } from "antd";
import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { resetPassword } from "../../http/user";

function ResetPassword() {
  const [loading, setLoading] = useState(false);
  const [passwordResetSuccess, setPasswordResetSuccess] = useState(false);
  const { uid, token } = useParams();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const password = values.password;
      const re_new_password = values.confirmPassword;

      const data = {
        password,
        uid,
        token,
        re_new_password,
      };
      const res = await resetPassword(data);
      if (res.status === 204) {
        setPasswordResetSuccess(true);
      }
    } catch (e) {
      const { data } = e?.response;

      notification.error({
        message: "Error",
        description: data?.non_field_errors
          ? data?.non_field_errors[0]
          : data?.new_password[0],
      });
    } finally {
      setLoading(false);
    }
  };
  return (
    <Box
      h="100vh"
      display="grid"
      placeItems="center"
      bg="var(--semi-dark-brown)"
    >
      <Box
        w="40%"
        marginX="auto"
        padding="2rem"
        bg="var(--white)"
        borderRadius="8px"
      >
        {!passwordResetSuccess ? (
          <>
            <Text fontSize="2rem" textAlign="center">
              Reset Password
            </Text>

            <Text textAlign="center">
              Type a new password to reset old password.
            </Text>
            <Box w="70%" marginX="auto" marginTop="1rem">
              <Form
                name="normal_login"
                classNam
                e="login-form"
                onFinish={onFinish}
              >
                <Form.Item
                  name="password"
                  rules={[
                    {
                      required: true,
                      message: "Please input a password",
                    },
                  ]}
                >
                  <Input.Password
                    placeholder="password"
                    style={{
                      borderRadius: "5px",
                      outlineColor: "var(--light-brown)",
                    }}
                  />
                </Form.Item>
                <Form.Item
                  name="confirmPassword"
                  rules={[
                    {
                      required: true,
                      message: "Please input a password",
                    },
                  ]}
                >
                  <Input.Password
                    placeholder="confirm password"
                    style={{
                      borderRadius: "5px",
                      outlineColor: "var(--light-brown)",
                    }}
                  />
                </Form.Item>
                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    style={{
                      width: "60%",
                      margin: "auto",
                      display: "block",
                      marginTop: "10px",
                    }}
                  >
                    Reset
                  </Button>
                </Form.Item>
              </Form>
            </Box>
          </>
        ) : (
          <Box
            display="flex"
            alignItems="center"
            flexDirection="column"
            justifyContent="space-evenly"
          >
            <CheckCircleOutlined style={{ fontSize: "3rem", color: "green" }} />
            <Text fontSize="1.5rem" fontWeight="600" marginTop="10px">
              Password has been Reset Successfully
            </Text>
            <Text
              textAlign="center"
              textDecoration="underline"
              marginTop="10px"
            >
              <Link to="/">Back to login</Link>
            </Text>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default ResetPassword;
