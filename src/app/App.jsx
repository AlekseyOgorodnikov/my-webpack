import React from 'react';
import fort from 'public/fort.jpg'
import gif from 'public/gif.gif'
import bryzgi from 'public/Bryzgi.png'

function App() {
    return (
        <>
            <h1>Hello world</h1>
            <div className="box">
                <h2>CSS/SCSS/SASS/LESS</h2>
            </div>
            <div className="image-div">
                <img className="image" src={fort} alt="fort picture" />
                <img className="image" src={gif} alt="gif picture"/>
                <img className="image" src={bryzgi} alt="bryzgi picture"/>
            </div>
        </>
    )
}
export default App;