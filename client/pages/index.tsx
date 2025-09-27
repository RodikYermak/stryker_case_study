import React, { useEffect, useState } from 'react';

function Index() {
    const [message, setMessage] = useState('Loading');
    useEffect(() => {
        fetch('http://localhost:8080/')
            .then((response) => response.json())
            .then((data) => {
                // console.log(data);
                setMessage(data.message);
            });
    }, []);
    return <div>{message}</div>;
}

export default Index;
