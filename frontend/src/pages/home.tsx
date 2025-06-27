
import "../style/home.css"
import homePagePhoto from "../assets/images/street.jpg"
import FAQ from "../components/FAQ"
import Merit from "../components/merit"

function Home(){
    return(  
        <>    
            <div className="home-main-container">
              <h1>Traffic. Violation. Surveillance. System</h1>
              <p className="subheader" style={{ textAlign: 'center' }}>
                Automatically detect traffic-marking violations in real time and
                visualize recurring hotspots with dynamic heatmaps—empowering you with actionable analytics and unparalleled road-safety intelligence.
              </p>
              <img className="street-photo" src={homePagePhoto}/>
              <Merit/>
              <FAQ/>
            </div>
        
        </>  
    )
}

export default Home