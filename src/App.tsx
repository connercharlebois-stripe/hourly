import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import { Badge, Button, Card, Container, Form, InputGroup, ListGroup } from 'react-bootstrap';
import { ICheckIn } from './types';
import { getCheckIns, getDurations, saveCheckIn, storeCheckIns } from './storage';

function App() {
  const [checkIns, setCheckIns] = useState<ICheckIn[]>()
  const [newCheckIn, setNewCheckIn] = useState<ICheckIn>({
    id: 1,
    label: "",
    time: new Date()
  });
  const [activeCheckIn, setActiveCheckIn] = useState<ICheckIn>();
  useEffect(() => {
    setCheckIns(getCheckIns())
  }, [])
  const handleSave = async () => {
    await setNewCheckIn(prev => ({
      ...prev,
      time: new Date()
    }));
    saveCheckIn(newCheckIn);
    setNewCheckIn({
      id: 1,
      label: "",
      time: new Date()
    })
    setCheckIns(getCheckIns())
    setActiveCheckIn(newCheckIn);
  }
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
      body: "Still working on XXXX? (Dismiss to confirm)"
    });
  }
  const handleGetDurations = () => {
    setCheckIns(getDurations());
  }
  return (
    <div className="App">
      <header className="App-header">
        {/* <img src={logo} className="App-logo" alt="logo" /> */}
        <Container>
          {checkIns?.sort((a, b) => b.time > a.time ? 1 : -1).map(c =>
            <Card key={c.id}>
              <Card.Body>
                <Card.Title>
                  {c.label}
                </Card.Title>
                <Card.Text>
                  {c.label === activeCheckIn?.label &&
                    <Badge bg="success">Active</Badge>
                  }
                  {c.duration && 
                  <Badge bg="primary">{c.duration} minutes</Badge>
                  }
                  <Badge bg="secondary">Since {new Date(c.time).toLocaleTimeString()}</Badge>
                </Card.Text>
                <Button variant='danger' onClick={() => handleDelete(c.id)}>Delete</Button>
              </Card.Body>
            </Card>
          )}
          <ListGroup.Item>
            <Form.Text>What are you working on?</Form.Text>
            <InputGroup>
              <Form.Control value={newCheckIn?.label} onChange={(e) => setNewCheckIn({ ...newCheckIn, label: e.target.value })} />
              <Button onClick={handleSave}>Save</Button>
            </InputGroup>
          </ListGroup.Item>
          <ListGroup.Item>
            <Button onClick={handleAskNotificationPermission}>Request Permissions</Button>
            <Button onClick={handleShowNotification}>Show Notification</Button>
            <Button onClick={handleGetDurations}>Durations</Button>

          </ListGroup.Item>
        </Container>
      </header>
    </div>
  );
}

export default App;
