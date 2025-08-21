import React from "react";

interface Props {
  src: string;
  location: string;
  time: string;
}

const ImageWithLocation: React.FC<Props> = ({ src, location, time }) => {
  return (
    <div className="image-container">
      <img src={src} alt="foto-pelanggaran" className="gallery-image" />
      <div className="image-overlay">
        <p className="image-info"><b>{time}</b></p>
        <p className="image-info">{location}</p>
      </div>
    </div>
  );
};

export default ImageWithLocation;
