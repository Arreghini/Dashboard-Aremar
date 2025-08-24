import { useState } from 'react';

export default function Chat() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);

  const sendMessage = async () => {
    const newMsg = { role: 'user', content: input };
    setMessages([...messages, newMsg]);

    const response = await fetch('http://localhost:3001/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
        messages: [...messages, newMsg],
      }),
    });

    const data = await response.json();
    const reply = { role: 'assistant', content: data.choices?.[0]?.message?.content || 'Error' };
    setMessages([...messages, newMsg, reply]);
    setInput('');
  };

  return (
    <div>
      <div style={{ minHeight: '300px', border: '1px solid black', padding: '10px' }}>
        {messages.map((m, i) => (
          <div key={i}><b>{m.role}:</b> {m.content}</div>
        ))}
      </div>
      <input value={input} onChange={e => setInput(e.target.value)} />
      <button onClick={sendMessage}>Enviar</button>
    </div>
  );
}
