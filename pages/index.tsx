import { notification, Button, Input, Form, Spin, Layout, Row, Col, Typography } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import {useState} from "react";
import type { NextPage } from 'next';
import Link from 'next/link';
import { startRegistration } from "@simplewebauthn/browser";

const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;
const { Header, Footer, Content } = Layout;

const Home: NextPage = () => {
  return (
    <Layout>
      <Row>
        <Col span={12} offset={6}>
          <Header style={{ background: "none", padding: "1rem", height: "5.5rem" }}>
            <h1>WebAuthn</h1>
          </Header>
        </Col>
      </Row>
      <Content>
        <Col span={12} offset={6}>
          <ul>
            <li>
              <Link href="/register">
                <a>Register a new account</a>
              </Link>
            </li>
            <li>
              <Link href="/login">
                <a>Login</a>
              </Link>
            </li>
            <li>
              <Link href="/sign">
                <a>Sign a message</a>
              </Link>
            </li>
          </ul>
        </Col>
      </Content>
      <Footer style={{ textAlign: 'center' }}>Source code - <a href="https://github.com/ngo275/WebAuthnNextjs" target="_blank" rel="noreferrer">GitHub</a></Footer>
    </Layout>
  );
};

export default Home;
