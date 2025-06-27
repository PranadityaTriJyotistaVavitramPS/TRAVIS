import "../style/FAQ.css"

function FAQ() {
  return (
    <section className="faq-section">
      <div className="container">
        <div className="faq-header">
          <h2 className="display-5 fw-bold">Frequently Asked Questions</h2>
        </div>

        <div className="faq-cards-container">
          <div className="faq-cards">
                <h5>What is TRAVIS ?</h5>
                <p>TRAVIS or Traffic Violation & Surveillance System, is a smart dash camera system that scans and detect traffic marking violations automatically.</p>
            </div>
            <div className="faq-cards">
                <h5>What are the frameworks used in developing TRAVIS ?</h5>
                <p>Python, YoloV11, Tensorflow</p>

            </div>
            <div className="faq-cards">
                <h5>How does it work ?</h5>
                <p>The dash camera first tracks the users driving activity. When it detects the user crossing opposing traffic marks, the algorithm then sends a signal to the camera and screenshot the recorded violation, which would be sent to the server database</p>
            </div>

            <div className="faq-cards">
                <h5>What are the main components ?</h5>
                <p>TRAVIS uses an Orange Pi 3b as its storage / middle man, which connects data between the camera and the server database. It utilizes a dash camera to monitor and record activities.</p>
            </div>

            <div className="faq-cards">
                <h5>How much does it cost ?</h5>
                <p>As of right now, TRAVIS is in beta phase and not ready for commercial use.</p>

            </div>
            <div className="faq-cards">
                <h5>Why should you choose TRAVIS ?</h5>
                <p>
                  TRAVIS leverages AI and real-time detection to enhance road safety, automate traffic violation monitoring, and support smarter enforcement—making it a powerful tool for modern cities.
                </p>

            </div>
        </div>
      </div>
    </section>
  );
}

export default FAQ;
