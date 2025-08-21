import { useEffect,useState, useRef } from "react";
import maplibregl, { Map } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import "../style/dashboard.css";
import ImageWithLocation from "../components/Card";


export default function IndonesiaMap() {
  const mapRef = useRef<Map | null>(null);

  const [photos, setPhotos] = useState<any[]>([]);
  const [selectedArea, setSelectedArea] = useState<string>("");
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);
  const [level, setLevel] = useState<string>(""); 
  const [gid, setGid] = useState<string>(""); 

  const fetchPhotos = async (level: string, gid: string, dir: "next" | "prev" | null = null) => {
    const url = `https://${import.meta.env.VITE_BACKEND_DOMAIN}/api/v1/photos/takeAllEvidence?level=${level}&gid=${gid}&limit=8${
      dir === "next" && cursor ? `&cursor=${cursor}` : ""
    }${dir === "prev" && cursor ? `&prevCursor=${cursor}` : ""}`;

    const res = await fetch(url);
    const json = await res.json();
    console.log("Ini panjang datanya", json.data.length);

    if (!json.data || json.data.length === 0) {
      setPhotos([]);
      setCursor(null);
      setHasNext(false);
      setHasPrev(false);
      return;
    }

    setPhotos(json.data);
    setCursor(json.pagination.nextCursor || null);
    setHasNext(!!json.pagination.nextCursor);
    setHasPrev(!!json.pagination.prevCursor);
  };



  useEffect(() => {
    const map = new maplibregl.Map({
      container: "map",
      center: [117, -2],
      zoom: 4,
      style: {
        version: 8,
      sources: {
        provinsi: {
          type: "vector",
          tiles: ["http://localhost:8080/data/indonesia1/{z}/{x}/{y}.pbf"],
          minzoom: 0,
          maxzoom: 7,
          promoteId: "GID_1"
        } as any,
        kabupaten: {
          type: "vector",
          tiles: ["http://localhost:8080/data/indonesia2/{z}/{x}/{y}.pbf"],
          minzoom: 7,
          maxzoom: 10,
          promoteId: "GID_2"
        } as any,
        kecamatan: {
          type: "vector",
          tiles: ["http://localhost:8080/data/indonesia3/{z}/{x}/{y}.pbf"],
          minzoom: 10,
          maxzoom: 24,
          promoteId: "GID_3"
        } as any
      },
        layers: [
          // provinsi
          {
            id: "provinsi-fill",
            type: "fill",
            source: "provinsi",
            "source-layer": "gadm41_IDN_1",
            paint: {
              "fill-color": [
                "case",
                ["==", ["feature-state", "count"], 0], "#4cbb17",  // hijau
                ["==", ["feature-state", "count"], 1], "#FFD700",  // kuning
                [">=", ["feature-state", "count"], 5], "#780606",  // merah
                "#cccccc"
              ],
              "fill-opacity": 0.5
            },
            minzoom: 0,
            maxzoom: 7
          },
          {
            id: "provinsi-outline",
            type: "line",
            source: "provinsi",
            "source-layer": "gadm41_IDN_1",
            paint: { "line-color": "#000000", "line-width": 1 },
            minzoom: 0,
            maxzoom: 7
          },

          // kabupaten
          {
            id: "kabupaten-fill",
            type: "fill",
            source: "kabupaten",
            "source-layer": "gadm41_IDN_2",
            paint: {
              "fill-color": [
                "case",
                ["==", ["feature-state", "count"], 0], "#4cbb17",
                ["==", ["feature-state", "count"], 1], "#FFD700",
                [">=", ["feature-state", "count"], 5], "#780606",
                "#cccccc"
              ],
              "fill-opacity": 0.5
            },
            minzoom: 7,
            maxzoom: 10
          },
          {
            id: "kabupaten-outline",
            type: "line",
            source: "kabupaten",
            "source-layer": "gadm41_IDN_2",
            paint: { "line-color": "#000000", "line-width": 1 },
            minzoom: 7,
            maxzoom: 10
          },

          // kecamatan
          {
            id: "kecamatan-fill",
            type: "fill",
            source: "kecamatan",
            "source-layer": "gadm41_IDN_3",
            paint: {
              "fill-color": [
                "case",
                ["==", ["feature-state", "count"], 0], "#4cbb17",
                ["==", ["feature-state", "count"], 1], "#FFD700",
                [">=", ["feature-state", "count"], 3], "#780606",
                "#cccccc"
              ],
              "fill-opacity": 0.6
            },
            minzoom: 10
          },
          {
            id: "kecamatan-outline",
            type: "line",
            source: "kecamatan",
            "source-layer": "gadm41_IDN_3",
            paint: { "line-color": "#000000", "line-width": 1 },
            minzoom: 10
          }
        ]
      }
    });

    // event load → set feature state
    map.on("load", async () => {
      try {
        // provinsi
        const resProv = await fetch(`https://${import.meta.env.VITE_BACKEND_DOMAIN}/api/v1/photos/sumevidenceprovince`);
        const prov = await resProv.json();
        prov?.data?.forEach((row: any) => {
          map.setFeatureState(
            { source: "provinsi", sourceLayer: "gadm41_IDN_1", id: row.id },
            { count: row.count }
          );
        });

        // kabupaten
        const resKab = await fetch(`https://${import.meta.env.VITE_BACKEND_DOMAIN}/api/v1/photos/sumevidencedistrict`);
        const kab = await resKab.json();
        kab?.data?.forEach((row: any) => {
          map.setFeatureState(
            { source: "kabupaten", sourceLayer: "gadm41_IDN_2", id: row.id },
            { count: row.count }
          );
        });

        // kecamatan
        const resKec = await fetch(`https://${import.meta.env.VITE_BACKEND_DOMAIN}/api/v1/photos/sumevidencesubdistrict`);
        const kec = await resKec.json();
        kec?.data?.forEach((row: any) => {
          map.setFeatureState(
            { source: "kecamatan", sourceLayer: "gadm41_IDN_3", id: row.id },
            { count: row.count }
          );
        });
      } catch (err) {
        console.error("Gagal fetch evidence:", err);
      }
    });

    map.on("click", "provinsi-fill", async (e) => {
      const f = e.features?.[0];
      if (!f) return;

      const gid = f.properties?.GID_1;
      const name = f.properties?.NAME_1;
      const st = map.getFeatureState({ source: "provinsi", sourceLayer: "gadm41_IDN_1", id: gid });
      new maplibregl.Popup()
        .setLngLat(e.lngLat)
        .setHTML(`
          <div style="font-weight:600">Provinsi: ${name || "?"}</div>
          <div style="margin-top:4px">Evidence: ${st?.count ?? 0}</div>
        `)
        .addTo(map);
      setSelectedArea(name);
      setLevel("provinsi");
      setGid(gid);
      await fetchPhotos("provinsi", gid);
    });

    map.on("click", "kabupaten-fill", async(e) => {
      const f = e.features?.[0];
      if (!f) return;

      const gid = f.properties?.GID_2;
      const name = f.properties?.NAME_2;
      const st = map.getFeatureState({ source: "kabupaten", sourceLayer: "gadm41_IDN_2", id: gid });
      new maplibregl.Popup()
        .setLngLat(e.lngLat)
        .setHTML(`
          <div style="font-weight:600">Kota/Kabupaten: ${name || "?"}</div>
          <div style="margin-top:4px">Evidence: ${st?.count ?? 0}</div>
        `)
        .addTo(map);

      setSelectedArea(name);
      setLevel("kabupaten");
      setGid(gid);
      await fetchPhotos("kabupaten", gid);
    });

    map.on("click", "kecamatan-fill", async (e) => {
      const f = e.features?.[0];
      if (!f) return;

      const gid = f.properties?.GID_3;
      const name = f.properties?.NAME_3;
      const st = map.getFeatureState({ source: "kecamatan", sourceLayer: "gadm41_IDN_3", id: gid });

      new maplibregl.Popup()
      .setLngLat(e.lngLat)
      .setHTML(`
        <div style="font-weight:600">Kecamatan:${name || "?"}</div>
        <div style="margin-top:4px">Evidence: ${st?.count ?? 0}</div>
      `)
      .addTo(map);

      setSelectedArea(name);
      setLevel("kecamatan");
      setGid(gid);
      await fetchPhotos("kecamatan", gid);
    });

    mapRef.current = map;
    return () => map.remove();
  }, []);

  console.log(photos)
  return (
    <div className="dashboard-container">
      <div id="map" className="map-box" />
      <div className="foto-pelanggaran-wrap">
        <h2>Foto Pelanggaran {selectedArea && `(${selectedArea})`}</h2>

        <div className="foto-pelanggaran-list">
          {photos.length > 0 ? (
            photos.map((foto, idx) => (
              <ImageWithLocation
                key={idx}
                src={foto.url}
                location={`Lat: ${foto.latitude}, Lng: ${foto.longitude}`}
                time={new Date(foto.date).toLocaleDateString("id-ID", {
                  year: "numeric",
                  month: "long",
                  day: "numeric"
                })}
              />
            ))
          ) : (
            <i>Tidak ada foto pelanggaran</i>
          )}
        </div>

        <div className="pagination-controls">
          <button className="pagination-button" disabled={!hasPrev} onClick={() => fetchPhotos(level, gid, "prev")}>Prev</button>
          <button className="pagination-button" disabled={!hasNext} onClick={() => fetchPhotos(level, gid, "next")}>Next</button>
        </div>
      </div>
    </div>
  );
}
