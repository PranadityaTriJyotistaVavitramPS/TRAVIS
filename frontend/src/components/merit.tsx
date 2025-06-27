import "../style/merit.css"

function Merit() {
  return (
    <section className="product-merits" style={{margin: '120px auto'}}>
        <div className="container">
            <div className="row">
                <div className="merit-card">
                    <h4 className="content-title">
                        🚀 Real-Time Performance
                    </h4>
                    <p className="content-text">
                        Experience seamless real time interactions, ensuring a smooth and efficient user experience.
                    </p>
                </div>

                <div className="merit-card">
                    <h4 className="content-title">
                        💡 Enhanced Accuracy
                    </h4>

                    <p className="content-text">
                        Integrated with advanced algorithms and computer vision to ensure precise and accurate detections.
                    </p>
                </div>
      
                <div className="merit-card">
                    <h4 className="content-title">
                        🌐 User-Friendly Interface
                    </h4>
                    <p className="content-text">
                        Intuitive design that makes navigation and usage effortless for users of all levels.
                    </p>
                </div>
            </div>
        </div>
    </section>
  );
}

export default Merit;
