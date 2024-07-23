"use client";
import { useEffect, useRef, useState } from 'react';
import styles from './Editor.module.css';

const Editor = () => {
  const [content, setContent] = useState('');
  const [users, setUsers] = useState([]);
  const [username, setUsername] = useState('');
  const [isPromptVisible, setPromptVisible] = useState(true);
  const ws = useRef(null);
  const messageQueue = useRef([]);

  useEffect(() => {
    if (username) {
      ws.current = new WebSocket('ws://localhost:3001');

      ws.current.onopen = () => {
        console.log('WebSocket connection established');
        // Send the username to the server
        ws.current.send(JSON.stringify({ type: 'SET_USERNAME', username }));
        // Send all queued messages once the connection is open
        while (messageQueue.current.length > 0) {
          ws.current.send(messageQueue.current.shift());
        }
      };

      ws.current.onclose = (event) => {
        console.log('WebSocket connection closed:', event);
      };

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      ws.current.onmessage = (event) => {
        let data;
        try {
          data = JSON.parse(event.data);
        } catch (error) {
          console.error('Invalid JSON:', error);
          return;
        }

        if (data.type === 'content') {
          setContent(data.content);
        } else if (data.type === 'USER_LIST') {
          setUsers(data.activeUsers); // Update to match server response
        }
      };

      return () => {
        if (ws.current) {
          // Queue the disconnect message
          if (ws.current.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify({ type: 'DISCONNECT' }));
          } else {
            messageQueue.current.push(JSON.stringify({ type: 'DISCONNECT' }));
          }
          ws.current.close();
        }
      };
    }
  }, [username]);

  const handleChange = (e) => {
    const value = e.target.value;
    setContent(value);
    const message = JSON.stringify({ type: 'content', content: value });

    if (ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(message);
    } else {
      messageQueue.current.push(message);
    }
  };

  const handleUsernameSubmit = (e) => {
    e.preventDefault();
    if (username.trim()) {
      setPromptVisible(false);
    }
  };

  return (
    <div className={styles.container}>
      {isPromptVisible ? (
        <form className={styles.form} onSubmit={handleUsernameSubmit}>
          <label>
            Enter your name : {''}
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </label>
          <button type="submit">Start</button>
        </form>
      ) : (
        <>
          <h1>Your name - {username}</h1>
          <textarea
            className={styles.editor}
            value={content}
            onChange={handleChange}
          />
          <div className={styles.userList}>
            <h4>Active Users:</h4>
            <ul>  
              {users.map((user, index) => (
                <li key={index}>{user}</li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
};

export default Editor;
