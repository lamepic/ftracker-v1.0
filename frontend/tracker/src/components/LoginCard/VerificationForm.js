import React from "react";
import "./LoginCard.css";
import { Box } from "@chakra-ui/react";
import { Form, Input } from "antd";
import { userEmail, verificationToken } from "../../http/auth";
import { notification } from "antd";

function VerificationForm({
  setSentVerificationToken,
  setVerifiedEmail,
  setLoading,
}) {
  const onFinish = (values) => {
    const staff_id = values.staff_id;
    _userEmail(staff_id);
  };

  const _userEmail = async (staff_id) => {
    try {
      setSentVerificationToken(false);
      setLoading(true);
      const res = await userEmail(staff_id);
      const email = res.data.email;

      if (res.status === 200) {
        const res = await verificationToken(email);
        setSentVerificationToken(true);
        setVerifiedEmail(email);
      }
      setLoading(false);
    } catch (e) {
      const errorMessage =
        e.message.toLowerCase() === "network error"
          ? e.message
          : e.response.data.detail;
      notification.error({
        message: errorMessage,
        description: "Login failed check internet connection.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Box marginTop="20px">
        <Form name="normal_login" className="login-form" onFinish={onFinish}>
          <Form.Item
            name="staff_id"
            rules={[
              {
                required: true,
                message: "Please input your Staff Number!",
              },
            ]}
          >
            <Input
              placeholder="Enter Staff Number"
              style={{
                borderRadius: "5px",
                width: "90%",
                outlineColor: "var(--light-brown)",
              }}
            />
          </Form.Item>
          <Form.Item>
            <button type="submit" className="verification__btn">
              Get Verification Token
            </button>
          </Form.Item>
        </Form>
      </Box>
    </div>
  );
}

export default VerificationForm;
