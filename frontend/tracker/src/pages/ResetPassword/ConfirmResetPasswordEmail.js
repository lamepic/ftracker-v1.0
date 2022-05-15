import { Box, Text } from "@chakra-ui/react";
import { Button, Form, Input, notification } from "antd";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { confirmEmail } from "../../http/user";

function ConfirmResetPasswordEmail() {
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [email, setEmail] = useState("");

  const onFinish = async (values) => {
    setLoading(true);
    const _email = values.email.trim();
    setEmail(_email);
    try {
      const res = await confirmEmail(_email);
      if (res.status === 204) {
        setEmailSent(true);
      }
    } catch (e) {
      console.log(e.response);
      notification.error({
        message: "Error",
        description: e.response.data.detail,
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
        {!emailSent ? (
          <>
            <Text fontSize="2rem" textAlign="center">
              Confirm Email
            </Text>

            <Text textAlign="center">
              Forgot your account’s password or having trouble logging into your
              account? Enter your email address and we’ll send you a recovery
              link.
            </Text>
            <Box w="70%" marginX="auto" marginTop="1rem">
              <Form
                name="normal_login"
                classNam
                e="login-form"
                onFinish={onFinish}
              >
                <Form.Item
                  name="email"
                  rules={[
                    {
                      required: true,
                      message: "Please input your email",
                    },
                  ]}
                >
                  <Input
                    placeholder="Email"
                    style={{
                      borderRadius: "5px",
                      outlineColor: "var(--light-brown)",
                    }}
                    type="email"
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
                    Send Reset Link
                  </Button>
                </Form.Item>
              </Form>
            </Box>
            <Text textAlign="center" textDecoration="underline">
              <Link to="/">Back to login</Link>
            </Text>
          </>
        ) : (
          <Box>
            <Text fontSize="1.5rem" fontWeight="600">
              Account recovery email sent to {email}
            </Text>
            <Text marginTop="20px">
              If you don’t see this email in your inbox within 15 minutes, look
              for it in your junk mail folder. If you find it there, please mark
              it as “Not Junk”.
            </Text>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default ConfirmResetPasswordEmail;
