import { notification, Button, Input, Form, Spin, Typography } from 'antd'
import { LoadingOutlined } from '@ant-design/icons';
import {useState} from "react";
import type { NextPage } from 'next'
import { startRegistration } from "@simplewebauthn/browser"
import Head from 'next/head'
// import Image from 'next/image'
import styles from '../styles/Home.module.css'
// import useSWR from 'swr'

const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

const Home: NextPage = () => {
  const [loading, setLoading] = useState(false)
  const [option, setOption] = useState(null)
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
    const email = values["email"] as string
    handleStart(email)
  };

  const handleStart = (email: string) => {
    setLoading(true);
    fetch(`api/auth/start-registration?email=${email}`)
      .then((res) => res.json())
      .then((data) => {
        console.log(data)
        startRegistration(data)
          .then((attRes) => {
            fetch('api/auth/register', {
              method: "POST",
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ ...attRes, email }),
            })
              .then((res) => res.json())
              .then((result) => {
                console.log(result)
                setLoading(false)
                openNotification("Your account has been successfully registered", true)
              })
              .catch((e) => {
                console.log(e)
                setLoading(false)
                openNotification("Registration failed")
              })
          })
          .catch((e) => {
            console.log(e)
            setLoading(false)
            openNotification("Authentication with your security key failed")
          })
      })
      .catch((e) => {
        console.log(e)
        setLoading(false)
        openNotification("Failed preparing for registration")
      })
  }

  return (
    <Spin indicator={antIcon} spinning={loading}>
      <h1>WebAuthn Test</h1>
      <Form
        form={form}
        name="register"
        onFinish={onFinish}
        scrollToFirstError
      >
        <Form.Item
          name="email"
          label="Email"
          rules={[
            {
              type: 'email',
              message: 'The input is not valid',
            },
            {
              required: true,
              message: 'Please input your Email',
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
          <Button type="primary" htmlType="submit">
            Register
          </Button>
        </Form.Item>
      </Form>
    </Spin>
  )
}

export default Home
