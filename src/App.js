import "./App.css";
import { useState } from "react";
import {
  AppBar,
  CircularProgress,
  Grid,
  Toolbar,
  Typography,
  Button,
} from "@material-ui/core";

const toDataURL = (url) =>
  fetch(url)
    .then((response) => response.blob())
    .then(
      (blob) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        })
    );

const makeblob = function (dataURL) {
  var BASE64_MARKER = ";base64,";
  if (dataURL.indexOf(BASE64_MARKER) === -1) {
    var parts = dataURL.split(",");
    var contentType = parts[0].split(":")[1];
    var raw = decodeURIComponent(parts[1]);
    return new Blob([raw], { type: contentType });
  }
  parts = dataURL.split(BASE64_MARKER);
  contentType = parts[0].split(":")[1];
  raw = window.atob(parts[1]);
  var rawLength = raw.length;

  var uInt8Array = new Uint8Array(rawLength);

  for (var i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i);
  }

  return new Blob([uInt8Array], { type: contentType });
};

function App() {
  let [image, setImage] = useState("");
  let [faceDetails, setFaceDetails] = useState("");

  async function updateImage(event) {
    let imageURL = URL.createObjectURL(event.target.files[0]);
    setImage(<CircularProgress color="secondary" />);

    let fetchOptions = {};
    await toDataURL(imageURL).then((res) => {
      fetchOptions = {
        method: "POST",
        headers: {
          "Ocp-Apim-Subscription-Key": "ad9600c0f5a344f0a6c61fc647b2d39d",
          "Content-Type": "application/octet-stream",
          "Process-Data": "false",
        },
        body: makeblob(res),
      };
    });

    let fetchedData = [];
    let coordinates = [
      <div className="Slogan">
        <Typography variant="h4">Face detection results</Typography>
      </div>,
    ];
    let processedRectangles = [];
    await fetch(
      "https://22bed5d36ed14f6b8d67da26dee3804c.cognitiveservices.azure.com/face/v1.0/detect?overload=stream",
      fetchOptions
    )
      .catch((err) => console.log(err))
      .then((res) => res.json())
      .then((res) => (fetchedData = res));
    if (fetchedData.length) {
      for (let element of fetchedData) {
        console.log(element.faceRectangle);
        processedRectangles.push(
          <div
            style={{
              position: "absolute",
              top: element.faceRectangle.top,
              left: element.faceRectangle.left,
              height: element.faceRectangle.height,
              width: element.faceRectangle.width,
              border: "solid blue 3px",
              userSelect: "none",
            }}
          ></div>
        );

        coordinates.push(
          <div>
            <p>
              Face {fetchedData.indexOf(element) + 1} detected at [
              {element.faceRectangle.top},{element.faceRectangle.left},
              {element.faceRectangle.height},{element.faceRectangle.width}]
            </p>
          </div>
        );
      }
    }

    processedRectangles.push(<img src={imageURL} alt="failsafe" />);

    setImage(processedRectangles.map((thing) => thing));
    setFaceDetails(coordinates.map((value) => value));
  }

  return (
    <div className="App">
      <div>
        <AppBar position="fixed">
          <Toolbar>
            <Grid
              justify="space-between" // Add it here :)
              container
              spacing={24}
              alignItems="center"
            >
              <Grid item>
                <Typography variant="h2">face-detect</Typography>
              </Grid>
              <Grid item>
                <Button variant="contained" component="label" color="secondary">
                  Analyze an image
                  <input type="file" onChange={updateImage} hidden />
                </Button>
              </Grid>
            </Grid>
          </Toolbar>
        </AppBar>
        <Toolbar />
      </div>

      <div className="BackgroundSet">
        <div className="Content">
          <div className="Slogan">
            <Typography variant="h3">Detecting faces accurately since 2021.</Typography>
          </div>
          <div className="ImageContainer">{image}</div>
          <div>{faceDetails}</div>
        </div>
        <div className="Footer">©face-detect 2021. All rights reserved.</div>
      </div>
    </div>
  );
}

export default App;
