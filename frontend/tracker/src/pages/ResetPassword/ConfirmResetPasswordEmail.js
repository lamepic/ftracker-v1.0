import { Box, Text } from "@chakra-ui/react";
import { Button, Form, Input } from "antd";
import React, { useState } from "react";
import { Link } from "react-router-dom";

function ConfirmResetPasswordEmail() {
  const [loading, setLoading] = useState(false);

  const onFinish = () => {
    setLoading(true);
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
        <Text fontSize="2rem" textAlign="center">
          Reset Password
        </Text>

        <Text textAlign="center">
          Type a new password to reset old password.
        </Text>
        <Box w="70%" marginX="auto" marginTop="1rem">
          <Form name="normal_login" classNam e="login-form" onFinish={onFinish}>
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
        <Text textAlign="center" textDecoration="underline">
          <Link to="/">Back to login</Link>
        </Text>
      </Box>
    </Box>
  );
}

export default ConfirmResetPasswordEmail;
