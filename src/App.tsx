import { useEffect, useRef, useState } from 'react';
import { Alert, Button, ButtonGroup, Col, Container, InputGroup, ListGroup, Offcanvas, Row, Table } from 'react-bootstrap';
import { ArrowClockwise, ChevronDoubleLeft, ChevronDoubleRight, GearFill } from 'react-bootstrap-icons';
import { Typeahead } from 'react-bootstrap-typeahead';
import CheckIn from './api/CheckIn';
import './App.css';
import CheckInList from './components/CheckInList';
import SettingsView from './components/SettingsView';
import { getDurations, getTotals } from './storage';
import { ICheckIn, ISummary } from './types';
import customConfirm from './util/customConfirm';
import { getBeginOfToday, isOnSameDate } from './util/dates';

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
  const [allCheckIns, setAllCheckIns] = useState<ICheckIn[]>();
  const typeaheadRef = useRef(null);
  useEffect(() => {
    setCheckIns(CheckIn.get.onDate(timeViewDay))
    setAllCheckIns(CheckIn.get.distinct());
  }, [])
  const handleSave = async () => {
    CheckIn.create({ ...newCheckIn, isActive: true, time: new Date() });
    setNewCheckIn({
      id: 1,
      label: "",
      time: new Date(),
      isActive: false
    })
    setCheckIns(CheckIn.get.onDate(timeViewDay))
    setActiveCheckIn(newCheckIn);
    setAllCheckIns(CheckIn.get.distinct());
  }

  useEffect(() => {
    const i = setInterval(handleRefresh, 1000 * 60 * 5)
    const i2 = setInterval(() => {
      setActiveCheckIn(prev => {
        const n = new Notification("Time to Check In", {
          body: `Still working on ${prev?.label}? (Dismiss to confirm)`,
        });
        n.onclick = () => {
          console.log("clicked");
          //@ts-ignore
          typeaheadRef.current?.focus();
        }
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
      CheckIn.del(c.id);
      setCheckIns(CheckIn.get.onDate(timeViewDay))
    })
  }

  // const handleGetDurations = () => {
  //   console.log(`updating durations at ${new Date().toTimeString()}`)
  //   setCheckIns(getDurations(timeViewDay));
  // }
  const handleReCheckIn = (label: string) => {
    const tempCheckIn = { ...newCheckIn, isActive: true, time: new Date(), label }
    CheckIn.create(tempCheckIn);
    setActiveCheckIn(tempCheckIn)
    setCheckIns(CheckIn.get.onDate(timeViewDay))
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
      setCheckIns(CheckIn.get.onDate(d))
    }
  }
  const handleChangeViewDayToToday = () => {
    const d = new Date();
    setTimeViewDay(d);
    setCheckIns(CheckIn.get.onDate(d))
  }
  const minutesToNearestHalfHours = (min: number): number => {
    return Math.ceil(min / 30) * .5
  }
  const toggleSettings = () => setShowSettings(!showSettings);
  return (
    <div className="App">
      {/* <header className="App-header"> */}
      <Container className='mt-3'>
        <Row>
          <Col sm={12}>
            <Alert variant='light'>
              <h2>What are you working on?</h2>
              <ListGroup.Item>
                <InputGroup>
                  <Typeahead
                    className='flex-grow-1'
                    id="checkin-options"
                    selected={[newCheckIn]}
                    options={allCheckIns ?? []}
                    labelKey={"label"}
                    onChange={(selected) => {
                      if (selected.length < 1) {
                        return
                      }
                      console.log({ selected })
                      //@ts-ignore
                      setNewCheckIn({ ...newCheckIn, label: selected[0].label })
                    }}
                    allowNew
                    newSelectionPrefix="Add new: "
                    onInputChange={(text) => {
                      setNewCheckIn({ ...newCheckIn, label: text })
                    }}
                    size="lg"
                    ref={typeaheadRef}
                    maxResults={3}
                  />
                  {/* <Form.Control value={newCheckIn?.label} onChange={(e) => setNewCheckIn({ ...newCheckIn, label: e.target.value })} /> */}
                  <Button size="lg" onClick={handleSave}>Save</Button>
                </InputGroup>
              </ListGroup.Item>
            </Alert>
          </Col>
        </Row>
        <Row>
          <Col sm={12} className='d-flex justify-content-between'>

            <ButtonGroup>
              <Button onClick={() => handleChangeTimeViewDay(false)}><ChevronDoubleLeft /></Button>
              <Button onClick={handleChangeViewDayToToday}>
                {timeViewDay?.toDateString()}
              </Button>
              <Button onClick={() => handleChangeTimeViewDay(true)}><ChevronDoubleRight /></Button>
            </ButtonGroup>
            <Button onClick={toggleSettings}><GearFill /> Settings</Button>
          </Col>
        </Row>
        <Row className='mt-3'>
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
                      <td>{minutesToNearestHalfHours(t.duration)} h<br /><span className='text-secondary small'>({t.duration} minutes)</span></td>
                    </tr>
                  )}

                </tbody>
                <tfoot>
                  <tr>
                    <td>Total</td>
                    <td></td>
                    <td>{checkIns?.map(c => minutesToNearestHalfHours(c.duration!)).reduce((prev, curr) => prev! + curr!, 0)}
                      <br />
                      <span className='text-secondary small'>({minutesToNearestHalfHours(checkIns?.map(c => c.duration!).reduce((prev, curr) => prev + curr, 0)!)} actual)</span></td>
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
