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
    return <Card key={c.id} className={`mb-3 ${c.isActive ? "bg-success-subtle" : ""}`}>
        {c.isActive &&
            <Card.Header className="bg-success-subtle">
                <Badge bg="success">Active</Badge>
            </Card.Header>
        }
        <Card.Body>
            <Row>
                <Col sm={9} className="d-flex align-items-center justify-content-between">
                    <Card.Title className="d-flex mb-0">
                        <div className="d-flex align-items-center">
                            <div className="me-3">
                                {c.label}
                            </div>
                            <div>
                            <span className="text-secondary fs-6">
                                    {new Date(c.time).toLocaleTimeString()}
                                </span>
                            </div>


                        </div>



                    </Card.Title>
                    {c.duration && c.duration > 0 ?
                        <Card.Title className="mb-0">
                            {/* <span className="text-secondary fs-6">
                                    {new Date(c.time).toLocaleTimeString()}
                                </span> */}
                            <Badge className="ms-3" bg="primary">{c.duration} min</Badge>
                        </Card.Title>

                        : null
                    }
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