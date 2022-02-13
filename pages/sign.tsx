import { notification, Button, Input, Form, Spin, Layout, Row, Col } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import {useState} from "react";
import type { NextPage } from 'next';
import { startAuthentication } from "@simplewebauthn/browser";
import { PublicKeyCredentialRequestOptionsJSON } from '@simplewebauthn/typescript-types';
import {RP_ID} from "../utils/constants";
import base64url from "base64url";

const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;
const { Header, Footer, Content } = Layout;

const SignPage: NextPage = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const openNotification = (message: string, success?: boolean) => {
    if (success) {
      notification['success']({
        message: 'Success',
        description: message,
        onClick: () => {
          console.log('Notification Clicked!');
        },
      });
    } else {
      notification['error']({
        message: 'Error occurred',
        description: message,
        onClick: () => {
          console.log('Notification Clicked!');
        },
      });
    }
  };

  const onFinish = (values: any) => {
    console.log('Received values of form: ', values);
    const message = values["message"] as string;
    handleStart(message);
  };

  const handleStart = (message: string) => {
    setLoading(true);

    const challenge = base64url(message);
    const option: PublicKeyCredentialRequestOptionsJSON = {
      challenge,
      allowCredentials: [
        {
          id: "AT1iZ0PJcOAAnSAABStG4rTz0KAoXCNvmhAip_otzOqA1j0-Urg43RHHiuVnUUUJJMJUMq6JamcgZjfZiw0_1zx25IwYtVhEFA",
          transports: ["internal"],
          type: "public-key"
        },
      ],
      rpId: RP_ID,
      timeout: 60000,
      userVerification: "preferred"
    };
    startAuthentication(option)
      .then((attRes) => {
        console.log(attRes.response.signature);
      })
      .catch((e) => {
        console.log(e);
        setLoading(false);
        openNotification("Signing failed");
        // openNotification(e.message)
      });
  };

  return (
    <Spin indicator={antIcon} spinning={loading}>
      <Layout>
        <Row>
          <Col span={12} offset={6}>
            <Header style={{ background: "none", padding: "1rem", height: "5.5rem" }}>
              <h1>Sign a message</h1>
            </Header>
          </Col>
        </Row>
        <Content>
          <Row>
            <Col span={12} offset={6}>
              <Form
                form={form}
                name="register"
                onFinish={onFinish}
                scrollToFirstError
              >
                <Form.Item
                  name="message"
                  label="Message"
                  rules={[
                    {
                      required: true,
                      message: 'Please input your Email',
                    },
                  ]}
                >
                  <Input />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit" block>
                    Submit
                  </Button>
                </Form.Item>
              </Form>
            </Col>
          </Row>
        </Content>
        <Footer style={{ textAlign: 'center' }}>Source code - <a href="https://github.com/ngo275/WebAuthnNextjs" target="_blank" rel="noreferrer">GitHub</a></Footer>
      </Layout>
    </Spin>
  );
};

export default SignPage;
