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

    const messages = require('../proto/message_pb');

    const ping = new messages.Message().setType(messages.Message.ContentType.PING_SIGNAL).serializeBinary();
    // const pong = new Blob(new messages.Message().setType(messages.Message.ContentType.PONG_SIGNAL).serializeBinary());


    const {sendMessage, lastMessage, readyState} = useWebSocket(socketURL,
        {
            heartbeat: {
                message: ping,
                returnMessage: 'pong',
                timeout: 30000, // 1 minute, if no response is received, the connection will be closed
                interval: 15000, // every 15 seconds, a ping message will be sent
            },
            retryOnError: true,
            shouldReconnect: () => true,
            reconnectInterval: 3000,
            reconnectAttempts: 10
        });

    useEffect(() => {
        if (lastMessage !== null) {
            lastMessage.data.arrayBuffer().then(arrayBuffer => {
                let bytes = new Uint8Array(arrayBuffer);
                let receivedMessage = new messages.Message.deserializeBinary(bytes);
                if (receivedMessage.getType() !== messages.Message.ContentType.PONG_SIGNAL) {
                    let receivedData = 'response:' + receivedMessage.getContent();
                    setReceiveMessageHistory(prev => [...prev, receivedData]);
                    setMessageHistory(prev => [...prev, receivedData]);
                } else {
                    console.log("get pong from message");
                }

            });
        }
    }, [lastMessage, messages]);

    const handleClickSendMessage = useCallback((e) => {
            e.preventDefault();
            if (userMessage.trim()) {
                let message = new messages.Message();
                message.setType(messages.Message.ContentType.PRIVATE_CHAT);
                message.setSenderid("1");
                message.setChatid("1");
                message.setContent(userMessage);
                let binaryData = message.serializeBinary();

                sendMessage(binaryData);

                setSendMessageHistory(prev => prev.concat(userMessage));
                setMessageHistory(prev => prev.concat(userMessage));
                setUserMessage("");
            }
        },
        [userMessage, sendMessage, messages]
    );

    const connectionStatus = {
        [ReadyState.CONNECTING]: 'Connecting',
        [ReadyState.OPEN]: 'Open',
        [ReadyState.CLOSING]: 'Closing',
        [ReadyState.CLOSED]: 'Closed',
        [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
    }[readyState];

    useEffect(() => {
        if (connectionStatus === "Open") {
            let addUserChannel = new messages.Message();
            addUserChannel.setType(messages.Message.ContentType.ADD_USER_CHANNEL);
            addUserChannel.setSenderid("1");
            let addUserChannelMessage = addUserChannel.serializeBinary();
            sendMessage(addUserChannelMessage);
        }
        const time = new Date().toDateString();
        setConnectionState("=>" + connectionStatus + " [ " + time + "]");
    }, [connectionStatus]);

    return (
        <Container>
            <Row className={"justify-content-center"}>
                <Col xs={7}>
                    <h2>Connection status: {connectionState}</h2>
                </Col>
            </Row>
            <Row>
                <Form onSubmit={handleClickSendMessage}>
                    <Col xs={5}>
                        <Form.Control
                            type={"text"}
                            value={userMessage}
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