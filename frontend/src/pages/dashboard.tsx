import { useState, useEffect,useRef } from 'react';
import { GoogleMap, LoadScript } from '@react-google-maps/api';
import axios from 'axios';
import "../style/dashboard.css"

const containerStyle = {
  width: '100%',
  height: '700px'
};

const surabayaCenter = {
  lat: -7.250445,
  lng: 112.768845
};

const surabayaBounds = {
  north: -7.1192976,
  south: -7.4245334,
  west: 112.4841046,
  east: 112.9325514
};

const libraries: ("geometry")[] = ['geometry'];

const Dashboard = () => {
  const [geoJsonLoaded, setGeoJsonLoaded] = useState(false); // false = Surabaya, true = Indonesia
  const [mapRef, setMapRef] = useState<any>(null);
  const [photoData, setPhotoData] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [filteredPhotos, setFilteredPhotos] = useState<any[] | null>(null);
  const photoDataRef = useRef<any[]>([]);


  const itemsPerPage = 8;
  console.log("Photo data di awal:", photoData);
  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const res = await axios.get(`https://${import.meta.env.VITE_BACKEND_DOMAIN}/api/v1/photos/takeAllEvidence`);
        if (res.data?.data) {
          setPhotoData(res.data.data);
          photoDataRef.current = res.data.data; // Store in ref for later use
        }
      } catch (error) {
        console.error("Failed to fetch photos:", error);
      }
    };

    fetchPhotos();
  }, []);


const loadGeoJson = (map: any, isIndonesia: boolean) => {
  map.data.forEach((feature: any) => map.data.remove(feature)); // Clear existing
  const geoPath = isIndonesia ? '/maps/indonesia.geojson' : '/maps/surabaya1.geojson';

  map.data.loadGeoJson(geoPath, null, () => {
    map.data.forEach((feature: any) => {
      const geometry = feature.getGeometry();
      const paths: google.maps.LatLngLiteral[][] = [];

      const processGeometry = (geom: any) => {
        const rings = geom.getArray();
        rings.forEach((ring: any) => {
          const ringCoords = ring.getArray().map((latLng: any) => ({
            lat: latLng.lat(),
            lng: latLng.lng(),
          }));
          paths.push(ringCoords);
        });
      };
      processGeometry(geometry);

      // Count how many photos are inside this polygon
      let count = 0;
      const polygon = new google.maps.Polygon({ paths });
      photoDataRef.current.forEach((photo) => {
        const point = new google.maps.LatLng(parseFloat(photo.latitude), parseFloat(photo.longitude));
        if (google.maps.geometry.poly.containsLocation(point, polygon)) {
          count++;
        }
      });

      feature.setProperty('evidenceCount', count);
    });

    // Set conditional style after setting evidenceCount
    map.data.setStyle((feature: any) => {
      const count = feature.getProperty('evidenceCount');
      let color = '#00FF00'; // green
      if (count === 1) color = '#FFFF00'; // yellow
      else if (count > 1) color = '#FF0000'; // red

      return {
        fillColor: color,
        strokeColor: 'black',
        strokeWeight: 2,
        fillOpacity: 0.5
      };
    });
  });

  map.data.addListener('mouseover', (event: any) => {
    map.data.overrideStyle(event.feature, { fillOpacity: 0.8 });
  });

  map.data.addListener('mouseout', () => {
    map.data.revertStyle(); // revert to evidence color
  });

  map.data.addListener('click', (event: any) => {
    const name = event.feature.getProperty('Kecamatan') || 'Unknown';
    setSelectedDistrict(name);

    const geometry = event.feature.getGeometry();
    const paths: google.maps.LatLngLiteral[][] = [];

    const processGeometry = (geom: any) => {
      const rings = geom.getArray();
      rings.forEach((ring: any) => {
        const ringCoords = ring.getArray().map((latLng: any) => ({
          lat: latLng.lat(),
          lng: latLng.lng(),
        }));
        paths.push(ringCoords);
      });
    };
    processGeometry(geometry);

    const filtered = photoDataRef.current.filter((photo) => {
      const point = new google.maps.LatLng(parseFloat(photo.latitude), parseFloat(photo.longitude));
      return paths.some((ring) =>
        google.maps.geometry.poly.containsLocation(point, new google.maps.Polygon({ paths: [ring] }))
      );
    });

    setFilteredPhotos(filtered);
    setCurrentPage(1);
  });

  if (isIndonesia) {
    map.setOptions({ restriction: null });
    map.setZoom(5);
    map.setCenter({ lat: -2.5489, lng: 118.0149 });
  } else {
    map.setOptions({
      restriction: {
        latLngBounds: surabayaBounds,
        strictBounds: true,
      },
    });

    map.setZoom(12);
    map.setCenter(surabayaCenter);
  }
};



  const toggleGeoJson = () => {
    const newState = !geoJsonLoaded;
    setGeoJsonLoaded(newState);
    if (mapRef) loadGeoJson(mapRef, newState);
  };

  const onLoad = (map: any) => {
    setMapRef(map);
    loadGeoJson(map, geoJsonLoaded);
  };

  const photosToShow = filteredPhotos ?? photoData;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPhotos = photosToShow.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(photosToShow.length / itemsPerPage);

  return (
    <div className='dashboard-main-container'>
      <div className="button-container">
        <button onClick={toggleGeoJson}>
          {geoJsonLoaded ? 'Show Surabaya' : 'Show Indonesia'}
        </button>
      </div>

      <div className='map-container'>    
        <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
          libraries={libraries}>
            <GoogleMap
            mapContainerStyle={containerStyle}
            center={surabayaCenter}
            zoom={12}
            onLoad={onLoad}
            options={
              geoJsonLoaded
              ? {} 
              : {
                  restriction: {
                    latLngBounds: surabayaBounds,
                    strictBounds: true,
                  }
                }
            }
            />
        </LoadScript>
      </div>

      {selectedDistrict && (
          <h2 className="selected-district-title">
            Kecamatan: {selectedDistrict}
          </h2>
        )
      }


      <div className="image-gallery">
        {currentPhotos.map((photo) => (
          <ImageWithLocation
            key={photo.id_foto}
            src={photo.url}
            location={`Lat: ${photo.latitude}, Lng: ${photo.longitude}`}
            time={new Date(photo.date).toLocaleDateString('id-ID', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
            Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              className={currentPage === i + 1 ? 'active' : ''}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
          <button onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>
            Next
          </button>
        </div>
      )}
    </div>
  );
};

const ImageWithLocation = ({ src, location, time }: { src: string; location: string; time: string }) => {
  return (
    <div className="image-container">
      <img src={src} alt="location" className="gallery-image" />
      <div className="image-overlay">
        <p className="image-info">{location}</p>
        <p className="image-info">{time}</p>
      </div>
    </div>
  );
};

export default Dashboard;
