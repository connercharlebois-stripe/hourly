import { useEffect, useState } from 'react';
import { Alert, Button, ButtonGroup, Col, Container, Form, InputGroup, ListGroup, Offcanvas, Row, Table } from 'react-bootstrap';
import { ArrowClockwise, ChevronDoubleLeft, ChevronDoubleRight, GearFill } from 'react-bootstrap-icons';
import './App.css';
import CheckInList from './components/CheckInList';
import { deleteCheckIn, getCheckInsOnDate, getDurations, getTotals, saveCheckIn } from './storage';
import { ICheckIn, ISummary } from './types';
import { getBeginOfToday, isOnSameDate } from './util/dates';
import Settings from './components/SettingsView';
import SettingsView from './components/SettingsView';
import customConfirm from './util/customConfirm';

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
  const [timeViewDay, setTimeViewDay] = useState<Date>(getBeginOfToday());
  const [showSettings, setShowSettings] = useState<boolean>(false);
  useEffect(() => {
    setCheckIns(getCheckInsOnDate(timeViewDay))
  }, [])
  const handleSave = async () => {
    saveCheckIn({ ...newCheckIn, isActive: true, time: new Date() });
    setNewCheckIn({
      id: 1,
      label: "",
      time: new Date(),
      isActive: false
    })
    setCheckIns(getCheckInsOnDate(timeViewDay))
    setActiveCheckIn(newCheckIn);
  }

  useEffect(() => {
    const i = setInterval(handleRefresh, 1000 * 60 * 5)
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
  const handleRefresh = () => {
    console.log(`updating durations at ${new Date().toTimeString()}`)
    setCheckIns(getDurations(timeViewDay));
    setTotals(getTotals(timeViewDay));
  }
  const handleDelete = (c: ICheckIn) => {
    customConfirm(`delete this ${c.duration}min check-in for ${c.label}`, () => {
      deleteCheckIn(c.id);
      setCheckIns(getCheckInsOnDate(timeViewDay))
    })
  }

  // const handleGetDurations = () => {
  //   console.log(`updating durations at ${new Date().toTimeString()}`)
  //   setCheckIns(getDurations(timeViewDay));
  // }
  const handleReCheckIn = (label: string) => {
    const tempCheckIn = { ...newCheckIn, isActive: true, time: new Date(), label }
    saveCheckIn(tempCheckIn);
    setActiveCheckIn(tempCheckIn)
    setCheckIns(getCheckInsOnDate(timeViewDay))
  }
  // const handleGetTotals = () => {
  //   setTotals(getTotals(timeViewDay));
  // }
  const handleChangeTimeViewDay = (forward: boolean) => {
    const start = timeViewDay;
    start?.setDate(start.getDate() + (forward ? 1 : -1));
    const d = new Date(start);
    if (start) {
      setTimeViewDay(d);
      setCheckIns(getCheckInsOnDate(d))
    }
  }
  const minutesToNearestHalfHours = (min: number): number => {
    return Math.ceil(min / 30) * .5
  }
  const toggleSettings = () => setShowSettings(!showSettings);
  return (
    <div className="App">
      {/* <header className="App-header"> */}
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
          </Col>
        </Row>
        <Row>
          <Col sm={12} className='d-flex justify-content-between'>

            <ButtonGroup>
              <Button onClick={() => handleChangeTimeViewDay(false)}><ChevronDoubleLeft /></Button>
              <Button>
                {timeViewDay?.toDateString()}
              </Button>
              <Button onClick={() => handleChangeTimeViewDay(true)}><ChevronDoubleRight /></Button>
            </ButtonGroup>
            <Button onClick={toggleSettings}><GearFill /> Settings</Button>
          </Col>
        </Row>
        <Row>
          <Col sm={8}>
            <h3>Check Ins</h3>
            {checkIns &&
              <CheckInList
                checkIns={checkIns}
                onDelete={handleDelete}
                onReCheckIn={handleReCheckIn}
              />
            }
          </Col>
          <Col sm={4}>
            <h3>Totals <Button variant='link' onClick={handleRefresh}><ArrowClockwise /></Button></h3>
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
                  {totals.filter(t => isOnSameDate(new Date(t.date), timeViewDay!)).sort((a, b) => b.duration - a.duration).map(t =>
                    <tr key={t.label}>
                      <td>{t.label}</td>
                      <td>{t.checkInCount}</td>
                      <td>{minutesToNearestHalfHours(t.duration)} h<br /><span className='text-muted small'>({t.duration} minutes)</span></td>
                    </tr>
                  )}

                </tbody>
                <tfoot>
                  <tr>
                    <td>Total</td>
                    <td></td>
                    <td>{checkIns?.map(c => minutesToNearestHalfHours(c.duration!)).reduce((prev, curr) => prev! + curr!, 0)}
                      <br />
                      <span className='text-muted small'>({minutesToNearestHalfHours(checkIns?.map(c => c.duration!).reduce((prev, curr) => prev + curr, 0)!)} actual)</span></td>
                  </tr>
                </tfoot>
              </Table>
            }
          </Col>
        </Row>




      </Container>


      <Offcanvas placement='end' show={showSettings} onHide={toggleSettings}>
        <Offcanvas.Header closeButton><h2>Settings</h2></Offcanvas.Header>
        <Offcanvas.Body>

          <SettingsView
            onRefresh={handleRefresh}
          />




        </Offcanvas.Body>

      </Offcanvas>
    </div>
  );
}

export default App;
