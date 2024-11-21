import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import { Alert, Badge, Button, Card, Col, Container, Form, InputGroup, ListGroup, Row, Table } from 'react-bootstrap';
import { ICheckIn, ISummary, ITotals } from './types';
import { getCheckIns, getDurations, getTotals, saveCheckIn, storeCheckIns } from './storage';
import { useInterval } from './useIterval';

function App() {
  const [checkIns, setCheckIns] = useState<ICheckIn[]>()
  const [newCheckIn, setNewCheckIn] = useState<ICheckIn>({
    id: 1,
    label: "",
    time: new Date(),
    isActive: false
  });
  const [activeCheckIn, setActiveCheckIn] = useState<ICheckIn>();
  const [totals, setTotals] = useState<ISummary[]>();
  useEffect(() => {
    setCheckIns(getCheckIns())
  }, [])
  const handleSave = async () => {
    saveCheckIn({ ...newCheckIn, isActive: true, time: new Date() });
    setNewCheckIn({
      id: 1,
      label: "",
      time: new Date(),
      isActive: false
    })
    setCheckIns(getCheckIns())
    setActiveCheckIn(newCheckIn);
  }
  // useInterval(() => {
  //   setActiveCheckIn(prev => {
  //     const n = new Notification("Time to Check In", {
  //       body: `Still working on ${prev?.label}? (Dismiss to confirm)`
  //     });
  //     return prev;
  //   })
  // }, 15000);
  useEffect(() => {
    const i = setInterval(() => {
      handleGetDurations();
      handleGetTotals();
    }, 3000)
    const i2 = setInterval(() => {
      setActiveCheckIn(prev => {
        const n = new Notification("Time to Check In", {
          body: `Still working on ${prev?.label}? (Dismiss to confirm)`
        });
        return prev;
      })
      // handleShowNotification();
    }, 15000)
    return () => {
      clearInterval(i);
      clearInterval(i2);
    }
  }, [])
  const handleDelete = (id: number) => {
    const filteredCheckIns = checkIns?.filter(c => c.id != id);
    setCheckIns(filteredCheckIns);
    storeCheckIns(filteredCheckIns || []);
  }
  const handleAskNotificationPermission = () => {
    try {
      Notification.requestPermission().then();
    } catch (e) {
      console.error("no permission")
    }
    console.log("permission!")
  }
  const handleShowNotification = () => {
    const n = new Notification("Time to Check In", {
      body: `Still working on ${activeCheckIn?.label}? (Dismiss to confirm)`
    });
  }
  const handleGetDurations = () => {
    setCheckIns(getDurations());
  }
  const handleReCheckIn = (label: string) => {
    const tempCheckIn = { ...newCheckIn, isActive: true, time: new Date(), label }
    saveCheckIn(tempCheckIn);
    setActiveCheckIn(tempCheckIn)
    setCheckIns(getCheckIns())
  }
  const handleGetTotals = () => {
    setTotals(getTotals());
  }
  return (
    <div className="App">
      <header className="App-header">
        {/* <img src={logo} className="App-logo" alt="logo" /> */}
        <Container>
          <Row>
            <Col sm={12}>
              <Alert variant='light'>
                <h2>What are you working on?</h2>
              <ListGroup.Item>
                <InputGroup>
                  <Form.Control value={newCheckIn?.label} onChange={(e) => setNewCheckIn({ ...newCheckIn, label: e.target.value })} />
                  <Button onClick={handleSave}>Save</Button>
                </InputGroup>
              </ListGroup.Item>
              </Alert>
              
              <ListGroup.Item>
                <Button onClick={handleAskNotificationPermission}>Request Permissions</Button>
                <Button onClick={handleShowNotification}>Show Notification</Button>
                <Button onClick={handleGetDurations}>Durations</Button>
                <Button onClick={handleGetTotals}>Totals</Button>
              </ListGroup.Item>
            </Col>
          </Row>
          <Row>
            <Col sm={8}>
              <h3>Check Ins</h3>
              {checkIns?.sort((a, b) => b.time > a.time ? 1 : -1).map(c =>
                <Card key={c.id} className='mb-3'>
                  <Card.Body>
                    <Card.Title>
                      {c.label}
                    </Card.Title>
                    <Card.Text>
                      {c.isActive &&
                        <Badge bg="success">Active</Badge>
                      }
                      {c.duration && c.duration > 0 &&
                        <Badge bg="primary">{c.duration} minutes</Badge>
                      }
                      <Badge bg="secondary">Since {new Date(c.time).toLocaleTimeString()}</Badge>
                    </Card.Text>
                    <Button variant='danger' onClick={() => handleDelete(c.id)}>Delete</Button>
                    <Button onClick={() => handleReCheckIn(c.label)}>I'm working on this again</Button>
                  </Card.Body>
                </Card>
              )}
            </Col>
            <Col sm={4}>
            <h3>Totals</h3>
              {totals &&
                <Table striped hover>
                  <thead>
                    <tr>
                      <th>Activity</th>
                      <th>Check ins</th>
                      <th>Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {totals.map(t =>
                      <tr>
                        <td>{t.label}</td>
                        <td>{t.checkInCount}</td>
                        <td>{t.duration} minutes</td>
                      </tr>
                    )}

                  </tbody>
                </Table>
              }
            </Col>
          </Row>




        </Container>
      </header>
    </div>
  );
}

export default App;
