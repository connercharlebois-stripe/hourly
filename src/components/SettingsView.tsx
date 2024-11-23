import { useEffect, useState } from "react";
import { Button, Form, InputGroup, ListGroup } from "react-bootstrap";
import { IUserSettings } from "../types";
import { Settings } from "../api/Settings";

type Props = {
    onRefresh: () => void
}

const SettingsView = (props: Props) => {
    const [settings, setSettings] = useState<IUserSettings>();
    useEffect(() => {
        setSettings(Settings.get())
    }, [])
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
            body: `Still working on XXX? (Dismiss to confirm)`
        });
    }
    const handleSaveSettings = async () => {
        if (settings){
            Settings.set(settings);
        }
        
    }
    return <div>
        <h4>Notifications</h4>
        <ListGroup>
            <ListGroup.Item>
                Request permissions to show notifications
                <Button onClick={handleAskNotificationPermission}>Request Permissions</Button>
            </ListGroup.Item>
            <ListGroup.Item>
                Show a test notification
                <Button onClick={handleShowNotification}>Show Notification</Button>
            </ListGroup.Item>
        </ListGroup>
        <h4 className='mt-3'>Time Tracking</h4>
        <ListGroup>
            <Form>
                <Form.Group className="mb-3">
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
        <h4 className='mt-3'>Debug</h4>
        <ListGroup>
            <ListGroup.Item>
                Manually refresh
                <Button onClick={props.onRefresh}>Refresh</Button>
            </ListGroup.Item>
        </ListGroup>
    </div>
}
export default SettingsView;