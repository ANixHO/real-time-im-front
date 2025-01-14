import {useCallback, useEffect, useState} from "react";
import useWebSocket, {ReadyState} from "react-use-websocket";
import {Button, Col, Container, Form, Row} from "react-bootstrap";


function SingleChat() {
    const [socketURL, setSocketURL] = useState('ws://127.0.0.1:9001/ws',);
    const [receiveMessageHistory, setReceiveMessageHistory] = useState([]);
    const [sendMessageHistory, setSendMessageHistory] = useState([]);
    const [messageHistory, setMessageHistory] = useState([]);
    const [userMessage, setUserMessage] = useState("");
    const [connectionState, setConnectionState] = useState("");

    const {sendMessage, lastMessage, readyState} = useWebSocket(socketURL,
        {
            // heartbeat: {
            //     message: 'ping',
            //     returnMessage: 'pong',
            //     timeout: 30000, // 1 minute, if no response is received, the connection will be closed
            //     interval: 15000, // every 25 seconds, a ping message will be sent
            // }
            // retryOnError: true,
            // shouldReconnect: () => true,
            // reconnectInterval: 3000,
            // reconnectAttempts: 10
        });

    useEffect(() => {
        if (lastMessage !== null) {
            console.log(lastMessage);
            setReceiveMessageHistory(prev => [...prev, lastMessage.data]);
            setMessageHistory(prev => [...prev, lastMessage.data]);
        }
    }, [lastMessage]);

    const handleClickSendMessage = useCallback((e) => {
            e.preventDefault();
            console.log(userMessage);
            if (userMessage.trim()) {
                sendMessage(userMessage);
                console.log(userMessage);
                setSendMessageHistory(prev => prev.concat(userMessage));
                setMessageHistory(prev => prev.concat(userMessage));
                setUserMessage("");
            }
        },
        [userMessage,sendMessage]
    );

    const connectionStatus = {
        [ReadyState.CONNECTING]: 'Connecting',
        [ReadyState.OPEN]: 'Open',
        [ReadyState.CLOSING]: 'Closing',
        [ReadyState.CLOSED]: 'Closed',
        [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
    }[readyState];

    useEffect(() => {
        const time = new Date().toDateString();
        setConnectionState("=>" +  connectionStatus + " [ " + time +"]");
    }, [connectionStatus]);

    return (
        <Container>
            <Row>
                <Col xs={7}>
                    <h2>Connection status: {connectionState}</h2>
                </Col>
            </Row>
            <Row>
                <Form onSubmit={handleClickSendMessage}>
                    <Col xs={5}>
                        <Form.Control
                            type={"text"}
                            // value={userMessage}
                            onChange={(e) => (setUserMessage(e.target.value))}
                        />
                    </Col>
                    <Col xs={2}>
                        <Button
                            type={"submit"}
                            variant={"outline-primary"}
                        >
                            Send
                        </Button>
                    </Col>
                </Form>
            </Row>
            <Row>
                <Col xs={7}>
                    {messageHistory ?
                        (messageHistory.slice().reverse().map((i, index) => (<p key={index}>{i}</p>))
                        ) : (
                            <p>No message history</p>)
                    }
                </Col>
            </Row>

        </Container>
    );
}

export default SingleChat;