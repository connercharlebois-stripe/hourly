import { Badge, Button, ButtonGroup, Card, Col, Row } from "react-bootstrap";
import { ICheckIn } from "../types";
import { ArrowClockwise, Trash } from "react-bootstrap-icons";

type Props = {
    checkIn: ICheckIn,
    onDelete: (c: ICheckIn) => void,
    onReCheckIn: (s: string) => void
}
const CheckInListItem = (props: Props) => {
    const c = props.checkIn;
    return <Card key={c.id} className={`mb-3 ${c.isActive?"bg-success-subtle":""}`}>
        {c.isActive &&
            <Card.Header className="bg-success-subtle">
                <Badge bg="success">Active</Badge>
            </Card.Header>
        }
        <Card.Body>
            <Row>
                <Col sm={9}>
                    <Card.Title className="d-flex justify-content-between">
                        {c.label}

                        {c.duration && c.duration > 0 ?
                            <Badge bg="primary">{c.duration} min</Badge>
                            : null
                        }
                    </Card.Title>
                    <Card.Text className="text-muted small">
                    since {new Date(c.time).toLocaleTimeString()}
                    </Card.Text>
                </Col>
                <Col sm={3}>
                    <ButtonGroup>
                        <Button variant='danger' onClick={() => props.onDelete(c)}><Trash /></Button>
                        {!c.isActive &&
                            <Button variant="secondary" onClick={() => props.onReCheckIn(c.label)}><ArrowClockwise /></Button>
                        }
                    </ButtonGroup>
                </Col>
            </Row>
        </Card.Body>
        {/* <Card.Footer>
            since {new Date(c.time).toLocaleTimeString()}
        </Card.Footer> */}
    </Card>
}

export default CheckInListItem;