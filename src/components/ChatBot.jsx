import { useState } from 'react';

const Chatbot = () => {
    const [query, setQuery] = useState('');
    const [response, setResponse] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); // Reset error state
        setResponse(''); // Reset response state

        try {
            const res = await fetch('http://localhost:8080/chatbot/generateContent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query }),
            });

            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }

            const data = await res.json();
            console.log('API Response:', data); // Log the full response for debugging
            const text = data.contents?.[0]?.parts?.[0]?.text || "No answer received.";
            setResponse(text);
        } catch (error) {
            console.error('Error:', error); // Log the full error
            setError(`Error: ${error.message}`);
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Ask about first aid in a war environment"
                />
                <button type="submit">Send</button>
            </form>
            {response && <div><strong>Response:</strong> {response}</div>}
            {error && <div style={{ color: 'red' }}><strong>{error}</strong></div>}
        </div>
    );
};

export default Chatbot;
