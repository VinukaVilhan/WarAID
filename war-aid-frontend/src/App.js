import React from 'react';
import LocationForm from './components/LocationForm';
import ResourceMap from './components/ResourceMap';

function App() {
    return (
        <div className="App">
            <h1>War Aid Resource Locator</h1>
            <LocationForm />
            <ResourceMap />
        </div>
    );
}

export default App;
