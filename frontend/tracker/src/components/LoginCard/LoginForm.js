import React from "react";
import "./LoginCard.css";
import { Box } from "@chakra-ui/react";
import { Button, Form, Input } from "antd";
import { notification } from "antd";
import { useStateValue } from "../../store/StateProvider";
import * as actionTypes from "../../store/actionTypes";
import { auth_axios } from "../../utility/axios";
import { Link } from "react-router-dom";

function LoginForm({ loading, setLoading }) {
  const [store, dispatch] = useStateValue();

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const staff_id = values.email.trim();
      const password = values.password.trim();

      const credentials = JSON.stringify({ staff_id, password });

      const tokenRes = await auth_axios.post("/token/login/", credentials);

      if (tokenRes.status === 200) {
        dispatch({
          type: actionTypes.SET_TOKEN,
          payload: tokenRes.data.auth_token,
        });

        const config = {
          headers: {
            Authorization: `Token ${tokenRes.data.auth_token}`,
          },
        };

        const userRes = await auth_axios.get("/users/me/", config);

        if (userRes.status === 200) {
          dispatch({
            type: actionTypes.SET_USER,
            payload: userRes.data,
          });
        }
      }
    } catch (error) {
      return notification.error({
        message: "Error",
        description: `${error.response.data.non_field_errors[0]}`,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Box marginTop="15px">
        <Form name="normal_login" className="login-form" onFinish={onFinish}>
          <Form.Item
            name="email"
            rules={[
              {
                required: true,
                message: "Please input your Staff Number!",
              },
            ]}
          >
            <Input
              placeholder="staff number"
              style={{
                borderRadius: "5px",
                width: "90%",
                outlineColor: "var(--light-brown)",
              }}
            />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[
              {
                required: true,
                message: "Please input your password",
              },
            ]}
          >
            <Input.Password
              placeholder="password"
              style={{
                borderRadius: "5px",
                width: "90%",
                outlineColor: "var(--light-brown)",
              }}
            />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="login__btn"
              loading={loading}
            >
              Login
            </Button>
          </Form.Item>
        </Form>
        <p className="forgot__password">
          <Link to="/confirm-email">Forgot password?</Link>
        </p>
      </Box>
    </div>
  );
}

export default LoginForm;
