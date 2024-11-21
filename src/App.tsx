import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import { Alert, Badge, Button, ButtonGroup, Card, Col, Container, Form, InputGroup, ListGroup, Row, Table } from 'react-bootstrap';
import { ICheckIn, ISummary, ITotals } from './types';
import { getCheckIns, getDurations, getTotals, saveCheckIn, storeCheckIns } from './storage';
import { useInterval } from './useIterval';
import CheckInListItem from './components/CheckInListItem';
import { ChevronBarLeft, ChevronCompactLeft, ChevronDoubleLeft, ChevronDoubleRight } from 'react-bootstrap-icons';

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
  const [timeViewDay, setTimeViewDay] = useState<Date>();
  useEffect(() => {
    setCheckIns(getCheckIns())
    const beginOfDay = new Date();
    beginOfDay.setHours(0);
    beginOfDay.setMinutes(0);
    beginOfDay.setSeconds(0);
    beginOfDay.setMilliseconds(0);
    setTimeViewDay(beginOfDay);
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
    }, 1000 * 60 * 5)
    const i2 = setInterval(() => {
      setActiveCheckIn(prev => {
        const n = new Notification("Time to Check In", {
          body: `Still working on ${prev?.label}? (Dismiss to confirm)`
        });
        return prev;
      })
      // handleShowNotification();
    }, 1000 * 60 * 20)
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
  const handleChangeTimeViewDay = (forward: boolean) => {
    const start = timeViewDay;
    start?.setDate(start.getDate() + (forward ? 1 : -1));
    if (start){
      setTimeViewDay(new Date(start));
    }
  }
  const minutesToNearestHalfHours = (min: number) : number => {
    return Math.ceil(min/30) * .5
  }
  const isOnSameDate = (c: Date, d: Date) :boolean => {
    if (!c || !d){
      return false
    }
    return c.toDateString() === d.toDateString();
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
            <Col sm={12}>

              <ButtonGroup>
                <Button onClick={() => handleChangeTimeViewDay(false)}><ChevronDoubleLeft /></Button>
                <Button>
                  {timeViewDay?.toDateString()}
                </Button>
                <Button onClick={() => handleChangeTimeViewDay(true)}><ChevronDoubleRight /></Button>
              </ButtonGroup>
            </Col>
          </Row>
          <Row>
            <Col sm={8}>
              <h3>Check Ins</h3>
              {checkIns?.filter(c => isOnSameDate(new Date(c.time), timeViewDay!)).sort((a, b) => b.time > a.time ? 1 : -1).map(c =>
                <CheckInListItem
                  checkIn={c}
                  onDelete={(n) => handleDelete(n)}
                  onReCheckIn={(s) => handleReCheckIn(s)}
                />
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
                    {totals.filter(t => isOnSameDate(new Date(t.date), timeViewDay!)).sort((a,b) => b.duration - a.duration).map(t =>
                      <tr>
                        <td>{t.label}</td>
                        <td>{t.checkInCount}</td>
                        <td>{minutesToNearestHalfHours(t.duration)} h<br/><span className='text-muted small'>({t.duration} minutes)</span></td>
                      </tr>
                    )}

                  </tbody>
                  <tfoot>
                    <tr>
                        <td>Total</td>
                        <td></td>
                        <td>{checkIns?.map(c => minutesToNearestHalfHours(c.duration!)).reduce((prev, curr) => prev! + curr!,0)}
                          <br/>
                          <span className='text-muted small'>({minutesToNearestHalfHours(checkIns?.map(c => c.duration!).reduce((prev, curr) => prev + curr,0)!)} actual)</span></td>
                      </tr>
                  </tfoot>
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
