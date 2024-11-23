import { useEffect, useState } from "react";
import { Button, Col, Form, InputGroup, ListGroup, Row } from "react-bootstrap";
import { IUserSettings } from "../types";
import { Settings } from "../api/Settings";

type Props = {
    onRefresh: () => void
}

const SettingsView = (props: Props) => {
    const [settings, setSettings] = useState<IUserSettings>();
    const [granted, setGranted] = useState(false);
    useEffect(() => {
        setSettings(Settings.get())
        setGranted(Notification.permission === "granted")
    }, [])
    const handleAskNotificationPermission = () => {
        try {
            Notification.requestPermission().then();
        } catch (e) {
            console.error("no permission")
            setGranted(false);
        }
        console.log("permission!")
        setGranted(true);
    }
    const handleShowNotification = () => {
        const n = new Notification("Time to Check In", {
            body: `Hurrah! It's working!`
        });
    }
    const handleSaveSettings = async () => {
        if (settings) {
            Settings.set(settings);
        }

    }
    return <div>
        <h4>Notifications</h4>
        <p className="mb-2">Notifications permission is required in order to sample your working time.</p>
        <ListGroup>
            <ListGroup.Item >
                <div className="d-flex">
                    <div className="w-100">Notifications permission</div>
                    <div className="flex-shrink-1"><Form.Check
                        type="switch"
                        checked={granted}
                        onChange={handleAskNotificationPermission} /></div>
                </div>
                <Row className="mt-2">
                    <Col xs={12} className="text-muted small">
                    <a className="text-link" href="#" onClick={handleShowNotification}>Show a test notification</a> to make sure it's working correctly.
                    </Col>
                    
                </Row>

            </ListGroup.Item>

        </ListGroup>

        <h4 className='mt-3'>Time Tracking</h4>
        <ListGroup>
            <Form>
                <Form.Group>
                    <Form.Label>Working Day End</Form.Label>
                    <InputGroup>
                        <Form.Control
                            type={"time"}
                            value={settings?.workingDayEnd.raw ?? ""}
                            onChange={(e) => {
                                setSettings({
                                    ...settings,
                                    workingDayEnd: {
                                        raw: e.target.value,
                                        hh: parseInt(e.target.value.split(':')[0]),
                                        mm: parseInt(e.target.value.split(':')[1]),
                                    }
                                })
                            }}
                        />
                        <Button onClick={handleSaveSettings}>Save</Button>
                    </InputGroup>

                    <Form.Text>
                        {JSON.stringify(settings?.workingDayEnd)}
                    </Form.Text>
                </Form.Group>
            </Form>
        </ListGroup>
        <h4 className='mt-3'>Debugging</h4>
        <ListGroup>
            <ListGroup.Item className="d-flex justify-content-between align-items-center">
                Manually refresh
                <Button variant="link" onClick={props.onRefresh}>Refresh</Button>
            </ListGroup.Item>
        </ListGroup>
    </div>
}
export default SettingsView;